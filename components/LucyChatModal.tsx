import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { User, AnyEvent, Service, Post, Venue, LucyConversation, LucyChatMessage, ServiceCategory, EventType } from '../types';
import { PaperAirplaneIcon, PaperClipIcon, XCircleIcon, LucyIcon, ChevronDownIcon } from './icons';
import { GoogleGenAI, GenerateContentResponse, Modality } from '@google/genai';

const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

interface LucyChatViewProps {
    onClose: () => void;
    currentUser: User | null;
    conversation: LucyConversation;
    onSaveConversation: (conversation: LucyConversation) => void;
    allConversations: LucyConversation[];
    onSelectConversation: (conversation: LucyConversation) => void;
    onNewConversation: () => void;
    // App data for context
    events: AnyEvent[];
    services: Service[];
    posts: Post[];
    venuesMap: Map<string, Venue>;
}

interface LucyChatModalProps extends LucyChatViewProps {
    isOpen: boolean;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// FIX: This helper function now correctly handles all event types by checking the `type` property, preventing errors when accessing date information.
const getEventDates = (event: AnyEvent): string[] => {
    if (event.type === EventType.Milonga) return [event.date];
    if (event.type === EventType.Class) return event.sessions.map(s => s.date);
    return event.dates;
};


const LucyChatView: React.FC<LucyChatViewProps> = ({ onClose, currentUser, conversation, onSaveConversation, allConversations, onSelectConversation, onNewConversation, events, services, posts, venuesMap }) => {
    const { t, locale } = useLanguage();
    const [messages, setMessages] = useState<LucyChatMessage[]>(conversation.messages);
    const [input, setInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [historyOpen, setHistoryOpen] = useState(false);
    const historyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages(conversation.messages);
    }, [conversation.id]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
                setHistoryOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleBack = () => {
        if (messages.length > 1) { // Only save if there's more than the initial welcome message
            let finalTitle = conversation.title;
            if (finalTitle === 'New Chat with Lucy' && messages.length > 1) {
                finalTitle = messages.find(m => m.role === 'user')?.text?.substring(0, 30) || 'Untitled Chat';
            }
            const updatedConversation = { ...conversation, messages, title: finalTitle, lastUpdatedAt: new Date().toISOString() };
            onSaveConversation(updatedConversation);
        }
        onClose();
    };

    const searchAppData = (query: string): string => {
        const lowerQuery = query.toLowerCase();
        
        const getTodayKSTString = () => {
            const now = new Date();
            const kstDateTimeString = now.toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' });
            return kstDateTimeString.split(' ')[0];
        };
        const todayStr = getTodayKSTString();
        
        let contextParts: string[] = [];

        // Search Events
        let relevantEvents = events;
        let dateFiltered = false;

        if (lowerQuery.includes('오늘') || lowerQuery.includes('today')) {
            relevantEvents = relevantEvents.filter(e => getEventDates(e).includes(todayStr));
            dateFiltered = true;
        }
        
        const regions = Array.from(venuesMap.values()).map(v => v.region);
        const uniqueRegions = [...new Set(regions)];

        let regionFiltered = false;
        uniqueRegions.forEach(region => {
            if (lowerQuery.includes(region.toLowerCase()) || lowerQuery.includes(region.replace('서울 ', '').toLowerCase())) {
                relevantEvents = relevantEvents.filter(e => {
                    const venue = e.venueId ? venuesMap.get(e.venueId) : null;
                    return venue && venue.region === region;
                });
                regionFiltered = true;
            }
        });

        if (!dateFiltered && !regionFiltered) {
            const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 1 && w.length < 10);
            if (queryWords.length > 0) {
                 relevantEvents = relevantEvents.filter(event => {
                    const venue = event.venueId ? venuesMap.get(event.venueId) : null;
                    const textToSearch = [ event.title, event.description, venue?.name || '' ].join(' ').toLowerCase();
                    return queryWords.some(word => textToSearch.includes(word));
                });
            } else {
                relevantEvents = [];
            }
        }
        
        if (dateFiltered || regionFiltered || (relevantEvents.length > 0 && relevantEvents.length < events.length / 2)) {
             if (relevantEvents.length > 0) {
                contextParts.push('## Relevant Events Found in App:');
                relevantEvents.sort((a,b) => getEventDates(a)[0].localeCompare(getEventDates(b)[0]));
                
                relevantEvents.slice(0, 5).forEach(event => {
                    const venue = event.venueId ? venuesMap.get(event.venueId) : null;
                    contextParts.push(`- Event: ${event.title}`);
                    contextParts.push(`  - Date(s): ${getEventDates(event).join(', ')}`);
                    if ('startTime' in event) contextParts.push(`  - Time: ${event.startTime} - ${event.endTime}`);
                    if (venue) contextParts.push(`  - Venue: ${venue.name} (${venue.region})`);
                });
            }
        }

        // Search Services
        const serviceKeywords = ['lodging', 'shoes', 'dress', 'beauty', '숙소', '슈즈', '드레스', '헤어', '뷰티'];
        if (serviceKeywords.some(k => lowerQuery.includes(k))) {
            const relevantServices = services.filter(s => 
                Object.values(ServiceCategory).some(cat => (lowerQuery.includes(cat) || lowerQuery.includes(t(cat).toLowerCase())) && s.category === cat) ||
                s.name.toLowerCase().includes(lowerQuery)
            );
            if (relevantServices.length > 0) {
                contextParts.push('## Relevant Services Found in App:');
                relevantServices.slice(0, 3).forEach(s => {
                    contextParts.push(`- Service: ${s.name} (${s.category})`);
                    contextParts.push(`  - Price: ${s.price}`);
                    contextParts.push(`  - Region: ${s.region}`);
                });
            }
        }
        
        return contextParts.join('\n');
    };

