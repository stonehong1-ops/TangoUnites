import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface SplashScreenProps {
  countryUserCounts: { name: string; count: number }[];
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ countryUserCounts }) => {
    const { t } = useLanguage();
    return (
        <>
            <div className="fixed inset-0 bg-white z-[100] animate-splash-bg-fade-out overflow-hidden flex flex-col items-center justify-center">
                <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight leading-tight text-center animate-text-fade">
                    {t('splashScreenTitle')}
                </h1>
                <div className="mt-8 px-4 w-full max-w-md flex flex-wrap justify-center items-baseline gap-x-4 gap-y-2 animate-word-cloud-fade">
                    {countryUserCounts.map(({ name, count }) => (
                        <div key={name} className="flex items-baseline">
                            <span
                                className="font-bold text-gray-700"
                                style={{ fontSize: `${Math.min(1 + count * 0.1, 2.5)}rem` }}
                            >
                                {name}
                            </span>
                            <span
                                className="ml-1 font-semibold text-gray-400"
                                style={{ fontSize: `${Math.min(0.75 + count * 0.05, 1.5)}rem` }}
                            >
                                {count}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
                @keyframes splash-bg-fade-out {
                    0%, 85% { opacity: 1; pointer-events: auto; }
                    100% { opacity: 0; pointer-events: none; }
                }
                .animate-splash-bg-fade-out {
                    animation: splash-bg-fade-out 3s ease-out forwards;
                }

                @keyframes text-fade-in-out {
                    0%, 100% {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    20%, 80% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-text-fade {
                    animation: text-fade-in-out 3s ease-in-out forwards;
                }
                
                @keyframes word-cloud-fade-in {
                    0%, 15% {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    35%, 80% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    100% {
                        opacity: 0;
                    }
                }
                .animate-word-cloud-fade {
                    animation: word-cloud-fade-in 3s ease-in-out forwards;
                }
            `}</style>
        </>
    );
};
