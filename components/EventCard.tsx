import React, { useMemo } from 'react';
import { AnyEvent, User, EventType, UserRole, Gender, Milonga, Class, Workshop, Venue, Group, Region } from '../types';
import { MALE_AVATAR_URL, FEMALE_AVATAR_URL, COUNTRIES } from '../constants';
import { EditIcon, UsersIcon, MilongaIcon, ClassIcon, WorkshopIcon, MapPinIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface EventCardProps {
  event: AnyEvent;
  creator: User;
  dj?: User | null;
  onCreatorClick: (creator: User) => void;
  onEditClick: (event: AnyEvent) => void;
  onCardClick: (event: AnyEvent) => void;
  currentUser: User | null;
  todayString: string;
  usersMap: Map<string, User>;
  venuesMap: Map<string, Venue>;
  groupsMap: Map<string, Group>;
}

const getEventDates = (event: AnyEvent): string[] => {
    if (event.type === EventType.Milonga) return [event.date];
    if (event.type === EventType.Class) return event.sessions.map(s => s.date);
    if (event.type === EventType.Workshop) return event.dates;
    return [];
};

const EventTypeBadge: React.FC<{ type: EventType }> = ({ type }) => {
  const { t } = useLanguage();
  const typeStyles: Record<string, { bg: string, text: string, icon: React.ReactNode }> = {
    [EventType.Milonga]: { bg: 'bg-red-100', text: 'text-red-700', icon: <MilongaIcon className="w-4 h-4" /> },
    [EventType.Class]: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <ClassIcon className="w-4 h-4" /> },
    [EventType.Workshop]: { bg: 'bg-purple-100', text: 'text-purple-700', icon: <WorkshopIcon className="w-4 h-4" /> },
  };

  const style = typeStyles[type];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full ${style.bg} ${style.text}`}>
      {style.icon}
      <span>{t(type)}</span>
    </span>
  );
};

const MilongaCard: React.FC<Omit<EventCardProps, 'event'> & { event: Milonga }> = ({ event, dj, onCardClick, usersMap, venuesMap, todayString, currentUser, onEditClick }) => {
    const { t, locale } = useLanguage();
    const providers = useMemo(() => {
        const providerIds = event.providerIds && event.providerIds.length > 0 ? event.providerIds : [event.creatorId];
        return providerIds.map(id => usersMap.get(id)).filter((u): u is User => !!u);
    }, [event.providerIds, event.creatorId, usersMap]);
    
    const venue = useMemo(() => event.venueId ? venuesMap.get(event.venueId) : null, [event.venueId, venuesMap]);

    const canEdit = currentUser && (currentUser.roles.includes(UserRole.Admin) || providers.some(p => p.id === currentUser.id));

    const formatShortDate = (dateString: string) => {
        const tomorrow = new Date(todayString);
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        const tomorrowString = tomorrow.toISOString().split('T')[0];

        const date = new Date(dateString);
        date.setUTCHours(12);
        
        // Format: M.D(Day) e.g., 9.12(금)
        const datePart = `${date.getUTCMonth() + 1}.${date.getUTCDate()}`;
        const weekdayPart = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
        const dateLabel = `${datePart}(${weekdayPart})`;

        if (dateString === todayString) return <>{dateLabel} <span className="text-red-600 font-bold">{t('todayLabel')}</span></>;
        if (dateString === tomorrowString) return <>{dateLabel} <span className="text-orange-600 font-bold">{t('tomorrow')}</span></>;

        return dateLabel;
    }

    return (
        <div 
            className="bg-white rounded-lg shadow-sm flex transition-all transform hover:-translate-y-1 hover:shadow-md cursor-pointer border border-gray-200 hover:border-blue-300 overflow-hidden"
            onClick={() => onCardClick(event)}
        >
            <div className="w-[20%] bg-gray-200 flex-shrink-0">
                {event.posterImageUrl && (
                    <img src={event.posterImageUrl} alt={event.title} className="w-full h-full object-cover" />
                )}
            </div>
            <div className="w-[80%] p-3 flex flex-col justify-between">
                <div className="flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-bold text-gray-700">{formatShortDate(event.date)}</p>
                        <p className="text-sm font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{event.startTime}-{event.endTime}</p>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 leading-tight line-clamp-2 mb-1.5">{event.title}</h3>
                     <div className="text-sm space-y-1 text-gray-600 mt-1.5">
                        {venue && (
                            <div className="flex items-center gap-1.5 truncate">
                                <MapPinIcon className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                                <span className="truncate font-medium">{venue.name}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 truncate" title={t('providers')}>
                            <UsersIcon className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                            <span className="truncate font-medium">{providers.map(p=>p.nickname).join(', ')}</span>
                        </div>
                    </div>
                </div>
                <div className="text-sm mt-1.5 pt-1.5 border-t flex justify-between items-center">
                    {dj ? (
                         <div className="flex items-center gap-2">
                            <img src={dj.photoUrl || (dj.gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL)} alt={dj.nickname} className="w-8 h-8 rounded-full object-cover"/>
                            <div>
                                <p className="text-xs text-gray-500">DJ</p>
                                <p className="font-semibold text-gray-800">{dj.nickname}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="font-semibold text-gray-700"><span className="font-normal text-gray-500">DJ: </span><span className="font-normal">{t('undecided')}</span></p>
                    )}
                    {canEdit && (
                        <button onClick={(e) => { e.stopPropagation(); onEditClick(event); }} className="p-1.5 text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0" aria-label="Edit event">
                            <EditIcon className="w-4 h-4"/>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


const EventCard: React.FC<EventCardProps> = (props) => {
  const { event, creator, onCreatorClick, onEditClick, onCardClick, currentUser, todayString, venuesMap, groupsMap } = props;
  const { t, locale } = useLanguage();
  
  if (event.type === EventType.Milonga) {
      return <MilongaCard {...props} event={event as Milonga} />;
  }
  
  const group = event.groupId ? groupsMap.get(event.groupId) : undefined;
  const venue = event.venueId ? venuesMap.get(event.venueId) : undefined;
  const groupOrVenueName = group?.name || venue?.name || 'Tango Korea';

  const canEdit = currentUser && (currentUser.roles.includes(UserRole.Admin) || event.creatorId === currentUser.id);
  const country = COUNTRIES.find(c => c.code === creator.countryCode);
  
  const dates = getEventDates(event);

  const formatShortDate = (dateString: string) => {
    const tomorrow = new Date(todayString);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];

    if (dateString === todayString) return <span className="text-red-600 font-bold">{t('todayLabel')}</span>;
    if (dateString === tomorrowString) return <span className="text-blue-600 font-bold">{t('tomorrow')}</span>;

    const date = new Date(dateString);
    date.setUTCHours(12);
    return date.toLocaleDateString(locale, {
        month: 'numeric',
        day: 'numeric',
        weekday: 'short',
    });
  }

  const formatRangeDate = (dateString: string) => {
    const date = new Date(dateString);
    date.setUTCHours(12);
    return date.toLocaleDateString(locale, { month: 'numeric', day: 'numeric' });
  }

  return (
    <div className="bg-white rounded-lg shadow-sm flex flex-col transition-all transform hover:-translate-y-1 hover:shadow-md cursor-pointer border border-gray-200 hover:border-blue-300"
      onClick={() => onCardClick(event)}
    >
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <EventTypeBadge type={event.type} />
          <div className="text-right">
              <p className="text-md font-bold text-gray-700">
                  {dates.length > 0 && (
                      event.type === EventType.Workshop && dates.length > 1
                          ? `${formatRangeDate(dates[0])} - ${formatRangeDate(dates[dates.length - 1])}`
                          : formatShortDate(dates[0])
                  )}
              </p>
              {event.type !== EventType.Workshop && dates.length > 1 && (
                  <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-semibold ml-1">
                      +{dates.length - 1}
                  </span>
              )}
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 leading-tight mt-1 mb-1 flex-grow">{event.title}</h3>
        <p className="text-blue-600 font-semibold text-md">{groupOrVenueName}</p>
        
        {(event.type === EventType.Class && (event as Class).sessions.length > 0 && (event as Class).sessions[0].startTime) && (
            <div className="mt-4">
                <p className="text-lg font-bold text-gray-800 text-right">{(event as Class).sessions[0].startTime} - {(event as Class).sessions[0].endTime}</p>
            </div>
        )}
         {event.type === EventType.Workshop && ('detailsUrl' in event || 'signUpUrl' in event) && (
          <div className="mt-4 flex items-center gap-3">
              {event.detailsUrl && (
                  <a
                      href={event.detailsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full transition-colors text-sm shadow-sm flex-1 text-center"
                  >
                      {t('viewDetails')}
                  </a>
              )}
              {event.signUpUrl && (
                  <a
                      href={event.signUpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors text-sm shadow-sm flex-1 text-center"
                  >
                      {t('signUp')}
                  </a>
              )}
          </div>
        )}
      </div>

      <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
            <button 
              className="flex items-center cursor-pointer group"
              onClick={(e) => {
                  e.stopPropagation();
                  onCreatorClick(creator);
              }}
            >
              <img 
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-500 transition-colors" 
                src={creator.photoUrl || (creator.gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL)}
                alt={creator.nickname}
              />
              <div className="ml-3 flex items-baseline gap-1.5">
                <p className="font-semibold text-sm text-gray-800 group-hover:text-blue-600 transition-colors">{creator.nickname}</p>
                <p className={`text-xs font-normal ${creator.gender === Gender.Tanguera ? 'text-red-500' : 'text-blue-500'}`}>
                  {creator.nativeNickname}
                </p>
                {country && (
                  <p className="text-xs text-gray-400 font-medium">{country.flag}</p>
                )}
              </div>
            </button>
            {canEdit && (
                <button
                  onClick={(e) => {
                      e.stopPropagation();
                      onEditClick(event);
                  }}
                  className="p-1.5 text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  aria-label="Edit event"
                >
                  <EditIcon className="w-4 h-4"/>
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;