    const handleSendMessage = async (text: string, imageUrl?: string) => {
        if (!text && !imageUrl) return;

        const userMessage: LucyChatMessage = { id: `msg_${Date.now()}`, role: 'user', text, imageUrl };
        const loadingMessage: LucyChatMessage = { id: `msg_${Date.now() + 1}`, role: 'model', isLoading: true };

        setMessages(prev => [...prev, userMessage, loadingMessage]);
        setInput('');

        try {
            let response: GenerateContentResponse;
            if (imageUrl) {
                 const imagePart = {
                    inlineData: {
                        data: imageUrl.split(',')[1],
                        mimeType: imageUrl.split(';')[0].split(':')[1],
                    },
                };
                const textPart = { text: t('lucyImagePrompt') };
                response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: { parts: [imagePart, textPart] },
                });
            } else {
                const appContext = searchAppData(text);
                
                const finalPrompt = appContext 
                    ? `Based on the following information from the 'Tango Korea' app, answer the user's question. Prioritize this information. If the context doesn't contain the answer, say you couldn't find it in the app and then you can use your general knowledge.\n\n--- App Context ---\n${appContext}\n--- End of App Context ---\n\nUser's Question: "${text}"`
                    : text;

                 response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: finalPrompt,
                    config: {
                      systemInstruction: "Role: A friendly and knowledgeable tango instructor from Argentina, who acts as a guide to help organize and answer questions about this app's content.\n\nPersonality: Warm, sometimes witty, and deeply passionate about all things tango.\n\nLanguage: Fluent in all languages. When speaking Korean, a casual and friendly tone is used instead of formal honorifics.\n\nGoal: To assist the user on their tango journey, answer their questions, and help them enjoy tango more.\n\nResponse Style: Never use formal honorifics. Provide concise and easy-to-understand answers. Format lists with markdown if needed."
                    }
                });
            }

            const modelMessage: LucyChatMessage = { id: `msg_${Date.now() + 2}`, role: 'model', text: response.text };
            setMessages(prev => [...prev.slice(0, -1), modelMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage: LucyChatMessage = { id: `msg_${Date.now() + 2}`, role: 'model', text: 'Sorry, I encountered an error. Please try again.' };
            setMessages(prev => [...prev.slice(0, -1), errorMessage]);
        }
    };
    
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result as string;
                handleSendMessage(t('lucyImagePrompt'), imageUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const ChatMessage: React.FC<{ message: LucyChatMessage }> = ({ message }) => {
        const isModel = message.role === 'model';
        if (message.isLoading) {
            return (
                <div className={`flex items-end gap-2 ${!isModel ? 'justify-end' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><LucyIcon className="w-5 h-5 text-purple-600" /></div>
                    <div className="p-3 rounded-2xl max-w-[70%] bg-gray-200 text-gray-800 rounded-bl-none">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                        </div>
                    </div>
                </div>
            );
        }
        
        return (
            <div className={`flex items-end gap-2 ${!isModel ? 'justify-end' : ''}`}>
                 {isModel && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center self-start mt-1 flex-shrink-0"><LucyIcon className="w-5 h-5 text-purple-600" /></div>}
                <div className={`p-3 rounded-2xl max-w-[80%] ${isModel ? 'bg-white text-gray-800 rounded-bl-none shadow-sm' : 'bg-blue-600 text-white rounded-br-none'}`}>
                     {message.imageUrl && <img src={message.imageUrl} alt="user upload" className="rounded-lg mb-2 max-w-full h-auto" />}
                     {message.text && <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>}
                     {message.editedImageUrl && <img src={message.editedImageUrl} alt="edited" className="rounded-lg mt-2 max-w-full h-auto" />}
                     {message.imageOptions && (
                        <div className="mt-2 space-y-2">
                            {message.imageOptions.map(opt => <button key={opt.labelKey} className="w-full text-left text-sm p-2 bg-blue-500 rounded-lg hover:bg-blue-400">{t(opt.labelKey)}</button>)}
                        </div>
                     )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full min-h-0 relative">
            <header className="p-3 border-b flex items-center gap-3 flex-shrink-0">
                <button onClick={handleBack} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div className="flex-grow flex items-center gap-2">
                    <LucyIcon className="w-6 h-6 text-purple-600" />
                    <h2 className="font-bold text-lg truncate">{t('aiInstructorLucy')}</h2>
                </div>
                <div ref={historyRef} className="relative flex-shrink-0">
                    <button onClick={() => setHistoryOpen(o => !o)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full flex items-center gap-1 text-sm font-semibold">
                        {t('chatHistory')}
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${historyOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {historyOpen && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white border rounded-lg shadow-xl z-20">
                           <button onClick={() => { onNewConversation(); setHistoryOpen(false); }} className="w-full text-left px-3 py-2 text-sm font-bold text-blue-600 border-b hover:bg-gray-50">{t('startNewChat')}</button>
                           <div className="max-h-80 overflow-y-auto">
                               {allConversations.map(conv => (
                                   <button key={conv.id} onClick={() => { onSelectConversation(conv); setHistoryOpen(false); }} className={`w-full text-left px-3 py-2 text-sm truncate hover:bg-gray-100 ${conv.id === conversation.id ? 'bg-blue-50 text-blue-700' : ''}`}>
                                       {conv.title}
                                   </button>
                               ))}
                           </div>
                        </div>
                    )}
                </div>
            </header>
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
                <div ref={chatEndRef} />
            </div>
            <footer className="p-3 border-t bg-white flex-shrink-0">
                 <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} className="flex items-center gap-2">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100">
                        <PaperClipIcon className="w-6 h-6" />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={t('askLucy')}
                        className="flex-grow bg-gray-100 rounded-full px-4 py-2 border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" disabled={!input.trim()} className="p-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 disabled:bg-gray-300 transition-all">
                        <PaperAirplaneIcon className="w-6 h-6" />
                    </button>
                </form>
            </footer>
        </div>
    );
};

const LucyChatModal: React.FC<LucyChatModalProps> = ({ isOpen, ...props }) => {
    return (
        <div className={`fixed inset-0 z-50 bg-white flex flex-col transition-transform duration-300 ease-in-out shadow-lg ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {isOpen && <LucyChatView {...props} />}
        </div>
    );
};

export default LucyChatModal;