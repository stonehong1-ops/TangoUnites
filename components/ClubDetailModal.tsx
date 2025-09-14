import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Venue, User, SocialPlatform, AnyEvent, UserRole, Group, SocialLink, Gender, EventType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { WebIcon, FacebookIcon, InstagramIcon, DaumCafeIcon, EditIcon, MapPinIcon, BandIcon } from './icons';
import EventCard from './EventCard';
import { COUNTRIES } from '../constants';

interface ClubDetailModalProps {
  club: Venue;
  onClose: () => void;
  onCreatorClick: (creator: User) => void;
  events: AnyEvent[];
  usersMap: Map<string, User>;
  venuesMap: Map<string, Venue>;
  groupsMap: Map<string, Group>;
  onEventClick: (event: AnyEvent) => void;
  currentUser: User | null;
  onEdit: (club: Venue) => void;
  todayString: string;
}

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);

const SocialIcon: React.FC<{ link: SocialLink }> = ({ link }) => {
  const iconProps = { className: 'w-6 h-6 text-gray-500 hover:text-blue-600 transition-colors' };
  switch (link.platform) {
    case SocialPlatform.Facebook: return <FacebookIcon {...iconProps} />;
    case SocialPlatform.Instagram: return <InstagramIcon {...iconProps} />;
    case SocialPlatform.Web: return <WebIcon {...iconProps} />;
    case SocialPlatform.DaumCafe: return <DaumCafeIcon {...iconProps} />;
    case SocialPlatform.Band: return <BandIcon {...iconProps} />;
    default: return null;
  }
};

const getEventPrimaryDate = (e: AnyEvent): string => {
    if (e.type === EventType.Milonga) return e.date;
    if (e.type === EventType.Class) return e.sessions[0]?.date || '';
    if (e.type === EventType.Workshop) return e.dates[0] || '';
    return '';
};

