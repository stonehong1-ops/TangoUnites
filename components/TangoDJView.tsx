import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { GoogleGenAI, Type } from '@google/genai';

const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

type DJState = 'idle' | 'listening' | 'analyzing' | 'result' | 'error';
interface Recommendation {
    orchestraName: string;
    reason: string;
    songs: string[];
}


const TangoDJView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { t } = useLanguage();
    const [state, setState] = useState<DJState>('idle');
    const [result, setResult] = useState<Recommendation | null>(null);

    const startListening = () => {
        setState('listening');
        setTimeout(() => {
            getRecommendation();
        }, 3500); // Simulate listening for 3.5 seconds
    };

    const getRecommendation = async () => {
        setState('analyzing');
        setResult(null);
        try {
            const moods = ["dramatic and rhythmic", "smooth and elegant", "powerful and complex", "melodic and sentimental", "classic and clean"];
            const randomMood = moods[Math.floor(Math.random() * moods.length)];
            const orchestras = ["Juan D'Arienzo", "Carlos Di Sarli", "Osvaldo Pugliese", "Aníbal Troilo", "Francisco Canaro"];

            const prompt = `Imagine you've just listened to a song with a ${randomMood} vibe. As an AI Tango DJ, recommend a classic tango orchestra that fits this mood. The orchestras to choose from are: ${orchestras.join(', ')}. Provide a reason for your choice and list 5 representative songs.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                 config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            orchestraName: {
                                type: Type.STRING,
                                description: `One of the following: ${orchestras.join(', ')}`,
                            },
                            reason: {
                                type: Type.STRING,
                                description: `A creative and engaging reason for the recommendation, in the language of the user's request. Start with a fun opening like '아하! 이 느낌은...'.`
                            },
                            songs: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.STRING
                                },
                                description: "A list of 5 representative song titles from the chosen orchestra."
                            }
                        },
                        required: ["orchestraName", "reason", "songs"]
                    }
                },
            });
            
            // FIX: Add type assertion to JSON.parse to fix 'unknown' type errors and improve type safety.
            const jsonResponse = JSON.parse(response.text) as Recommendation;
            setResult(jsonResponse);
            setState('result');
        } catch (error) {
            console.error("Error getting recommendation:", error);
            setState('error');
        }
    };
    
    const renderContent = () => {
        switch (state) {
            case 'listening':
                return (
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="absolute w-full h-full rounded-full bg-blue-500/30 animate-ping" style={{ animationDelay: `${i * 0.5}s` }}></div>
                            ))}
                             <div className="w-24 h-24 bg-blue-600 rounded-full"></div>
                        </div>
                        <p className="mt-8 text-xl font-bold text-gray-800">{t('listening')}</p>
                    </div>
                );
            case 'analyzing':
                 return (
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                        <p className="mt-8 text-xl font-bold text-gray-800">{t('analyzing')}</p>
                    </div>
                );
            case 'result':
            case 'error':
                 return (
                    <div className="w-full max-w-sm mx-auto text-center">
                        <div className="bg-gray-800 rounded-full w-72 h-72 mx-auto flex items-center justify-center p-4 shadow-2xl relative mb-6">
                            <div className="w-full h-full border-2 border-dashed border-gray-600 rounded-full animate-spin-slow"></div>
                            <div className="absolute w-60 h-60 bg-black rounded-full p-4 flex items-center justify-center text-white">
                                <div className="text-center">
                                    <h3 className="font-bold text-lg mb-2 text-yellow-300">{t('recommendationFromAI')}</h3>
                                    {state === 'error' ? (
                                        <p className="text-sm text-gray-300">An error occurred.</p>
                                    ) : (
                                        <p className="text-3xl font-black text-white leading-tight break-words">
                                            {result?.orchestraName}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="absolute w-8 h-8 bg-white rounded-full"></div>
                        </div>

                        {state === 'result' && result && (
                            <div className="bg-white p-6 rounded-xl shadow-lg text-left space-y-4 border">
                                <div>
                                    <h4 className="font-bold text-gray-500 text-sm uppercase tracking-wider">{t('recommendationReason')}</h4>
                                    <p className="text-gray-800 mt-1">{result.reason}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-500 text-sm uppercase tracking-wider">{t('recommendedSongs')}</h4>
                                    <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
                                        {result.songs.map((song, index) => (
                                            <li key={index}>{song}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                        
                        <button onClick={startListening} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105">
                            {t('tryAgain')}
                        </button>
                    </div>
                );
            case 'idle':
            default:
                return (
                    <div className="text-center">
                         <h3 className="text-2xl font-bold text-gray-800">{t('tangoDJ')}</h3>
                         <p className="text-gray-600 mt-2 mb-8">{t('tangoDJDescription')}</p>
                         <button onClick={startListening} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg">
                            {t('listenToMusic')}
                        </button>
                    </div>
                );
        }
    }

    return (
        <div className="bg-gray-100 min-h-full flex flex-col">
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-3 flex items-center sticky top-0 z-10 flex-shrink-0">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-gray-800 mx-auto pr-10">{t('tangoDJ')}</h2>
            </header>
            
            <main className="p-4 flex-grow flex items-center justify-center">
               {renderContent()}
            </main>
            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 10s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default TangoDJView;
