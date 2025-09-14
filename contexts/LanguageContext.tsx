import React, { createContext, useState, useContext, useMemo, ReactNode } from 'react';
import { Language } from '../types';
import translations from '../i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  locale: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const localeMap: Record<Language, string> = {
  [Language.EN]: 'en-US',
  [Language.KO]: 'ko-KR',
  [Language.CN]: 'zh-CN',
  [Language.JP]: 'ja-JP',
  [Language.VN]: 'vi-VN',
  [Language.DE]: 'de-DE',
  [Language.FR]: 'fr-FR',
  [Language.ES]: 'es-ES',
  [Language.IT]: 'it-IT',
  [Language.RU]: 'ru-RU',
};

export interface LanguageProviderProps {
    children: ReactNode;
    overrides?: Record<Language, Record<string, string>>;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children, overrides = {} }) => {
  const [language, setLanguage] = useState<Language>(Language.KO);

  const t = (key: string): string => {
    const langOverride = overrides[language]?.[key];
    if (langOverride) return langOverride;

    const langTranslations = translations[language];
    const enTranslations = translations[Language.EN];
    
    return langTranslations[key] || enTranslations[key] || key;
  };

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
    locale: localeMap[language],
  }), [language, overrides]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};