const ClubDetailModal: React.FC<ClubDetailModalProps> = ({ club, onClose, events, usersMap, venuesMap, groupsMap, onEventClick, currentUser, onEdit, todayString, onCreatorClick }) => {
  const { t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'info' | 'events'>('info');
  
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const minSwipeDistance = 50;

  const nextImage = useCallback(() => {
    setCurrentImageIndex(prev => (prev + 1) % club.imageUrls.length);
  }, [club.imageUrls.length]);

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + club.imageUrls.length) % club.imageUrls.length);
  };

  const resetInterval = useCallback(() => {
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
    }
    if (club.imageUrls.length > 1) {
        intervalRef.current = setInterval(nextImage, 3000);
    }
  }, [nextImage, club.imageUrls.length]);

  useEffect(() => {
    resetInterval();
    return () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };
  }, [resetInterval]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
        resetInterval();
        return;
    };
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
        nextImage();
    } else if (isRightSwipe) {
        prevImage();
    }
    resetInterval();
  };

  const handlePrevClick = () => {
    prevImage();
    resetInterval();
  };

  const handleNextClick = () => {
    nextImage();
    resetInterval();
  };
  
  const creator = usersMap.get(club.creatorId);

  const clubEvents = events.filter(e => e.venueId === club.id)
      .sort((a,b) => (getEventPrimaryDate(a) || 'z').localeCompare(getEventPrimaryDate(b) || 'z'));
  
  const canEdit = currentUser && (currentUser.roles.includes(UserRole.Admin) || currentUser.id === club.creatorId);

  const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${isActive ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-800 hover:border-gray-300'}`}>
        {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto transform transition-all max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="relative flex-shrink-0">
          <div 
            className="w-full h-56 bg-gray-100 rounded-t-lg overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
              {club.imageUrls.map((url, index) => (
                  <img key={index} src={url} alt={`${club.name} ${index + 1}`} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}/>
              ))}
          </div>
          {club.imageUrls.length > 1 && (
              <>
                  <button onClick={handlePrevClick} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 p-1 rounded-full text-white hover:bg-black/80 transition-colors"><ChevronLeftIcon /></button>
                  <button onClick={handleNextClick} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 p-1 rounded-full text-white hover:bg-black/80 transition-colors"><ChevronRightIcon /></button>
              </>
          )}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {canEdit && (
              <button onClick={() => onEdit(club)} className="p-2 text-gray-800 bg-white/50 hover:bg-white rounded-full transition-colors flex-shrink-0" aria-label={t('edit')}>
                <EditIcon className="w-5 h-5"/>
              </button>
            )}
            <button onClick={onClose} className="bg-white/50 rounded-full p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors z-20" aria-label={t('close')}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="border-b border-gray-200 flex">
            <TabButton label={t('venueInfo')} isActive={activeTab === 'info'} onClick={() => setActiveTab('info')} />
            <TabButton label={`${t('allEvents')} (${clubEvents.length})`} isActive={activeTab === 'events'} onClick={() => setActiveTab('events')} />
        </div>

        <div className="flex-grow overflow-y-auto scrollbar-hide">
          {activeTab === 'info' && (
            <div className="p-6 space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">{club.name}</h2>
                <div className="flex items-start gap-2">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0"/>
                    <div>
                        <p className="text-gray-600">{club.address}</p>
                        {club.addressEn && <p className="text-sm text-gray-400">{club.addressEn}</p>}
                         <a href={`https://map.kakao.com/link/search/${encodeURIComponent(club.address)}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline mt-1 inline-block">
                            {t('viewOnMap')}
                        </a>
                    </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <h4 className="text-base font-bold text-gray-800">{t('mapPreview')}</h4>
                  <img src={`https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=800&auto=format&fit=crop`} alt={t('mapPreview')} className="rounded-lg w-full h-40 object-cover border"/>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-gray-800">{t('transportationInfo')}</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap p-3 bg-gray-50 rounded-md border">{`${t('mockSubwayInfo')}\n${t('mockBusInfo')}`}</p>
                </div>

                {club.socialLinks && club.socialLinks.length > 0 && (
                    <div className="flex space-x-4 pt-4 border-t">
                        {club.socialLinks.map(link => (
                            <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer"><SocialIcon link={link} /></a>
                        ))}
                    </div>
                )}
                {creator && (
                    <div className="pt-4 border-t border-gray-200">
                        <button onClick={() => onCreatorClick(creator)} className="flex items-center gap-3 group">
                            <img src={creator.photoUrl} alt={creator.nickname} className="w-10 h-10 rounded-full object-cover"/>
                             <div className="flex items-baseline gap-1.5">
                                <span className="font-bold text-gray-900 group-hover:text-blue-600">{creator.nickname}</span>
                                <span className={`text-sm font-normal ${creator.gender === Gender.Tanguera ? 'text-red-500' : 'text-blue-500'}`}>
                                    {creator.nativeNickname}
                                </span>
                                {(() => {
                                    const country = COUNTRIES.find(c => c.code === creator.countryCode);
                                    return country && <span className="text-sm text-gray-400 font-medium">{country.flag}</span>
                                })()}
                            </div>
                        </button>
                    </div>
                )}
            </div>
          )}
          {activeTab === 'events' && (
            <div className="p-4 space-y-4">
                {clubEvents.length > 0 ? clubEvents.map(event => {
                    const eventCreator = usersMap.get(event.creatorId);
                    const dj = 'djId' in event && event.djId ? usersMap.get(event.djId) : null;
                    if (!eventCreator) return null;
                    return <EventCard key={event.id} event={event} creator={eventCreator} dj={dj} onCardClick={onEventClick} onCreatorClick={onCreatorClick} onEditClick={() => {}} currentUser={currentUser} todayString={todayString} usersMap={usersMap} venuesMap={venuesMap} groupsMap={groupsMap} />;
                }) : <p className="text-center text-gray-500 py-8">{t('noEventsForVenue')}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ClubDetailModal;