import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, Conversation, Message as AppMessage, Gender } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronLeftIcon, UserPlusIcon, PaperAirplaneIcon, SearchIcon, PaperClipIcon, XCircleIcon, UsersIcon, XMarkIcon } from './icons';
import { MALE_AVATAR_URL, FEMALE_AVATAR_URL } from '../constants';

interface MessengerModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User | null;
    users: User[];
    conversations: Conversation[];
    onSendMessage: (conversationId: string, message: { text?: string; imageUrl?: string; videoUrl?: string; }) => void;
    onStartConversation: (userId: string) => string;
    onStartGroupConversation: (userIds: string[], groupName?: string) => string;
    onMarkAsRead: (conversationId: string) => void;
    initialConversationId?: string | null;
    onClearInitialConversation: () => void;
}

const timeAgo = (date: Date, t: (key: string) => string) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return t('momentsAgo');
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ` ${t('yearsAgo')}`;
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ` ${t('monthsAgo')}`;
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ` ${t('daysAgo')}`;
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ` ${t('hoursAgo')}`;
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ` ${t('minutesAgo')}`;
    return t('momentsAgo');
};

const ConversationListView: React.FC<{
    conversations: Conversation[];
    currentUser: User;
    usersMap: Map<string, User>;
    onSelectConversation: (conversationId: string) => void;
    onNewChat: () => void;
    onClose: () => void;
}> = ({ conversations, currentUser, usersMap, onSelectConversation, onNewChat, onClose }) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    
    const sortedAndFilteredConversations = useMemo(() => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        
        const filtered = conversations
            .filter(conv => !conv.groupId) // Exclude group chats
            .filter(conv => {
            if (!lowerSearchTerm) return true;

            const otherParticipants = conv.participantIds
                .filter(id => id !== currentUser.id)
                .map(id => usersMap.get(id))
                .filter((u): u is User => !!u);

            const convName = conv.name || otherParticipants.map(u => u.nickname).join(', ');
            const participantNicknames = otherParticipants.map(u => u.nativeNickname).join(' ');

            return convName.toLowerCase().includes(lowerSearchTerm) || participantNicknames.toLowerCase().includes(lowerSearchTerm);
        });
        
        return filtered.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    }, [conversations, searchTerm, currentUser.id, usersMap]);
    
    return (
        <>
            <header className="p-3 border-b flex items-center flex-shrink-0">
                <div className="w-10">
                    <button onClick={onClose} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                </div>
                <h2 className="font-bold text-lg text-center flex-grow">{t('messenger')}</h2>
                <div className="w-10 flex justify-end">
                    <button onClick={onNewChat} className="p-2 text-blue-600 hover:bg-gray-100 rounded-full">
                        <UserPlusIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>
            <div className="p-3 border-b flex-shrink-0">
                <div className="relative">
                    <input
                        type="text"
                        placeholder={t('searchPeople')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-100 rounded-full py-2 pl-10 pr-4 border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                    <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
            </div>
            <div className="overflow-y-auto flex-grow">
                {sortedAndFilteredConversations.map(conv => {
                    const otherParticipants = conv.participantIds
                        .filter(id => id !== currentUser.id)
                        .map(id => usersMap.get(id))
                        .filter((u): u is User => !!u);
                        
                    if(otherParticipants.length === 0 && conv.participantIds.length <= 1) return null;
                        
                    const convName = conv.name || otherParticipants.map(u => u.nickname).join(', ');
                    const lastMessage = conv.messages[conv.messages.length - 1];
                    const unreadCount = conv.messages.filter(msg => msg.senderId !== currentUser.id && !msg.read).length;

                    const avatar = otherParticipants.length === 1 
                        ? (otherParticipants[0].photoUrl || (otherParticipants[0].gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL))
                        : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(convName)}`;

                    return (
                        <button key={conv.id} onClick={() => onSelectConversation(conv.id)} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition text-left">
                             <div className="relative flex-shrink-0">
                                <img src={avatar} alt={convName} className="w-12 h-12 rounded-full object-cover" />
                                {unreadCount > 0 && 
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                        {unreadCount}
                                    </span>
                                }
                            </div>
                            <div className="flex-grow overflow-hidden">
                                {conv.name ? (
                                    <p className={`truncate ${unreadCount > 0 ? 'font-extrabold text-gray-900' : 'font-bold text-gray-900'}`}>{conv.name}</p>
                                ) : otherParticipants.length === 1 ? (
                                    <div className="flex items-baseline gap-1.5 truncate">
                                        <p className={`text-gray-900 ${unreadCount > 0 ? 'font-extrabold' : 'font-bold'}`}>{otherParticipants[0].nickname}</p>
                                        <p className="text-sm font-normal text-gray-500 truncate">{otherParticipants[0].nativeNickname}</p>
                                    </div>
                                ) : (
                                    <p className={`truncate ${unreadCount > 0 ? 'font-extrabold text-gray-900' : 'font-bold text-gray-900'}`}>{otherParticipants.map(u => u.nickname).join(', ')}</p>
                                )}
                                {lastMessage && (
                                    <p className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-800 font-semibold' : 'text-gray-500'}`}>
                                        {lastMessage.senderId === currentUser.id ? "You: " : ""}
                                        {lastMessage.text ? lastMessage.text : (lastMessage.imageUrl ? t('photoSent') : t('videoSent'))}
                                    </p>
                                )}
                            </div>
                             {lastMessage && <p className="text-xs text-gray-400 self-start flex-shrink-0">{timeAgo(new Date(lastMessage.createdAt), t)}</p>}
                        </button>
                    );
                })}
            </div>
        </>
    );
};

