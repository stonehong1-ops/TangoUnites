import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const ShareIosIcon = ({ className = 'inline-block h-5 w-5 mx-1 align-text-bottom' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
        <polyline points="16 6 12 2 8 6"></polyline>
        <line x1="12" y1="2" x2="12" y2="15"></line>
    </svg>
);

const PlusSquareIcon = ({ className = 'inline-block h-5 w-5 mx-1 align-text-bottom' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
);


interface IosInstallMessageModalProps {
  onClose: () => void;
}

const IosInstallMessageModal: React.FC<IosInstallMessageModalProps> = ({ onClose }) => {
  const { t } = useLanguage();
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 transform transition-all text-center"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">{t('addToHomeScreenIosTitle')}</h3>
        <p className="text-gray-700 leading-relaxed text-base">
            {t('addToHomeScreenIosInstructions1')}
            <ShareIosIcon />
            {t('addToHomeScreenIosInstructions2')}
            <PlusSquareIcon />
            <strong className="font-bold text-gray-800"> {t('addToHomeScreenIosInstructions3')}</strong>
        </p>
        <button
            onClick={onClose}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-transform transform hover:scale-105"
        >
            {t('close')}
        </button>
      </div>
    </div>
  );
};

export default IosInstallMessageModal;