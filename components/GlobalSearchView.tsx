import React, { useState, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { User, AnyEvent, Service, Group, Venue, Gender, EventType, Post, Milonga, Class, Workshop } from '../types';
import { SearchIcon } from './icons';
import { MALE_AVATAR_URL, FEMALE_AVATAR_URL } from '../constants';

interface GlobalSearchViewProps {
    currentUser: User | null;
    users: User[];
    events: AnyEvent[];
    services: Service[];
    groups: Group[];
    clubs: Venue[];
    posts: Post[];
    onUserClick: (user: User) => void;
    onEventClick: (event: AnyEvent) => void;
    onServiceClick: (service: Service) => void;
    onClubClick: (club: Venue) => void;
    onPostClick: (post: Post) => void;
    onGroupClick: (group: Group) => void;
    usersMap: Map<string, User>;
    venuesMap: Map<string, Venue>;
}

const timeAgo = (date: Date, t: (key: string) => string) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return t('momentsAgo');
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ` ${t('yearsAgo')}`;
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ` ${t('monthsAgo')}`;
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ` ${t('daysAgo')}`;
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ` ${t('hoursAgo')}`;
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ` ${t('minutesAgo')}`;
    return t('momentsAgo');
};

const UserResultItem: React.FC<{ item: User; onClick: () => void }> = ({ item, onClick }) => (
     <button onClick={onClick} className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition text-left">
        <img src={item.photoUrl || (item.gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL)} alt={item.nickname} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
        <div>
            <p className="font-bold text-gray-900">{item.nickname}</p>
            <p className="text-sm text-gray-500">{item.nativeNickname}</p>
        </div>
    </button>
);

const ClubResultItem: React.FC<{ item: Venue; onClick: () => void; t: (key: string) => string; }> = ({ item, onClick, t }) => (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition text-left">
        <img src={item.imageUrls[0]} alt={item.name} className="w-16 h-16 rounded-md object-cover flex-shrink-0 bg-gray-200" />
        <div className="space-y-1">
            <p className="font-bold text-gray-900">{item.name}</p>
            <p className="text-sm text-gray-500">{t(item.region)}</p>
        </div>
    </button>
);

const GroupResultItem: React.FC<{ item: Group; onClick: () => void; t: (key: string) => string; }> = ({ item, onClick, t }) => (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition text-left">
        <img src={item.imageUrls[0]} alt={item.name} className="w-16 h-16 rounded-md object-cover flex-shrink-0 bg-gray-200" />
        <div className="space-y-1">
            <p className="font-bold text-gray-900">{item.name}</p>
            <p className="text-sm text-gray-500">{t('membersCount').replace('{count}', item.memberIds.length.toString())}</p>
        </div>
    </button>
);

const ServiceResultItem: React.FC<{ item: Service; onClick: () => void; t: (key: string) => string; }> = ({ item, onClick, t }) => (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition text-left">
        <img src={item.imageUrls[0]} alt={item.name} className="w-16 h-16 rounded-md object-cover flex-shrink-0 bg-gray-200" />
        <div className="space-y-1">
            <p className="font-bold text-gray-900">{item.name}</p>
            <p className="text-sm text-gray-600">{t(item.category)}</p>
            <p className="text-sm text-gray-500">{item.price}</p>
        </div>
    </button>
);

const getEventDates = (event: AnyEvent): string[] => {
    if (event.type === EventType.Milonga) return [event.date];
    if (event.type === EventType.Class) return event.sessions.map(s => s.date);
    return (event as Workshop).dates;
};

const WorkshopResultItem: React.FC<{ item: Workshop; onClick: () => void; usersMap: Map<string, User> }> = ({ item, onClick, usersMap }) => {
    const instructor = usersMap.get(item.creatorId);
    return (
        <button onClick={onClick} className="w-full flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition text-left">
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
            </div>
            <div className="space-y-1">
                <p className="font-bold text-gray-900 line-clamp-2">{item.title}</p>
                <p className="text-sm text-gray-600">{item.dates.join(' ~ ')}</p>
                {instructor && <p className="text-sm text-gray-500">Instructor: {instructor.nickname}</p>}
            </div>
        </button>
    );
};

