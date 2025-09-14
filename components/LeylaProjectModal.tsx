import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { XMarkIcon } from './icons';

// Icons for each L.A.Y.L.A. point
const LineOfDanceIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.182-3.182m0-4.991v4.99" />
    </svg>
);

const AromaIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15a2 2 0 012-2h10a2 2 0 012 2v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4zM12 13V5m0 0L9 8m3-3l3 3m-3-7h.01" />
    </svg>
);

const YieldIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

const LookIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
       <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 9.5V6a2 2 0 012-2h11a2 2 0 012 2v3.5l-3 3.5V20a1 1 0 01-1 1h-7a1 1 0 01-1-1v-7l-3-3.5z" />
    </svg>
);

const AttitudeIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const LeylaProjectItem: React.FC<{ icon: React.ReactNode; title: string; letter: string; description: string; color: string; }> = ({ icon, title, letter, description, color }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 flex flex-col items-center">
            <div className={`text-4xl font-black ${color}`}>{letter}</div>
            <div className={`mt-1 ${color}`}>{icon}</div>
        </div>
        <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="mt-1 text-white/90 leading-relaxed">{description}</p>
        </div>
    </div>
);

export const LeylaProjectModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useLanguage();

    const colors = ['text-yellow-300', 'text-pink-300', 'text-green-300', 'text-blue-300', 'text-red-300'];
    const items = [
        { letter: 'L', icon: <LineOfDanceIcon />, title: t('leylaL'), description: t('leylaLDesc') },
        { letter: 'A', icon: <AromaIcon />, title: t('leylaA1'), description: t('leylaA1Desc') },
        { letter: 'Y', icon: <YieldIcon />, title: t('leylaY'), description: t('leylaYDesc') },
        { letter: 'L', icon: <LookIcon />, title: t('leylaL2'), description: t('leylaL2Desc') },
        { letter: 'A', icon: <AttitudeIcon />, title: t('leylaA2'), description: t('leylaA2Desc') },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div
                className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 w-full max-w-md h-full max-h-[95vh] rounded-2xl shadow-xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative h-full overflow-y-auto scrollbar-hide p-6 text-white">
                    <button onClick={onClose} className="absolute top-3 right-3 text-white/70 hover:text-white z-10 p-1 bg-black/30 rounded-full">
                        <XMarkIcon className="w-7 h-7" />
                    </button>
                    <div className="text-center mb-8 pt-8">
                        <h2 className="text-4xl font-black tracking-wider drop-shadow-lg">{t('leylaProjectTitle')}</h2>
                        <p className="mt-2 text-lg text-white/90 drop-shadow-md">{t('leylaProjectSlogan')}</p>
                        <p className="mt-2 text-lg text-white/90 drop-shadow-md">{t('leylaProjectSubtitle')}</p>
                    </div>
                    <div className="space-y-6">
                        {items.map((item, index) => <LeylaProjectItem key={item.title} {...item} color={colors[index]} />)}
                    </div>
                </div>
            </div>
        </div>
    );
};
