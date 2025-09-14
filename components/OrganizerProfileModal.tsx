import React from 'react';
import { User, SocialLink, SocialPlatform, Gender } from '../types';
import { FacebookIcon, InstagramIcon, WebIcon, PhoneIcon, MailIcon, KakaoTalkIcon } from './icons';
import { MALE_AVATAR_URL, FEMALE_AVATAR_URL } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface OrganizerProfileModalProps {
  organizer: User;
  onClose: () => void;
  onEdit: (organizer: User) => void;
}

const SocialIcon: React.FC<{ link: SocialLink }> = ({ link }) => {
  const iconProps = { className: 'w-6 h-6 text-gray-500 hover:text-blue-600 transition-colors' };
  switch (link.platform) {
    case SocialPlatform.Facebook:
      return <FacebookIcon {...iconProps} />;
    case SocialPlatform.Instagram:
      return <InstagramIcon {...iconProps} />;
    case SocialPlatform.Web:
      return <WebIcon {...iconProps} />;
    case SocialPlatform.KakaoTalk:
      return <KakaoTalkIcon {...iconProps} />;
    case SocialPlatform.Contact:
      if (link.url.startsWith('tel:')) {
        return <PhoneIcon {...iconProps} />;
      }
      return <MailIcon {...iconProps} />;
    default:
      return null;
  }
};

const OrganizerProfileModal: React.FC<OrganizerProfileModalProps> = ({ organizer, onClose, onEdit }) => {
  const { t } = useLanguage();
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4 transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <img 
            src={organizer.photoUrl || (organizer.gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL)} 
            alt={organizer.nickname}
            className="w-32 h-32 rounded-full border-4 border-blue-500 object-cover mb-4 shadow-lg"
          />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{organizer.nickname}</h2>
          
          <div className="flex space-x-6 my-4">
            {organizer.socialLinks.map(link => (
              <a 
                key={`${link.platform}-${link.url}`} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label={link.platform}
              >
                <SocialIcon link={link} />
              </a>
            ))}
          </div>

          <div className="flex items-center space-x-4 mt-6 w-full">
            <button
                onClick={() => onEdit(organizer)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-full transition-transform transform hover:scale-105"
            >
                {t('edit')}
            </button>
            <button
                onClick={onClose}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-transform transform hover:scale-105"
            >
                {t('close')}
            </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerProfileModal;