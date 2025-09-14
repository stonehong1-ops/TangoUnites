import React, { useMemo, useRef, useEffect } from 'react';
import { AnyEvent, Venue, User, Class, Workshop, EventType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { MALE_AVATAR_URL, FEMALE_AVATAR_URL } from '../constants';
import { Gender } from '../types';

// Date helpers
const parseDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
};

const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
};

const diffDays = (date1: Date, date2: Date) => {
    const diffTime = date2.getTime() - date1.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

interface GanttTimelineViewProps {
  events: AnyEvent[];
  clubsMap: Map<string, Venue>;
  usersMap: Map<string, User>;
  onEventClick: (event: AnyEvent) => void;
}

// FIX: This helper function now correctly handles all event types by checking the `type` property, preventing errors when accessing date information.
const getEventDates = (e: AnyEvent): string[] => {
    if (e.type === EventType.Class) return e.sessions.map(s => s.date);
    if (e.type === EventType.Workshop) return e.dates;
    return [];
};

const GanttTimelineView: React.FC<GanttTimelineViewProps> = ({ events, clubsMap, usersMap, onEventClick }) => {
    const { t, locale } = useLanguage();
    const timelineContainerRef = useRef<HTMLDivElement>(null);

    const { workshops, timelineStart, timelineEnd, totalDays } = useMemo(() => {
        const workshops = events.filter((e): e is Class | Workshop => e.type === EventType.Class || e.type === EventType.Workshop);
        if (workshops.length === 0) {
            const today = new Date();
            return { workshops: [], timelineStart: today, timelineEnd: today, totalDays: 0 };
        }
        
        const allDates = workshops.flatMap(e => getEventDates(e).map(d => parseDate(d)));
        let minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
        let maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

        minDate = addDays(minDate, -7);
        maxDate = addDays(maxDate, 14); 
        
        const totalDays = diffDays(minDate, maxDate) + 1;
        
        return { workshops, timelineStart: minDate, timelineEnd: maxDate, totalDays };
    }, [events]);

    const dateHeaders = useMemo(() => {
        const dates = [];
        let currentDate = new Date(timelineStart);
        while (currentDate <= timelineEnd) {
            dates.push(new Date(currentDate));
            currentDate = addDays(currentDate, 1);
        }
        return dates;
    }, [timelineStart, timelineEnd]);
    
    const today = useMemo(() => {
        const now = new Date();
        return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    }, []);
    
    const todayIndex = useMemo(() => {
        if (today >= timelineStart && today <= timelineEnd) {
            return diffDays(timelineStart, today);
        }
        return -1;
    }, [today, timelineStart, timelineEnd]);

    useEffect(() => {
        if (timelineContainerRef.current && todayIndex !== -1) {
            const container = timelineContainerRef.current;
            const dayWidth = 48; // w-12
            const scrollPosition = (todayIndex * dayWidth) - (container.clientWidth / 2) + (dayWidth / 2);
            container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
        }
    }, [todayIndex]);

    const months = useMemo(() => {
        const monthMap = new Map<string, { count: number, month: number, year: number }>();
        dateHeaders.forEach(d => {
            const year = d.getUTCFullYear();
            const month = d.getUTCMonth();
            const monthKey = `${year}-${month}`;
            const current = monthMap.get(monthKey) || { count: 0, month, year };
            monthMap.set(monthKey, { ...current, count: current.count + 1 });
        });
        return Array.from(monthMap.entries()).map(([key, value]) => ({...value, key}));
    }, [dateHeaders]);

    if(workshops.length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm p-4">
            <div ref={timelineContainerRef} className="overflow-x-auto scrollbar-hide">
                <div className="relative" style={{ width: `${totalDays * 48}px` }}>
                    {/* Header */}
                    <div className="sticky top-0 bg-white z-20">
                        <div className="grid" style={{ gridTemplateColumns: `repeat(${totalDays}, 48px)` }}>
                           {months.map(({ key, count, year, month }) => (
                                <div key={key} style={{ gridColumn: `span ${count}` }} className="text-center font-bold text-gray-700 py-1 border-b-2 border-r border-gray-200">
                                    {new Date(Date.UTC(year, month)).toLocaleDateString(locale, { month: 'long', year: 'numeric'})}
                                </div>
                            ))}
                        </div>
                        <div className="grid" style={{ gridTemplateColumns: `repeat(${totalDays}, 48px)` }}>
                           {dateHeaders.map(d => (
                                <div key={d.toISOString()} className={`text-center text-sm py-1 border-r border-gray-200 ${d.getUTCDay() === 0 || d.getUTCDay() === 6 ? 'bg-gray-100' : ''}`}>
                                    {d.getUTCDate()}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Grid and Events */}
                    <div className="relative grid h-full" style={{ gridTemplateColumns: `repeat(${totalDays}, 48px)`, gridTemplateRows: `repeat(${workshops.length + 1}, auto)` }}>
                        {dateHeaders.map((d, i) => (
                             <div key={i} className={`h-full border-r border-gray-200 ${d.getUTCDay() === 0 || d.getUTCDay() === 6 ? 'bg-gray-100/50' : ''}`} style={{ gridColumn: i + 1, gridRow: '1 / -1' }}></div>
                        ))}

                        {todayIndex !== -1 && (
                             <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" style={{ left: `${todayIndex * 48 + 24}px` }}></div>
                        )}
                        
                        {workshops.map((event, index) => {
                            const eventDates = getEventDates(event);
                            const eventStart = parseDate(eventDates[0]);
                            const eventEnd = parseDate(eventDates[eventDates.length - 1]);
                            
                            const startDayIndex = diffDays(timelineStart, eventStart);
                            const durationDays = diffDays(eventStart, eventEnd) + 1;
                            
                            const creator = usersMap.get(event.creatorId);

                            return (
                                <div
                                    key={event.id}
                                    className="h-10 mt-2 z-10"
                                    style={{
                                        gridColumn: `${startDayIndex + 1} / span ${durationDays}`,
                                        gridRow: index + 2
                                    }}
                                >
                                    <button onClick={() => onEventClick(event)} className="w-full h-full bg-blue-500 hover:bg-blue-600 text-white rounded-md px-2 flex items-center justify-between text-sm font-semibold shadow-md transition-all">
                                        <span className="truncate">{event.title}</span>
                                        {creator && creator.photoUrl && <img src={creator.photoUrl} alt={creator.nickname} className="w-6 h-6 rounded-full object-cover flex-shrink-0 border-2 border-white/50" />}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GanttTimelineView;