const ClassResultItem: React.FC<{ item: Class; onClick: () => void; usersMap: Map<string, User> }> = ({ item, onClick, usersMap }) => {
    const instructor = usersMap.get(item.creatorId);
// FIX: Use `getEventDates` to safely access date information for Class events.
    const eventDates = getEventDates(item);
    return (
        <button onClick={onClick} className="w-full flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition text-left">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0" />
            <div className="space-y-1">
                <p className="font-bold text-gray-900 line-clamp-2">{item.title}</p>
                <p className="text-sm text-gray-600">{eventDates[0]} ~</p>
                {instructor && <p className="text-sm text-gray-500">Instructor: {instructor.nickname}</p>}
            </div>
        </button>
    );
};

const MilongaResultItem: React.FC<{ item: Milonga; onClick: () => void; venuesMap: Map<string, Venue>; usersMap: Map<string, User> }> = ({ item, onClick, venuesMap, usersMap }) => {
    const venue = item.venueId ? venuesMap.get(item.venueId) : null;
    const dj = item.djId ? usersMap.get(item.djId) : null;
    return (
        <button onClick={onClick} className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition text-left">
            <img src={item.posterImageUrl} alt={item.title} className="w-16 h-28 rounded-md object-cover flex-shrink-0 bg-gray-200" />
            <div className="space-y-1">
                <p className="font-bold text-gray-900 line-clamp-2">{item.title}</p>
                <p className="text-sm text-gray-600">{item.date}</p>
                {venue && <p className="text-sm text-gray-500">{venue.name}</p>}
                {dj && <p className="text-sm text-gray-500">DJ: {dj.nickname}</p>}
            </div>
        </button>
    );
};

const PostResultItem: React.FC<{ item: Post; onClick: () => void; usersMap: Map<string, User>; t: (key:string) => string; }> = ({ item, onClick, usersMap, t }) => {
    const author = usersMap.get(item.authorId);
    return (
        <button onClick={onClick} className="w-full p-2 hover:bg-gray-50 rounded-lg transition text-left">
            <p className="text-sm text-gray-800 line-clamp-2">{item.content}</p>
            {author && <p className="text-xs text-gray-500 mt-1">{author.nickname} · {timeAgo(new Date(item.createdAt), t)}</p>}
        </button>
    );
};