const GroupMembersView: React.FC<{
    members: User[];
    onBack: () => void;
}> = ({ members, onBack }) => {
    const { t } = useLanguage();
    return (
        <div className="absolute inset-0 bg-white z-10 flex flex-col">
            <header className="p-3 border-b flex items-center gap-3 flex-shrink-0">
                <button onClick={onBack} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="font-bold text-lg">{t('members')} ({members.length})</h2>
            </header>
            <div className="overflow-y-auto p-2">
                {members.map(user => (
                    <div key={user.id} className="w-full flex items-center gap-3 p-2 rounded-lg text-left">
                        <img src={user.photoUrl || (user.gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL)} alt={user.nickname} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                            <p className="font-semibold text-gray-800">{user.nickname}</p>
                            <p className="text-sm text-gray-500">{user.nativeNickname}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const ChatView: React.FC<{
    conversation: Conversation;
    currentUser: User;
    usersMap: Map<string, User>;
    onBack: () => void;
    onSendMessage: (conversationId: string, message: { text?: string; imageUrl?: string; videoUrl?: string; }) => void;
}> = ({ conversation, currentUser, usersMap, onBack, onSendMessage }) => {
    const { t } = useLanguage();
    const [text, setText] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isMembersViewOpen, setMembersViewOpen] = useState(false);
    const [mediaToSend, setMediaToSend] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    if (file.type.startsWith('image/')) {
                        setMediaToSend({ url: reader.result as string, type: 'image' });
                    } else if (file.type.startsWith('video/')) {
                        setMediaToSend({ url: reader.result as string, type: 'video' });
                    }
                }
            };
            reader.readAsDataURL(file);
        }
        if(e.target) {
            e.target.value = '';
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, [conversation.messages]);

    const handleSend = () => {
        if (mediaToSend || text.trim()) {
            const messagePayload: { text?: string; imageUrl?: string; videoUrl?: string; } = {};
            
            if (text.trim()) {
                messagePayload.text = text.trim();
            }
            
            if (mediaToSend) {
                if (mediaToSend.type === 'image') {
                    messagePayload.imageUrl = mediaToSend.url;
                } else {
                    messagePayload.videoUrl = mediaToSend.url;
                }
            }
            
            onSendMessage(conversation.id, messagePayload);
    
            setText('');
            setMediaToSend(null);
        }
    };
    
    const otherParticipants = conversation.participantIds
        .filter(id => id !== currentUser.id)
        .map(id => usersMap.get(id))
        .filter((u): u is User => !!u);
    
    const convName = conversation.name || otherParticipants.map(u => u.nickname).join(', ');
    const isGroupChat = conversation.participantIds.length > 2 || !!conversation.name;
    const members = conversation.participantIds.map(id => usersMap.get(id)).filter((u): u is User => !!u);

    return (
        <div className="flex flex-col h-full min-h-0 relative">
            <header className="p-3 border-b flex items-center gap-3 flex-shrink-0">
                <button onClick={onBack} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="font-bold text-lg truncate flex-grow">{convName}</h2>
                {isGroupChat && (
                    <button onClick={() => setMembersViewOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full flex-shrink-0">
                        <UsersIcon className="w-6 h-6" />
                    </button>
                )}
            </header>
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
                {conversation.messages.map(msg => {
                    const sender = usersMap.get(msg.senderId);
                    const isCurrentUser = msg.senderId === currentUser.id;
                    return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : ''}`}>
                            {!isCurrentUser && sender && (
                                <img src={sender.photoUrl || (sender.gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL)} alt={sender.nickname} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                            )}
                             <div className={`p-3 rounded-2xl max-w-[70%] ${isCurrentUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                                {msg.text && <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>}
                                {msg.imageUrl && (
                                    <img src={msg.imageUrl} alt="sent image" className="rounded-lg max-w-full h-auto" />
                                )}
                                {msg.videoUrl && (
                                    <video src={msg.videoUrl} controls className="rounded-lg max-w-full h-auto" />
                                )}
                            </div>
                        </div>
                    );
                })}
                 <div ref={chatEndRef} />
            </div>
            <footer className="p-3 border-t bg-white flex-shrink-0">
                <div>
                    {mediaToSend && (
                        <div className="relative mb-2 w-20 h-20 bg-gray-100 rounded-lg p-1">
                            {mediaToSend.type === 'image' ? (
                                <img src={mediaToSend.url} alt="Preview" className="w-full h-full object-cover rounded" />
                            ) : (
                                <video src={mediaToSend.url} className="w-full h-full object-cover rounded" />
                            )}
                            <button
                                onClick={() => setMediaToSend(null)}
                                className="absolute -top-2 -right-2 bg-gray-600 text-white rounded-full"
                            >
                                <XCircleIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100">
                            <PaperClipIcon className="w-6 h-6" />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*,video/*"
                            className="hidden"
                        />
                        <input
                            type="text"
                            value={text}
                            onChange={e => setText(e.target.value)}
                            placeholder={t('typeAMessage')}
                            className="flex-grow bg-gray-100 rounded-full px-4 py-2 border-transparent focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit" disabled={!text.trim() && !mediaToSend} className="p-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 disabled:bg-gray-300 transition-all">
                        <PaperAirplaneIcon className="w-6 h-6" />
                        </button>
                    </form>
                </div>
            </footer>
            {isMembersViewOpen && (
                <GroupMembersView
                    members={members}
                    onBack={() => setMembersViewOpen(false)}
                />
            )}
        </div>
    );
};

const UserPill: React.FC<{ user: User; onRemove: (user: User) => void }> = ({ user, onRemove }) => (
    <div className="bg-blue-100 text-blue-800 rounded-full flex items-center gap-1 pl-2 pr-1 py-0.5">
        <span className="text-sm font-semibold">{user.nickname}</span>
        <button onClick={() => onRemove(user)} className="text-blue-600 hover:bg-blue-200 rounded-full">
            <XCircleIcon className="w-4 h-4" />
        </button>
    </div>
);


const NewChatView: React.FC<{
    users: User[];
    currentUser: User;
    onBack: () => void;
    onStartChat: (userId: string) => void;
    onStartGroupChat: (userIds: string[], groupName?: string) => void;
}> = ({ users, currentUser, onBack, onStartChat, onStartGroupChat }) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [groupName, setGroupName] = useState('');

    const handleToggleUser = (user: User) => {
        setSelectedUsers(prev => {
            if (prev.some(u => u.id === user.id)) {
                return prev.filter(u => u.id !== user.id);
            } else {
                return [...prev, user];
            }
        });
    };
    
    const handleCreateChat = () => {
        if (selectedUsers.length === 1) {
            onStartChat(selectedUsers[0].id);
        } else if (selectedUsers.length > 1) {
            onStartGroupChat(selectedUsers.map(u => u.id), groupName.trim() || undefined);
        }
    };

    const filteredUsers = useMemo(() => {
        const selectedIds = new Set(selectedUsers.map(u => u.id));
        return users.filter(u => 
            u.id !== currentUser.id &&
            !selectedIds.has(u.id) && (
            u.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.nativeNickname.toLowerCase().includes(searchTerm.toLowerCase())
        ));
    }, [users, currentUser.id, searchTerm, selectedUsers]);

    return (
        <div className="flex flex-col h-full min-h-0">
            <header className="p-3 border-b flex items-center gap-3 flex-shrink-0">
                <button onClick={onBack} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="font-bold text-lg">{t('newChat')}</h2>
            </header>
            <div className="p-3 border-b flex-shrink-0">
                <div className="flex items-start gap-2 flex-wrap border rounded-lg p-2 min-h-[48px]">
                    <span className="font-bold text-sm text-gray-500 pt-1 flex-shrink-0">To:</span>
                    <div className="flex-grow flex flex-wrap gap-1 items-center">
                        {selectedUsers.map(user => (
                            <UserPill key={user.id} user={user} onRemove={handleToggleUser} />
                        ))}
                    </div>
                </div>

                <div className="relative mt-2">
                    <input
                        type="text"
                        placeholder={t('searchPeople')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-100 rounded-full py-2 pl-10 pr-4 border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                    <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                {selectedUsers.length > 1 && (
                    <input
                        type="text"
                        placeholder={t('groupChat') + ` (${t('optional')})`}
                        value={groupName}
                        onChange={e => setGroupName(e.target.value)}
                        className="w-full bg-gray-100 rounded-full py-2 px-4 mt-2 border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                )}
            </div>
            <div className="overflow-y-auto flex-grow min-h-0">
                {filteredUsers.map(user => (
                    <button key={user.id} onClick={() => handleToggleUser(user)} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition text-left">
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        </div>
                        <img src={user.photoUrl || (user.gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL)} alt={user.nickname} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                            <p className="font-bold text-gray-900">{user.nickname} <span className="text-sm font-normal text-gray-500">{user.nativeNickname}</span></p>
                        </div>
                    </button>
                ))}
            </div>
            <footer className="p-3 border-t bg-white flex-shrink-0">
                <button
                    onClick={handleCreateChat}
                    disabled={selectedUsers.length === 0}
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-full hover:bg-blue-700 transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                    {t('startConversation')}
                </button>
            </footer>
        </div>
    );
};


const MessengerModal: React.FC<MessengerModalProps> = ({ isOpen, onClose, currentUser, users, conversations, onSendMessage, onStartConversation, onStartGroupConversation, onMarkAsRead, initialConversationId, onClearInitialConversation }) => {
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [view, setView] = useState<'list' | 'chat' | 'new'>('list');

    const usersMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

    useEffect(() => {
        if (isOpen && initialConversationId) {
            const convExists = conversations.some(c => c.id === initialConversationId);
            if (convExists) {
                setActiveConversationId(initialConversationId);
                setView('chat');
                onMarkAsRead(initialConversationId);
                onClearInitialConversation();
            }
        } else if (!isOpen) {
            const timer = setTimeout(() => {
                 setView('list');
                 setActiveConversationId(null);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, initialConversationId, conversations, onMarkAsRead, onClearInitialConversation]);

    const handleSelectConversation = (conversationId: string) => {
        setActiveConversationId(conversationId);
        onMarkAsRead(conversationId);
        setView('chat');
    };

    const handleBackToList = () => {
        setView('list');
        setActiveConversationId(null);
    };

    const handleStartNewChat = (userId: string) => {
        const conversationId = onStartConversation(userId);
        handleSelectConversation(conversationId);
    };
    
    const handleStartNewGroupChat = (userIds: string[], groupName?: string) => {
        const conversationId = onStartGroupConversation(userIds, groupName);
        handleSelectConversation(conversationId);
    };

    if (!currentUser) return null;
    
    let content;
    switch (view) {
        case 'chat':
            const activeConversation = conversations.find(c => c.id === activeConversationId);
            if (activeConversation) {
                content = (
                    <ChatView
                        conversation={activeConversation}
                        currentUser={currentUser}
                        usersMap={usersMap}
                        onBack={handleBackToList}
                        onSendMessage={onSendMessage}
                    />
                );
            } else {
                handleBackToList();
                content = null;
            }
            break;
        case 'new':
            content = <NewChatView users={users} currentUser={currentUser} onBack={handleBackToList} onStartChat={handleStartNewChat} onStartGroupChat={handleStartNewGroupChat} />;
            break;
        case 'list':
        default:
            content = <ConversationListView conversations={conversations} currentUser={currentUser} usersMap={usersMap} onSelectConversation={handleSelectConversation} onNewChat={() => setView('new')} onClose={onClose} />;
            break;
    }

    return (
        <div className={`fixed inset-0 z-50 bg-white flex flex-col transition-transform duration-300 ease-in-out shadow-lg ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {content}
        </div>
    );
};

export default MessengerModal;