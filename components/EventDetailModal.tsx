import React, { useState, useMemo } from 'react';
import { AnyEvent, User, Venue, EventType, Gender, Group, Milonga, UserRole, Class, Workshop, Comment, ClassSession } from '../types';
import { DEFAULT_USER_PHOTO_URL, MALE_AVATAR_URL, FEMALE_AVATAR_URL, COUNTRIES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
// FIX: Added missing icon imports.
import { HeartIcon, MilongaIcon, ClassIcon, WorkshopIcon, CalendarIcon, ClockIcon, MapPinIcon, UsersIcon, UserCircleIcon, EditIcon, XMarkIcon } from './icons';
import { CommentView } from './PostCard';

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

type TabId = 'poster' | 'info' | 'attendees' | 'signup' | 'inquiry';

interface EventDetailModalProps {
  event: AnyEvent;
  creator: User;
  group?: Group;
  club?: Venue;
  dj?: User | null;
  onClose: () => void;
  onUpdateEvent: (event: AnyEvent) => void;
  onEditEvent: (event: AnyEvent) => void;
  currentUser: User | null;
  onSignUp: () => void;
  usersMap: Map<string, User>;
  onUserClick: (user: User) => void;
  initialTab?: TabId | null;
  onAddMilongaInquiry: (milongaId: string, inquiryText: string, parentInquiryId?: string) => void;
}


const AttendeeCard: React.FC<{ user: User; onUserClick: (user: User) => void; }> = ({ user, onUserClick }) => {
    const country = COUNTRIES.find(c => c.code === user.countryCode);
    return (
        <button onClick={() => onUserClick(user)} className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition text-left group">
            <img src={user.photoUrl || (user.gender === 'Tanguero' ? MALE_AVATAR_URL : FEMALE_AVATAR_URL)} alt={user.nickname} className="w-10 h-10 rounded-full object-cover" />
            <div className="flex items-baseline gap-1.5 flex-wrap">
                <p className="font-semibold text-sm text-gray-800 group-hover:text-blue-600 transition-colors">{user.nickname}</p>
                <p className={`text-xs font-normal ${user.gender === 'Tanguera' ? 'text-red-500' : 'text-blue-500'}`}>{user.nativeNickname}</p>
                {country && <p className="text-xs text-gray-400 font-medium">{country.flag}</p>}
            </div>
        </button>
    );
};

interface InquiryTabViewProps {
    inquiries: Comment[];
    milongaId: string;
    currentUser: User | null;
    usersMap: Map<string, User>;
    onAddInquiry: (milongaId: string, inquiryText: string, parentInquiryId?: string) => void;
    onAuthorClick: (user: User) => void;
}

const InquiryTabView: React.FC<InquiryTabViewProps> = ({ inquiries, milongaId, currentUser, usersMap, onAddInquiry, onAuthorClick }) => {
    const { t } = useLanguage();
    const [inquiryText, setInquiryText] = useState('');

    const handleInquirySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inquiryText.trim() && currentUser) {
            onAddInquiry(milongaId, inquiryText, undefined);
            setInquiryText('');
        }
    };

    return (
        <div className="space-y-4">
            {currentUser && (
                <form onSubmit={handleInquirySubmit} className="flex items-start gap-3">
                    <img src={currentUser.photoUrl || (currentUser.gender === 'Tanguero' ? MALE_AVATAR_URL : FEMALE_AVATAR_URL)} alt={currentUser.nickname} className="w-8 h-8 rounded-full object-cover" />
                    <input
                        type="text"
                        value={inquiryText}
                        onChange={e => setInquiryText(e.target.value)}
                        placeholder={t('askAQuestion')}
                        className="w-full bg-gray-100 text-gray-800 text-sm rounded-full py-2 px-4 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                </form>
            )}
            {inquiries && inquiries.length > 0 ? (
                inquiries.map(inquiry => (
                    <CommentView
                        key={inquiry.id}
                        comment={inquiry}
                        postId={milongaId}
                        usersMap={usersMap}
                        currentUser={currentUser}
                        onAddComment={onAddInquiry}
                        onReactToComment={() => {}} // Not implemented for inquiries
                        onAuthorClick={onAuthorClick}
                        depth={0}
                        isAnonymous={false}
                    />
                ))
            ) : (
                <p className="text-center text-gray-500 py-4">{t('askAQuestion')}</p>
            )}
        </div>
    );
};

