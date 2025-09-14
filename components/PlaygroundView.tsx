import React, { useState, lazy, Suspense } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ClockRewindIcon, MusicalNoteIcon, QuestionMarkCircleIcon, TicketIcon, ClipboardDocumentCheckIcon, Squares2X2Icon } from './icons';
import { User } from '../types';
import SwipeableTabView, { Tab } from './SwipeableTabView';

const HistoricalLook = lazy(() => import('./HistoricalLook'));
const LifeFourCuts = lazy(() => import('./LifeFourCuts'));
const TangoDJView = lazy(() => import('./TangoDJView'));
const TangoQuizView = lazy(() => import('./TangoQuizView'));
const MilongaRaffleView = lazy(() => import('./MilongaRaffleView'));
const AbrazoAnalysisView = lazy(() => import('./AbrazoAnalysisView'));


interface PlaygroundViewProps {
    currentUser: User | null;
    onUpdateUserPoints: (points: number) => void;
}

interface AppCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
}

const AppCard: React.FC<AppCardProps> = ({ title, description, icon, onClick }) => (
    <button
        onClick={onClick}
        className="w-full bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-left flex flex-col items-center text-center hover:shadow-blue-200 hover:-translate-y-1 transition-all duration-300"
    >
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-2 flex-grow">{description}</p>
    </button>
);

const PlaygroundView: React.FC<PlaygroundViewProps> = ({ currentUser, onUpdateUserPoints }) => {
    const { t } = useLanguage();
    const [activeApp, setActiveApp] = useState<string | null>(null);

    const tangoAIApps = [
        { id: 'historicalLook', title: t('historicalLook'), description: t('historicalLookDescription'), icon: <ClockRewindIcon className="w-8 h-8" /> },
        { id: 'abrazoAnalysis', title: t('abrazoAnalysis'), description: t('abrazoAnalysisDescription'), icon: <ClipboardDocumentCheckIcon className="w-8 h-8" /> },
        { id: 'tangoQuiz', title: t('tangoQuiz'), description: t('tangoQuizDescription'), icon: <QuestionMarkCircleIcon className="w-8 h-8" /> },
        { id: 'tangoDJ', title: t('tangoDJ'), description: t('tangoDJDescription'), icon: <MusicalNoteIcon className="w-8 h-8" /> },
    ];
    
    const lifeAIApps = [
        { id: 'lifeFourCuts', title: t('lifeFourCuts'), description: t('lifeFourCutsDescription'), icon: <Squares2X2Icon className="w-8 h-8" /> },
        { id: 'raffle', title: t('eventRaffle'), description: t('eventRaffleDescription'), icon: <TicketIcon className="w-8 h-8" /> },
    ];

    const appComponents: { [key: string]: React.ReactNode } = {
        historicalLook: <Suspense fallback={<div>Loading...</div>}><HistoricalLook onBack={() => setActiveApp(null)} /></Suspense>,
        lifeFourCuts: <Suspense fallback={<div>Loading...</div>}><LifeFourCuts onBack={() => setActiveApp(null)} /></Suspense>,
        tangoDJ: <Suspense fallback={<div>Loading...</div>}><TangoDJView onBack={() => setActiveApp(null)} /></Suspense>,
        tangoQuiz: <Suspense fallback={<div>Loading...</div>}><TangoQuizView onBack={() => setActiveApp(null)} currentUser={currentUser} onUpdateUserPoints={onUpdateUserPoints} /></Suspense>,
        raffle: <Suspense fallback={<div>Loading...</div>}><MilongaRaffleView onBack={() => setActiveApp(null)} /></Suspense>,
        abrazoAnalysis: <Suspense fallback={<div>Loading...</div>}><AbrazoAnalysisView onBack={() => setActiveApp(null)} /></Suspense>,
    };

    if (activeApp && appComponents[activeApp]) {
        return <>{appComponents[activeApp]}</>;
    }
    
    const tabs: Tab[] = [
        {
            id: 'tangoAI',
            label: t('tangoAI'),
            content: <div className="space-y-4">{tangoAIApps.map(app => <AppCard key={app.id} {...app} onClick={() => setActiveApp(app.id)} />)}</div>
        },
        {
            id: 'lifeAI',
            label: t('lifeAI'),
            content: <div className="space-y-4">{lifeAIApps.map(app => <AppCard key={app.id} {...app} onClick={() => setActiveApp(app.id)} />)}</div>
        },
        {
            id: 'lab',
            label: t('lab'),
            content: (
                <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold">{t('lab')}</h2>
                    <p className="text-gray-600 mt-2">{t('labComingSoon')}</p>
                </div>
            )
        }
    ];

    return (
        <div>
            <SwipeableTabView tabs={tabs} stickyHeader />
        </div>
    );
};

export default PlaygroundView;
