import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { TangoCircleLogo, XMarkIcon } from './icons';

interface PWAInstallPromptProps {
  onInstall: () => void;
  onClose: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onInstall, onClose }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 m-4 rounded-xl shadow-lg flex items-center gap-4 animate-slide-down-fade">
      <TangoCircleLogo className="w-12 h-12 flex-shrink-0" />
      <div className="flex-grow">
        <h3 className="font-bold text-base">{t('installPwaTitle')}</h3>
        <p className="text-sm opacity-90">{t('installPwaBannerMessage')}</p>
      </div>
      <button
        onClick={onInstall}
        className="flex-shrink-0 bg-white/90 hover:bg-white text-blue-700 font-bold py-2 px-4 rounded-full transition-colors text-sm shadow-md"
      >
        {t('installPwaBannerAction')}
      </button>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-white/70 hover:text-white"
        aria-label={t('close')}
      >
        <XMarkIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default PWAInstallPrompt;