const MilongaDetailContent: React.FC<Omit<EventDetailModalProps, 'event'> & { event: Milonga }> = ({ event, dj, club, group, onClose, onUpdateEvent, currentUser, onSignUp, usersMap, onUserClick, onEditEvent, initialTab, onAddMilongaInquiry }) => {
    const { t, locale } = useLanguage();
    const [isPosterFullscreen, setIsPosterFullscreen] = useState(false);
    const [isCreatingSignUp, setIsCreatingSignUp] = useState(false);
    const [newSignUpDescription, setNewSignUpDescription] = useState('');
    const [newMaxAttendees, setNewMaxAttendees] = useState<number | ''>('');
    
    const tabs = useMemo(() => {
        const TABS: { id: TabId; label: string }[] = [];
        if (event.posterImageUrl) TABS.push({ id: 'poster', label: t('poster') });
        TABS.push({ id: 'info', label: t('info') });
        const attendeeCount = (event.generalAttendees?.length || 0) + (event.interestedAttendees?.length || 0);
        TABS.push({ id: 'attendees', label: `${t('imGoing')} (${attendeeCount})` });
        if (event.hasSignUp || (currentUser && (event.providerIds?.includes(currentUser.id) || event.creatorId === currentUser.id))) {
            TABS.push({ id: 'signup', label: t('signUp') });
        }
        TABS.push({ id: 'inquiry', label: t('inquiryTable') });
        return TABS;
    }, [event, t, currentUser])

    const [activeTab, setActiveTab] = useState<TabId>(initialTab || tabs[0].id);
    const activeIndex = useMemo(() => tabs.findIndex(tab => tab.id === activeTab), [tabs, activeTab]);

    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50;

    const handleTouchStart = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
    const handleTouchMove = (e: React.TouchEvent) => { setTouchEnd(e.targetTouches[0].clientX); };
    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && activeIndex < tabs.length - 1) {
            setActiveTab(tabs[activeIndex + 1].id);
        } else if (isRightSwipe && activeIndex > 0) {
            setActiveTab(tabs[activeIndex - 1].id);
        }
        setTouchStart(null);
        setTouchEnd(null);
    };

    return (
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto transform transition-all max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 truncate pr-4">{event.title}</h2>
                <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="border-b border-gray-200 flex overflow-x-auto scrollbar-hide">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap px-4 ${activeTab === tab.id ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-800'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="overflow-y-auto flex-grow p-4" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                {activeTab === 'poster' && event.posterImageUrl && (
                    <img src={event.posterImageUrl} alt="Poster" className="w-full h-auto rounded-lg"/>
                )}
                {activeTab === 'info' && (
                    <div className="space-y-4">
                        <p>{event.description}</p>
                        {/* More info details can be added here */}
                    </div>
                )}
                {activeTab === 'attendees' && (
                    <div className="space-y-2">
                        {(event.generalAttendees || []).map(id => usersMap.get(id)).filter(u => u).map(user => <AttendeeCard key={user!.id} user={user!} onUserClick={onUserClick} />)}
                    </div>
                )}
                 {activeTab === 'signup' && (
                    <div>Signup Content Here</div>
                )}
                {activeTab === 'inquiry' && (
                    <InquiryTabView
                        inquiries={event.inquiries || []}
                        milongaId={event.id}
                        currentUser={currentUser}
                        usersMap={usersMap}
                        onAddInquiry={onAddMilongaInquiry}
                        onAuthorClick={onUserClick}
                    />
                )}
            </div>
        </div>
    )
};

