import React, { useState } from 'react';
import { User, SocialPlatform, UserRole, Gender, Group } from '../types';
import { FacebookIcon, InstagramIcon, WebIcon, KakaoTalkIcon, BandIcon, MessengerIcon, PhoneIcon, XMarkIcon } from './icons';
import { COUNTRIES, MALE_AVATAR_URL, FEMALE_AVATAR_URL } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface UserProfileModalProps {
  user: User;
  onClose: () => void;
  onEdit: (user: User) => void;
  contextGroup?: Group | null;
  currentUser: User | null;
  onSetStaff?: (groupId: string, userId: string, isStaff: boolean) => void;
  onStartConversation?: (userId: string) => void;
}

const SocialIcon: React.FC<{ platform: SocialPlatform, className?: string }> = ({ platform, className = 'w-6 h-6' }) => {
    switch (platform) {
      case SocialPlatform.Facebook:
        return <FacebookIcon className={className} />;
      case SocialPlatform.Instagram:
        return <InstagramIcon className={className} />;
      case SocialPlatform.Web:
        return <WebIcon className={className} />;
      case SocialPlatform.KakaoTalk:
        return <KakaoTalkIcon className={className} />;
      case SocialPlatform.Band:
        return <BandIcon className={className} />;
      default:
        return null;
    }
  };

