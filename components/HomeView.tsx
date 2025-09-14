import React, { useState, useMemo, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { AnyEvent, User, Venue, Region, EventType, BannerItem, Group, Milonga, Class, Workshop } from '../types';
import EventCard from './EventCard';
import { useLanguage } from '../contexts/LanguageContext';
import EventBanner from './EventBanner';
import { QueueListIcon, PresentationChartLineIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, MapPinIcon, ChevronDownIcon } from './icons';

const TimelineView = lazy(() => import('./TimelineView'));
const EventCalendarView = lazy(() => import('./EventCalendarView'));
// FIX: The lazy import for WorkshopCalendarView was failing because it expected a module with a 'default' export. This has been corrected to handle the actual module structure.
const WorkshopCalendarView = lazy(() => import('./WorkshopCalendarView'));

type ViewMode = 'list' | 'timeline' | 'calendar';

const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    const day = d.getUTCDay();
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday is start
    return new Date(d.setUTCDate(diff));
};

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
};

const parseDate = (date: string): Date => {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
};

const getTodayKSTString = () => {
    return new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).split(' ')[0];
}

const HomeView: React.FC<{
  milongas: Milonga[];
  classes: Class[];
  workshops: Workshop[];
  venuesMap: Map<string, Venue>;
  usersMap: Map<string, User>;
  groupsMap: Map<string, Group>;
  onEventClick: (event: AnyEvent) => void;
  onCreatorClick: (user: User) => void;
  onEditClick: (event: AnyEvent) => void;
  currentUser: User | null;
  todayString: string;
  banners: BannerItem[];
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  onAddItem: (itemType: 'class' | 'milonga' | 'club' | 'service' | 'workshop' | 'admin' | 'group') => void;
}> = ({ milongas, classes, workshops, venuesMap, usersMap, groupsMap, onEventClick, onCreatorClick, onEditClick, currentUser, todayString, banners, currentDate, setCurrentDate, onAddItem }) => {
    const { t, locale } = useLanguage();
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [filter, setFilter] = useState<'day' | 'week' | 'month'>('day');
    const [activeTab, setActiveTab] = useState<EventType>(EventType.Milonga);
    const [selectedRegion, setSelectedRegion] = useState<Region | 'all'>('all');
    const [isRegionSelectorOpen, setIsRegionSelectorOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
    const regionSelectorRef = useRef<HTMLDivElement>(null);
  
    const eventTabs = useMemo(() => [EventType.Milonga, EventType.Class, EventType.Workshop], []);
    const activeTabIndex = useMemo(() => eventTabs.indexOf(activeTab), [activeTab, eventTabs]);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50;

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && activeTabIndex < eventTabs.length - 1) {
            setActiveTab(eventTabs[activeTabIndex + 1]);
        } else if (isRightSwipe && activeTabIndex > 0) {
            setActiveTab(eventTabs[activeTabIndex - 1]);
        }
        setTouchStart(null);
        setTouchEnd(null);
    };

    useEffect(() => {
      setFilter('day');
      setCurrentDate(parseDate(getTodayKSTString()));
      if (activeTab === EventType.Workshop) {
        setViewMode('calendar');
      } else {
        setViewMode('list');
      }
    }, [activeTab, setCurrentDate]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (regionSelectorRef.current && !regionSelectorRef.current.contains(event.target as Node)) {
                setIsRegionSelectorOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getFilteredEventsForTab = useCallback((tabType: EventType) => {
        const eventsToShow = tabType === EventType.Milonga ? milongas : tabType === EventType.Class ? classes : workshops;
        
// FIX: Replaced direct property access `event.dates` with a helper function `getDates` that correctly retrieves date information based on the `event.type`, preventing errors for `Class` events.
        const getDates = (event: AnyEvent): string[] => {
            if (event.type === EventType.Milonga) return [event.date];
            if (event.type === EventType.Class) return event.sessions.map(s => s.date);
            return (event as Workshop).dates;
        };
        
// FIX: Replaced direct property access `event.dates` with a helper function `getDates` that correctly retrieves date information based on the `event.type`, preventing errors for `Class` events.
        const getPrimaryDate = (e: AnyEvent): string => {
            if (e.type === EventType.Milonga) return e.date;
            if (e.type === EventType.Class) return e.sessions[0]?.date || '';
            return (e as Workshop).dates[0] || '';
        };

        let sorted = eventsToShow.filter(event => {
            if (selectedRegion !== 'all') {
                const venue = event.venueId ? venuesMap.get(event.venueId) : null;
                if (!venue || venue.region !== selectedRegion) return false;
            }
            const eventDates = getDates(event);
            if (eventDates.length === 0) return false;

            if (tabType === EventType.Workshop) {
                const eventYear = parseDate(eventDates[0]).getUTCFullYear();
                return eventYear === selectedYear;
            } else {
                const selectedDateStr = currentDate.toISOString().split('T')[0];
                const startOfWeek = getStartOfWeek(currentDate);
                const endOfWeek = addDays(startOfWeek, 6);
                const startOfMonth = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1));
                const endOfMonth = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 0));
                
                return eventDates.some(dateStr => {
                    const eventDate = parseDate(dateStr);
                    if (filter === 'day') return dateStr === selectedDateStr;
                    if (filter === 'week') return eventDate >= startOfWeek && eventDate <= endOfWeek;
                    if (filter === 'month') return eventDate >= startOfMonth && eventDate <= endOfMonth;
                    return false;
                });
            }
        });
            
        sorted.sort((a, b) => {
            const dateA = getPrimaryDate(a);
            const dateB = getPrimaryDate(b);
            if (!dateA) return 1;
            if (!dateB) return -1;
            return parseDate(dateA).getTime() - parseDate(dateB).getTime();
        });

        return sorted;
    }, [milongas, classes, workshops, currentDate, filter, selectedRegion, venuesMap, selectedYear]);

    const renderEventsForTab = useCallback((currentFilteredEvents: AnyEvent[]) => {
        if (currentFilteredEvents.length === 0) {
            return (
                <div className="text-center py-12">
                    <p className="text-lg font-semibold text-gray-600">{t('noEventsFound')}</p>
                    <p className="text-gray-500 mt-2">{t('tryAnotherDate')}</p>
                </div>
            );
        }
    
        const renderEventList = (events: AnyEvent[]) => (
            <div className="space-y-4">
                {events.map(event => {
                    const creator = usersMap.get(event.creatorId);
                    const dj = 'djId' in event && event.djId ? usersMap.get(event.djId) : null;
    
                    if (!creator) return null;
                    return (
                        <EventCard key={event.id} event={event} creator={creator} dj={dj} onCardClick={onEventClick} onCreatorClick={onCreatorClick} onEditClick={onEditClick} currentUser={currentUser} todayString={todayString} usersMap={usersMap} venuesMap={venuesMap} groupsMap={groupsMap} />
                    );
                })}
            </div>
        );
    
        if (selectedRegion === 'all' && viewMode === 'list') {
            const eventsByRegion = currentFilteredEvents.reduce((acc, event) => {
                const venue = event.venueId ? venuesMap.get(event.venueId) : null;
                const region = venue?.region || Region.Other;
                if (!acc[region]) acc[region] = [];
                acc[region].push(event);
                return acc;
            }, {} as Record<string, AnyEvent[]>);
    
            const regionOrder = Object.values(Region);
    
            return (
                <div className="space-y-4">
                    {regionOrder.map(region => {
                        const regionEvents = eventsByRegion[region];
                        if (!regionEvents || regionEvents.length === 0) return null;
    
                        return (
                            <div key={region}>
                                <div className="flex items-center gap-3 my-4"><div className="flex-grow h-px bg-gray-200"></div><h2 className="text-md font-bold text-gray-600">{t(region)}</h2><div className="flex-grow h-px bg-gray-200"></div></div>
                                {renderEventList(regionEvents)}
                            </div>
                        );
                    })}
                </div>
            );
        }
    
        return renderEventList(currentFilteredEvents);
    }, [usersMap, venuesMap, groupsMap, onEventClick, onCreatorClick, onEditClick, currentUser, todayString, selectedRegion, viewMode, t]);

    const renderContentForTab = useCallback((tabType: EventType) => {
        const currentFilteredEvents = getFilteredEventsForTab(tabType);
        const eventsToShowForTab = tabType === EventType.Milonga ? milongas : tabType === EventType.Class ? classes : workshops;

        switch (viewMode) {
            case 'list': return renderEventsForTab(currentFilteredEvents);
            case 'timeline':
                if (tabType === EventType.Workshop) {
                   return <Suspense fallback={<div>Loading...</div>}><TimelineView events={currentFilteredEvents} venuesMap={venuesMap} usersMap={usersMap} onEventClick={onEventClick} groupBy="month" /></Suspense>;
                }
                return <Suspense fallback={<div>Loading...</div>}><TimelineView events={currentFilteredEvents} venuesMap={venuesMap} usersMap={usersMap} onEventClick={onEventClick} /></Suspense>;
            case 'calendar':
                if (tabType === EventType.Workshop) {
                    return <Suspense fallback={<div>Loading...</div>}><WorkshopCalendarView events={currentFilteredEvents} usersMap={usersMap} venuesMap={venuesMap} groupsMap={groupsMap} onEventClick={onEventClick} onCreatorClick={onCreatorClick} onEditClick={onEditClick} currentUser={currentUser} todayString={todayString} /></Suspense>;
                }
                return <Suspense fallback={<div>Loading...</div>}><EventCalendarView events={eventsToShowForTab} usersMap={usersMap} venuesMap={venuesMap} groupsMap={groupsMap} onEventClick={onEventClick} onCreatorClick={onCreatorClick} onEditClick={onEditClick} currentUser={currentUser} todayString={todayString} /></Suspense>;
            default: return null;
        }
    }, [getFilteredEventsForTab, renderEventsForTab, viewMode, milongas, classes, workshops, currentDate, selectedRegion, venuesMap, usersMap, groupsMap, onEventClick, onCreatorClick, onEditClick, currentUser, todayString]);

    const handleFilterChange = (newFilter: 'day' | 'week' | 'month') => {
        setFilter(newFilter);
        setCurrentDate(parseDate(getTodayKSTString()));
    };

    const handleDateChange = (direction: -1 | 1) => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            if (filter === 'day') newDate.setUTCDate(newDate.getUTCDate() + direction);
            else if (filter === 'week') newDate.setUTCDate(newDate.getUTCDate() + (7 * direction));
            else { newDate.setUTCDate(1); newDate.setUTCMonth(newDate.getUTCMonth() + direction); }
            return newDate;
        });
    };
    
    const formatMMDD = (date: Date) => `${date.getUTCMonth() + 1}.${date.getUTCDate()}`;

    const weekLabel = useMemo(() => {
        const startOfWeek = getStartOfWeek(currentDate);
        const endOfWeek = addDays(startOfWeek, 6);
        return `${formatMMDD(startOfWeek)}-${formatMMDD(endOfWeek)}`;
    }, [currentDate]);

    const monthLabel = useMemo(() => {
        const koreanMonth = currentDate.toLocaleDateString('ko-KR', { month: 'long', timeZone: 'UTC' });
        const englishMonth = currentDate.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
        return `${koreanMonth} (${englishMonth})`;
    }, [currentDate]);

    const filterLabels = { day: '', week: weekLabel, month: monthLabel };
    
    const viewModeOptions = useMemo<ViewMode[]>(() => {
        if (activeTab === EventType.Workshop) return ['calendar'];
        if (filter === 'day') return ['list'];
        if (filter === 'month') return ['list', 'calendar'];
        return ['list', 'timeline'];
    }, [activeTab, filter]);
    
    useEffect(() => {
        if (!viewModeOptions.includes(viewMode)) setViewMode(viewModeOptions[0] || 'list');
    }, [viewMode, viewModeOptions]);

    const handleAddClick = () => {
        const itemTypeMap: Record<EventType, 'milonga' | 'class' | 'workshop'> = {
            [EventType.Milonga]: 'milonga', [EventType.Class]: 'class', [EventType.Workshop]: 'workshop'
        };
        const itemType = itemTypeMap[activeTab];
        if (itemType) onAddItem(itemType);
    };
    
    return (
        <div>
            <EventBanner items={banners} />
            <div className="sticky top-[56px] z-30 bg-white/90 backdrop-blur-sm -mx-4 px-4 pt-3 pb-2 border-b shadow-sm space-y-3">
                 {/* Line 1 */}
                <div className="flex justify-between items-center">
                    <div className="flex border-b-2 border-gray-200 flex-grow">
                        {eventTabs.map(type => (
                        <button key={type} onClick={() => setActiveTab(type)} className={`flex-grow text-center py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-0.5 ${activeTab === type ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                            {t(type)}
                        </button>
                        ))}
                    </div>
                    {currentUser && (
                        <button onClick={handleAddClick} className="ml-4 flex-shrink-0 flex items-center gap-1.5 bg-blue-50 text-blue-600 font-semibold px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
                            <PlusIcon className="w-4 h-4" /><span>{t('add')}</span>
                        </button>
                    )}
                </div>
                {/* Line 2 */}
                <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center bg-gray-100 p-1 rounded-lg flex-1">
                        <div ref={regionSelectorRef} className="relative flex-shrink-0">
                            <button onClick={() => setIsRegionSelectorOpen(o => !o)} className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-gray-600 bg-white rounded-md shadow-sm hover:bg-gray-50">
                                <MapPinIcon className="w-3 h-3" />
                                <span className="truncate max-w-[80px]">{selectedRegion === 'all' ? t('allRegions') : t(selectedRegion)}</span>
                                <ChevronDownIcon className="w-3 h-3" />
                            </button>
                            {isRegionSelectorOpen && (
                                <div className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-lg border z-20 w-40 max-h-60 overflow-y-auto scrollbar-hide">
                                    <ul>
                                        <li><button onClick={() => { setSelectedRegion('all'); setIsRegionSelectorOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100">{t('allRegions')}</button></li>
                                        {Object.values(Region).map(r => (<li key={r}><button onClick={() => { setSelectedRegion(r); setIsRegionSelectorOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100">{t(r)}</button></li>))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {activeTab === EventType.Workshop ? (
                            <div className="flex items-center flex-grow justify-center min-w-0">
                                <button onClick={() => setSelectedYear(y => y - 1)} className="p-1.5 rounded-full hover:bg-gray-200 flex-shrink-0"><ChevronLeftIcon className="w-4 h-4 text-gray-600" /></button>
                                <span className="font-bold text-sm text-gray-700 w-auto text-center tabular-nums px-2">{selectedYear}</span>
                                <button onClick={() => setSelectedYear(y => y + 1)} className="p-1.5 rounded-full hover:bg-gray-200 flex-shrink-0"><ChevronRightIcon className="w-4 h-4 text-gray-600" /></button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between flex-1 ml-1">
                                <div className="flex bg-white p-0.5 rounded-md shadow-sm">
                                    {(['day', 'week', 'month'] as const).map(f => (<button key={f} onClick={() => handleFilterChange(f)} className={`px-2.5 py-1 text-xs font-semibold rounded ${filter === f ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}><span>{t({ day: 'today', week: 'thisWeek', month: 'thisMonth' }[f])}</span></button>))}
                                </div>
                                <div className="flex items-center flex-grow justify-center min-w-0">
                                    <button onClick={() => handleDateChange(-1)} className="p-1.5 rounded-full hover:bg-gray-200 flex-shrink-0"><ChevronLeftIcon className="w-4 h-4 text-gray-600" /></button>
                                    {filter === 'day' ? (() => {
                                        const dateString = currentDate.toISOString().split('T')[0];
                                        const tomorrow = addDays(new Date(todayString), 1);
                                        tomorrow.setUTCHours(0,0,0,0);
                                        const tomorrowString = tomorrow.toISOString().split('T')[0];
                                        
                                        const datePart = `${currentDate.getUTCMonth() + 1}.${currentDate.getUTCDate()}`;
                                        const weekdayPart = currentDate.toLocaleDateString(locale, { weekday: 'short', timeZone: 'UTC' }).replace('.', '');
                                        
                                        let specialLabel = '';
                                        let specialLabelColor = '';
                                        if(dateString === todayString) {
                                            specialLabel = t('todayLabel');
                                            specialLabelColor = 'text-red-600';
                                        } else if (dateString === tomorrowString) {
                                            specialLabel = t('tomorrow');
                                            specialLabelColor = 'text-orange-600';
                                        }
                                        
                                        return <span className="font-bold text-sm text-gray-700 w-auto text-center tabular-nums px-2">{datePart}({weekdayPart}){specialLabel && <span className={`${specialLabelColor} ml-1`}>{specialLabel}</span>}</span>;
                                    })() : <span className="font-bold text-sm text-gray-700 w-auto text-center tabular-nums px-2">{filterLabels[filter]}</span>}
                                    <button onClick={() => handleDateChange(1)} className="p-1.5 rounded-full hover:bg-gray-200 flex-shrink-0"><ChevronRightIcon className="w-4 h-4 text-gray-600" /></button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-lg flex-shrink-0">
                        {viewModeOptions.map(vm => (<button key={vm} onClick={() => setViewMode(vm)} className={`p-1.5 rounded ${viewMode === vm ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-white/50'}`} aria-label={t(`${vm}View`)}>{vm === 'list' ? <QueueListIcon className="w-5 h-5" /> : vm === 'timeline' ? <PresentationChartLineIcon className="w-5 h-5" /> : <CalendarIcon className="w-5 h-5" />}</button>))}
                    </div>
                </div>
            </div>
            <div className="overflow-hidden mt-4" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${activeTabIndex * 100}%)` }}>
                    {eventTabs.map(tabType => (
                        <div key={tabType} className="w-full flex-shrink-0">
                            {renderContentForTab(tabType)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeView;
