import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

// Note: ThumbsUpIcon (Like) and HeartIcon (Love) are imported from ./icons

export const HahaIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => {
    const { t } = useLanguage();
    return <span className={`${className} flex items-center justify-center text-2xl`} role="img" aria-label={t('Haha')}>😂</span>
}

export const WowIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => {
    const { t } = useLanguage();
    return <span className={`${className} flex items-center justify-center text-2xl`} role="img" aria-label={t('Wow')}>😮</span>
}

export const SadIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => {
    const { t } = useLanguage();
    return <span className={`${className} flex items-center justify-center text-2xl`} role="img" aria-label={t('Sad')}>😢</span>
}

export const AngryIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => {
    const { t } = useLanguage();
    return <span className={`${className} flex items-center justify-center text-2xl`} role="img" aria-label={t('Angry')}>😠</span>
}