export const GlobalSearchView: React.FC<GlobalSearchViewProps> = (props) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<any>(null);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    const { users, events, services, clubs, posts, onUserClick, onEventClick, onServiceClick, onClubClick, onPostClick, onGroupClick, usersMap, venuesMap, groups } = props;
    
    const handleSearch = () => {
        if (searchTerm.length < 2) {
            setResults(null);
            return;
        }

        const lowerTerm = searchTerm.toLowerCase();
        
        const foundPeople = users.filter(u => u.nickname.toLowerCase().includes(lowerTerm) || u.nativeNickname.toLowerCase().includes(lowerTerm));
        const foundClubs = clubs.filter(c => c.name.toLowerCase().includes(lowerTerm));
        const foundGroups = groups.filter(g => g.name.toLowerCase().includes(lowerTerm) || g.description.toLowerCase().includes(lowerTerm));
        const foundServices = services.filter(s => s.name.toLowerCase().includes(lowerTerm) || s.description.toLowerCase().includes(lowerTerm));
        const foundWorkshops = events.filter((e): e is Workshop => e.type === EventType.Workshop && e.title.toLowerCase().includes(lowerTerm));
        const foundClasses = events.filter((e): e is Class => e.type === EventType.Class && e.title.toLowerCase().includes(lowerTerm));
        const foundMilongas = events.filter((e): e is Milonga => e.type === EventType.Milonga && e.title.toLowerCase().includes(lowerTerm));
        const foundPosts = posts.filter(p => p.content.toLowerCase().includes(lowerTerm));

        setResults({
            people: foundPeople,
            clubs: foundClubs,
            groups: foundGroups,
            services: foundServices,
            workshops: foundWorkshops,
            classes: foundClasses,
            milongas: foundMilongas,
            posts: foundPosts
        });
    };

    const resultSections = useMemo(() => {
        if (!results) return [];
        return [
            { key: 'people', title: t('people'), data: results.people, renderer: (item: User) => <UserResultItem key={item.id} item={item} onClick={() => onUserClick(item)} /> },
            { key: 'clubs', title: t('venues'), data: results.clubs, renderer: (item: Venue) => <ClubResultItem key={item.id} item={item} onClick={() => onClubClick(item)} t={t} /> },
            { key: 'groups', title: t('cafe'), data: results.groups, renderer: (item: Group) => <GroupResultItem key={item.id} item={item} onClick={() => onGroupClick(item)} t={t} /> },
            { key: 'services', title: t('services'), data: results.services, renderer: (item: Service) => <ServiceResultItem key={item.id} item={item} onClick={() => onServiceClick(item)} t={t} /> },
            { key: 'workshops', title: t(EventType.Workshop), data: results.workshops, renderer: (item: Workshop) => <WorkshopResultItem key={item.id} item={item} onClick={() => onEventClick(item)} usersMap={usersMap} /> },
            { key: 'classes', title: t(EventType.Class), data: results.classes, renderer: (item: Class) => <ClassResultItem key={item.id} item={item} onClick={() => onEventClick(item)} usersMap={usersMap} /> },
            { key: 'milongas', title: t(EventType.Milonga), data: results.milongas, renderer: (item: Milonga) => <MilongaResultItem key={item.id} item={item} onClick={() => onEventClick(item)} venuesMap={venuesMap} usersMap={usersMap} /> },
            { key: 'posts', title: t('feed'), data: results.posts, renderer: (item: Post) => <PostResultItem key={item.id} item={item} onClick={() => onPostClick(item)} usersMap={usersMap} t={t} /> },
        ].filter(section => section.data && section.data.length > 0);
    }, [results, t, onUserClick, onClubClick, onGroupClick, onServiceClick, onEventClick, onPostClick, usersMap, venuesMap]);
    
    const toggleSectionExpansion = (key: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    const renderResultSection = (section: typeof resultSections[0]) => {
        const { key, title, data, renderer } = section;
        const isExpanded = expandedSections.has(key);
        const itemsToShow = isExpanded ? data : data.slice(0, 5);

        return (
            <div key={key} className="bg-white p-4 rounded-xl shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-3">{title}</h2>
                <div className="space-y-2">
                    {itemsToShow.map(renderer as any)}
                </div>
                {data.length > 5 && (
                    <button 
                        onClick={() => toggleSectionExpansion(key)} 
                        className="w-full text-center text-sm font-semibold text-blue-600 hover:underline mt-3 pt-2 border-t"
                    >
                        {isExpanded ? t('showLess') : `... ${t('loadMore')}`}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <input
                    type="search"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder={t('globalSearchPlaceholder')}
                    className="w-full bg-white rounded-full py-3 pl-12 pr-24 border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <SearchIcon className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <button onClick={handleSearch} className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-blue-700">
                    {t('search')}
                </button>
            </div>
            
            {!results && (
                <div className="text-center p-8 text-gray-500 bg-white rounded-xl shadow-sm">
                    <p dangerouslySetInnerHTML={{ __html: t('globalSearchPrompt')}} />
                </div>
            )}
            
            {results && (
                resultSections.length > 0 ? (
                    <div className="space-y-4">
                        {resultSections.map(renderResultSection)}
                    </div>
                ) : (
                    <div className="text-center p-8 text-gray-500 bg-white rounded-xl shadow-sm">
                        <p>{t('noResultsForTerm').replace('{term}', searchTerm)}</p>
                    </div>
                )
            )}
        </div>
    );
};