const RoleBadge: React.FC<{ role: UserRole; t: (key: string) => string }> = ({ role, t }) => {
    const roleStyles: Record<string, string> = {
        [UserRole.SystemAdmin]: 'bg-red-100 text-red-800',
        [UserRole.Admin]: 'bg-yellow-100 text-yellow-800',
        [UserRole.Instructor]: 'bg-blue-100 text-blue-800',
        [UserRole.Organizer]: 'bg-green-100 text-green-800',
        [UserRole.Tangueros]: 'hidden',
        [UserRole.DJ]: 'bg-pink-100 text-pink-800',
        [UserRole.TranslatorEN]: 'bg-purple-100 text-purple-800',
        [UserRole.TranslatorES]: 'bg-teal-100 text-teal-800',
        [UserRole.ServiceProvider]: 'bg-gray-200 text-gray-800',
    };
    if (role === UserRole.Tangueros) return null;
    return (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${roleStyles[role]}`}>
            {t(role)}
        </span>
    );
};

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose, onEdit, contextGroup, currentUser, onSetStaff, onStartConversation }) => {
  const { t } = useLanguage();
  const country = COUNTRIES.find(c => c.code === user.countryCode);
  const [activeOverlay, setActiveOverlay] = useState<SocialPlatform | null>(null);

  const isMyProfile = currentUser && currentUser.id === user.id;

  const isCreator = currentUser && contextGroup && contextGroup.creatorId === currentUser.id;
  const canManageStaff = isCreator && user.id !== currentUser.id;
  const isStaff = contextGroup?.staffIds?.includes(user.id) ?? false;

  const handleStaffToggle = () => {
      if (canManageStaff && onSetStaff && contextGroup) {
          onSetStaff(contextGroup.id, user.id, !isStaff);
      }
  };

  const handleMessengerClick = () => {
    if (onStartConversation) {
        onStartConversation(user.id);
        onClose();
    }
  };

  const userLinks = new Map(user.socialLinks.map(l => [l.platform, l.url]));
  const allPlatforms: SocialPlatform[] = [SocialPlatform.Facebook, SocialPlatform.Instagram, SocialPlatform.Web, SocialPlatform.KakaoTalk, SocialPlatform.Band];

  const colorClasses: Partial<Record<SocialPlatform, string>> = {
    [SocialPlatform.Facebook]: 'text-[#1877F2] hover:text-[#1877F2]/80',
    [SocialPlatform.Instagram]: 'text-[#E4405F] hover:text-[#E4405F]/80',
    [SocialPlatform.KakaoTalk]: 'text-yellow-400 hover:text-yellow-500',
    [SocialPlatform.Web]: 'text-blue-600 hover:text-blue-700',
    [SocialPlatform.Band]: 'text-green-500 hover:text-green-600',
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 transform transition-all relative animate-scale-in"
        onClick={(e) => {
            e.stopPropagation();
            setActiveOverlay(null);
        }}
      >
        <button onClick={onClose} className="absolute top-2 right-2 p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors z-10">
            <XMarkIcon className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center text-center p-8 pt-12">
            <div className="relative">
                 <img src={user.photoUrl || (user.gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL)} alt={user.nickname} className="w-24 h-24 rounded-full border-4 border-blue-500 object-cover mb-4 shadow-lg" />
            </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            {user.nickname}
            {country && (
                <span className="text-base font-bold text-gray-400" title={country.name}>{country.flag}</span>
            )}
            </h2>
          {user.isPhonePublic ? (
            <a href={`tel:${user.countryCode}${user.phoneNumber.replace(/-/g, '')}`} className="text-gray-500 mb-2 hover:text-blue-600">{`${user.countryCode} ${user.phoneNumber}`}</a>
          ) : (
            <p className="text-gray-400 mb-2 text-sm">{t('phoneNumberPrivate')}</p>
          )}
          <p className="text-blue-600 text-sm font-semibold mb-3">{t('땅게로')}</p>

          <div className="flex flex-wrap justify-center gap-2 mb-4">
              {user.roles.map(role => <RoleBadge key={role} role={role} t={t} />)}
          </div>
          
          <div className="flex space-x-2 my-4 justify-center">
            {allPlatforms.map(platform => {
                const link = userLinks.get(platform);
                const hasLink = !!link;
                const isOverlayType = platform === SocialPlatform.KakaoTalk;

                const iconClassName = `w-7 h-7 transition-colors ${hasLink ? colorClasses[platform] : 'text-gray-300'}`;

                if (isOverlayType) {
                    return (
                        <div key={platform} className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (hasLink) {
                                        setActiveOverlay(prev => prev === platform ? null : platform);
                                    }
                                }}
                                aria-label={platform}
                                className={`p-2 rounded-full ${!hasLink ? 'cursor-default' : 'hover:bg-gray-100'}`}
                            >
                                <SocialIcon platform={platform} className={iconClassName} />
                            </button>
                            {activeOverlay === platform && hasLink && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-800 text-white text-xs rounded py-1 px-3 z-10 break-all shadow-lg">
                                    {link}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
                                </div>
                            )}
                        </div>
                    );
                }

                return (
                    <a
                        key={platform}
                        href={hasLink ? link : undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={platform}
                        onClick={e => {
                            if (!hasLink) {
                                e.preventDefault();
                            }
                            e.stopPropagation();
                        }}
                        className={`p-2 rounded-full ${!hasLink ? 'cursor-default' : 'hover:bg-gray-100'}`}
                    >
                        <SocialIcon platform={platform} className={iconClassName} />
                    </a>
                );
            })}
          </div>

          {canManageStaff && (
              <div className="w-full mt-4">
                  <button onClick={handleStaffToggle} className={`w-full py-2 px-4 rounded-full font-bold transition-colors ${isStaff ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                      {isStaff ? t('removeFromStaff') : t('setAsStaff')}
                  </button>
              </div>
          )}

          <div className="flex items-stretch space-x-3 mt-6 w-full">
            {isMyProfile ? (
                <button onClick={() => { onEdit(user); onClose(); }} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-full transition-transform transform hover:scale-105">
                    {t('editMyInfo')}
                </button>
            ) : (
                <>
                    <button
                        onClick={handleMessengerClick}
                        disabled={!onStartConversation}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-full transition-transform transform hover:scale-105 disabled:opacity-50"
                    >
                        <MessengerIcon className="w-5 h-5"/>
                        <span>{t('messenger')}</span>
                    </button>
                    <a
                        href={user.isPhonePublic ? `tel:${user.countryCode}${user.phoneNumber.replace(/-/g, '')}` : undefined}
                        onClick={(e) => !user.isPhonePublic && e.preventDefault()}
                        className={`flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-transform transform hover:scale-105 ${!user.isPhonePublic ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                       <PhoneIcon className="w-5 h-5"/>
                       <span>{t('call')}</span>
                    </a>
                </>
            )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;