import React, { useState, useMemo } from 'react';
import { Post, User, ReactionType, Gender } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { ThumbsUpIcon, HeartIcon } from './icons';
import { HahaIcon, WowIcon, SadIcon, AngryIcon } from './ReactionIcons';

interface ReactionListModalProps {
    post: Post;
    usersMap: Map<string, User>;
    onClose: () => void;
    onUserClick: (user: User) => void;
}

const ReactionIcon: React.FC<{ type: ReactionType; className?: string }> = ({ type, className = 'w-5 h-5' }) => {
    switch(type) {
        case ReactionType.Like: return <div className="bg-blue-500 p-0.5 rounded-full"><ThumbsUpIcon className={`${className} text-white`} isFilled /></div>
        case ReactionType.Love: return <HeartIcon className={`${className} text-red-500`} isFilled />
        case ReactionType.Haha: return <HahaIcon className={className} />
        case ReactionType.Wow: return <WowIcon className={className} />
        case ReactionType.Sad: return <SadIcon className={className} />
        case ReactionType.Angry: return <AngryIcon className={className} />
        default: return null;
    }
};

const ReactionListModal: React.FC<ReactionListModalProps> = ({ post, usersMap, onClose, onUserClick }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<ReactionType | 'all'>('all');

    const reactionCounts = useMemo(() => {
        const counts = post.reactions.reduce((acc, reaction) => {
            acc[reaction.type] = (acc[reaction.type] || 0) + 1;
            return acc;
        }, {} as Record<ReactionType, number>);
        return counts;
    }, [post.reactions]);

    const tabs: (ReactionType | 'all')[] = ['all', ...Object.values(ReactionType)];

    const filteredReactions = useMemo(() => {
        if (activeTab === 'all') return post.reactions;
        return post.reactions.filter(r => r.type === activeTab);
    }, [post.reactions, activeTab]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto transform transition-all max-h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">{t('reactions')}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-2 border-b border-gray-200 flex items-center gap-1 overflow-x-auto scrollbar-hide">
                    {tabs.map(tab => {
                        const count = tab === 'all' ? post.reactions.length : (reactionCounts[tab] || 0);
                        if (count === 0 && tab !== 'all') return null;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                {tab === 'all' ? <span>{t('all')}</span> : <ReactionIcon type={tab} className="w-5 h-5" />}
                                <span>{count}</span>
                            </button>
                        );
                    })}
                </div>
                <div className="overflow-y-auto p-4 space-y-3">
                    {filteredReactions.length > 0 ? filteredReactions.map(reaction => {
                        const user = usersMap.get(reaction.userId);
                        if (!user) return null;
                        return (
                            <div key={reaction.userId} className="flex items-center justify-between">
                                <button onClick={() => onUserClick(user)} className="flex items-center gap-3 group">
                                    {user.photoUrl ? (
                                        <img src={user.photoUrl} alt={user.nickname} className="w-10 h-10 rounded-full object-cover transition-opacity group-hover:opacity-80" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center transition-opacity group-hover:opacity-80">
                                            {user.gender === Gender.Tanguero ? <span className="text-2xl">🕺</span> : <span className="text-2xl">💃</span>}
                                        </div>
                                    )}
                                    <span className="font-semibold text-gray-800 group-hover:text-blue-600">{user.nickname}</span>
                                </button>
                                <ReactionIcon type={reaction.type} className="w-6 h-6"/>
                            </div>
                        );
                    }) : (
                        <p className="text-center text-gray-500 py-4">{t('noAttendeesYet')}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReactionListModal;