const ClassDetailContent: React.FC<Omit<EventDetailModalProps, 'event'> & { event: Class }> = ({ event, club, group, onClose, currentUser, usersMap, onUserClick, onEditEvent, initialTab }) => {
    const { t, locale } = useLanguage();
    const instructor = usersMap.get(event.creatorId);

    const tabs = useMemo(() => {
        const TABS: { id: TabId; label: string }[] = [];
        if (event.posterImageUrl) TABS.push({ id: 'poster', label: t('poster') });
        TABS.push({ id: 'info', label: t('info') });
        return TABS;
    }, [event, t])

    const [activeTab, setActiveTab] = useState<TabId>(initialTab || tabs[0].id);
    const activeIndex = useMemo(() => tabs.findIndex(tab => tab.id === activeTab), [tabs, activeTab]);

    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50;

    const handleTouchStart = (e: React.TouchEvent) => { setTouchStart(e.targetTouches[0].clientX); };
    const handleTouchMove = (e: React.TouchEvent) => { setTouchEnd(e.targetTouches[0].clientX); };
    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > minSwipeDistance && activeIndex < tabs.length - 1) setActiveTab(tabs[activeIndex + 1].id);
        else if (distance < -minSwipeDistance && activeIndex > 0) setActiveTab(tabs[activeIndex - 1].id);
        setTouchStart(null);
        setTouchEnd(null);
    };
    
    const canEdit = currentUser && (currentUser.roles.includes(UserRole.Admin) || event.creatorId === currentUser.id);

    return (
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto transform transition-all max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 truncate pr-4">{event.title}</h2>
                <div className="flex items-center gap-2">
                    {canEdit && <button onClick={() => onEditEvent(event)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"><EditIcon className="w-5 h-5"/></button>}
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100"><XMarkIcon className="w-6 h-6" /></button>
                </div>
            </div>
            <div className="border-b border-gray-200 flex overflow-x-auto scrollbar-hide">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap px-4 ${activeTab === tab.id ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-800'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="overflow-y-auto flex-grow p-4" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                {activeTab === 'poster' && event.posterImageUrl && (
                    <img src={event.posterImageUrl} alt="Poster" className="w-full h-auto rounded-lg"/>
                )}
                {activeTab === 'info' && (
                    <div className="space-y-4">
                        {event.description && <p className="text-gray-700">{event.description}</p>}
                        
                        <div className="space-y-2 pt-4 border-t">
                            <h3 className="font-bold text-gray-800">{t('classSchedule')}</h3>
                            {event.sessions.map((session, index) => {
                                const date = new Date(session.date);
                                date.setUTCHours(12);
                                const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
                                return (
                                <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                                    <p className="text-sm text-gray-700"><span className="font-bold">[{t('sessionX').replace('{index}', (index + 1).toString())}]</span> {session.date} ({weekday})</p>
                                    <p className="text-sm font-semibold text-gray-800">{session.startTime} - {session.endTime}</p>
                                </div>
                            )})}
                        </div>

                        {instructor && (
                           <div className="flex items-center gap-2 pt-4 border-t">
                               <UserCircleIcon className="w-5 h-5 text-gray-400" />
                               <span className="font-semibold text-gray-800">{t('instructor')}: {instructor.nickname}</span>
                           </div>
                        )}
                        {club && (
                            <div className="flex items-center gap-2">
                                <MapPinIcon className="w-5 h-5 text-gray-400" />
                                <span className="font-semibold text-gray-800">{club.name}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
};

const EventDetailModal: React.FC<EventDetailModalProps> = (props) => {
    const { event, onClose, onEditEvent, currentUser, creator } = props;
    const { t } = useLanguage();

    if (event.type === EventType.Milonga) {
        return (
             <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
                <MilongaDetailContent {...props} event={event as Milonga} />
            </div>
        )
    }
    
    if (event.type === EventType.Class) {
        return (
             <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
                <ClassDetailContent {...props} event={event as Class} />
            </div>
        )
    }

    // Fallback for Workshop
    const canEdit = currentUser && (currentUser.roles.includes(UserRole.Admin) || event.creatorId === currentUser.id);
    const eventIcon = <WorkshopIcon className="w-6 h-6" />
    const eventColor = "text-purple-600";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto transform transition-all max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className={eventColor}>{eventIcon}</span>
                        <h2 className="text-xl font-bold text-gray-800 truncate pr-4">{event.title}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {canEdit && <button onClick={() => onEditEvent(event)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"><EditIcon className="w-5 h-5"/></button>}
                        <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100"><XMarkIcon className="w-6 h-6" /></button>
                    </div>
                </div>
                <div className="overflow-y-auto flex-grow p-4 space-y-4">
                    <p className="text-gray-700">{event.description}</p>
                    {/* Add more details for Workshop */}
                </div>
            </div>
        </div>
    );
};

export default EventDetailModal;
