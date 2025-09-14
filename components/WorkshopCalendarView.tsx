import React, { useMemo, useRef, useEffect, useState } from 'react';
import { AnyEvent, Venue, User, Class, Workshop, EventType, Group } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import EventCard from './EventCard';
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
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
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

const getWeeksForMonth = (year: number, month: number) => { // month is 0-indexed
    const weeks: Date[][] = [];
    const firstDate = new Date(Date.UTC(year, month, 1));
    const lastDate = new Date(Date.UTC(year, month + 1, 0));

    let currentDate = new Date(firstDate);
    currentDate.setUTCDate(currentDate.getUTCDate() - firstDate.getUTCDay());

    while (currentDate.getUTCFullYear() < year || (currentDate.getUTCFullYear() === year && currentDate.getUTCMonth() <= month)) {
        const week: Date[] = [];
        for (let i = 0; i < 7; i++) {
            week.push(new Date(currentDate));
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }
        weeks.push(week);
        if (currentDate > lastDate && currentDate.getUTCDay() === 0) break;
    }
    return weeks;
};

// --- Event Layout Helper ---
const layoutEventsForWeek = (events: AnyEvent[], weekStart: Date, weekEnd: Date) => {
    const layouts: { event: AnyEvent; track: number; startDay: number; endDay: number, duration: number }[] = [];
    const tracks: { endDay: number }[][] = [];

    const weekSegments = events
        .map(event => {
            const eventDates = getEventDates(event);
            const eventStart = parseDate(eventDates[0]);
            const eventEnd = parseDate(eventDates[eventDates.length - 1]);

            const segmentStart = eventStart > weekStart ? eventStart : weekStart;
            const segmentEnd = eventEnd < weekEnd ? eventEnd : weekEnd;

            const startDay = diffDays(weekStart, segmentStart);
            const endDay = diffDays(weekStart, segmentEnd);
            
            return { event, startDay, endDay };
        })
        .sort((a, b) => {
            // FIX: Corrected sort logic to be more robust, sorting by start day then by duration descending.
            if (a.startDay !== b.startDay) return a.startDay - b.startDay;
            return (b.endDay - b.startDay) - (a.endDay - a.startDay);
        });

    for (const segment of weekSegments) {
        let placed = false;
        for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i];
            const hasConflict = track.some(placedSegment => segment.startDay <= placedSegment.endDay);
            if (!hasConflict) {
                track.push({ endDay: segment.endDay });
                layouts.push({ ...segment, duration: segment.endDay - segment.startDay + 1, track: i });
                placed = true;
                break;
            }
        }
        if (!placed) {
            const newTrackIndex = tracks.length;
            tracks.push([{ endDay: segment.endDay }]);
            layouts.push({ ...segment, duration: segment.endDay - segment.startDay + 1, track: newTrackIndex });
        }
    }
    return layouts;
};

const colorPalette = [
    { bg: 'bg-blue-200', text: 'text-blue-900', hoverBg: 'hover:bg-blue-300' },
    { bg: 'bg-green-200', text: 'text-green-900', hoverBg: 'hover:bg-green-300' },
    { bg: 'bg-yellow-200', text: 'text-yellow-900', hoverBg: 'hover:bg-yellow-300' },
    { bg: 'bg-red-200', text: 'text-red-900', hoverBg: 'hover:bg-red-300' },
    { bg: 'bg-indigo-200', text: 'text-indigo-900', hoverBg: 'hover:bg-indigo-300' },
    { bg: 'bg-pink-200', text: 'text-pink-900', hoverBg: 'hover:bg-pink-300' },
    { bg: 'bg-purple-200', text: 'text-purple-900', hoverBg: 'hover:bg-purple-300' },
    { bg: 'bg-teal-200', text: 'text-teal-900', hoverBg: 'hover:bg-teal-300' },
];

interface MonthCalendarProps {
    monthStr: string;
    events: AnyEvent[];
    todayString: string;
    selectedDate: string | null;
    onDateSelect: (date: string) => void;
    onEventClick: (event: AnyEvent) => void;
    usersMap: Map<string, User>;
    venuesMap: Map<string, Venue>;
    workshopColorMap: Map<string, typeof colorPalette[0]>;
}


const isSelected = (dayStr: string, selectedDate: string | null) => dayStr === selectedDate;

const MonthCalendar: React.FC<MonthCalendarProps> = ({ monthStr, events, todayString, selectedDate, onDateSelect, onEventClick, usersMap, venuesMap, workshopColorMap }) => {
    const { t, locale } = useLanguage();
    const [year, monthIndex] = monthStr.split('-').map(num => parseInt(num, 10));
    const date = new Date(Date.UTC(year, monthIndex - 1, 1));
    const monthName = date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    const daysOfWeek = Array.from({ length: 7 }, (_, i) => new Date(Date.UTC(2023, 0, 1 + i)).toLocaleDateString(locale, { weekday: 'short' }));
    const weeks = useMemo(() => getWeeksForMonth(year, monthIndex - 1), [year, monthIndex]);
    const MAX_TRACKS_VISIBLE = 2;

    return (
        <div className="mb-12 select-none">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{monthName}</h2>
            <div className="grid grid-cols-7 text-center font-bold text-sm text-gray-600">
                {daysOfWeek.map(day => <div key={day} className="py-2">{day}</div>)}
            </div>
            <div className="border-t border-l border-gray-200">
                {weeks.map((week, weekIndex) => {
                    const weekStart = week[0];
                    const weekEnd = week[week.length - 1];

                    const eventsInWeek = events.filter(event => {
                        const eventDates = getEventDates(event);
                        const eventStart = parseDate(eventDates[0]);
                        const eventEnd = parseDate(eventDates[eventDates.length - 1]);
                        return eventStart <= weekEnd && eventEnd >= weekStart;
                    });
                    
                    const layouts = layoutEventsForWeek(eventsInWeek, weekStart, weekEnd);
                    const maxTrack = layouts.reduce((max, l) => Math.max(max, l.track), -1);
                    const tracksToShow = Math.min(MAX_TRACKS_VISIBLE, maxTrack + 1);
                    const weekHeight = 1.75 + tracksToShow * 2.75 + (maxTrack >= MAX_TRACKS_VISIBLE ? 1.25 : 0);

                    return (
                        <div key={weekIndex} className="relative grid grid-cols-7" style={{ minHeight: `${weekHeight}rem` }}>
                            {/* Day cells */}
                            {week.map((day, dayIndex) => {
                                const dayStr = day.toISOString().split('T')[0];
                                const isCurrentMonth = day.getUTCMonth() === monthIndex - 1;
                                const isToday = dayStr === todayString;
                                // FIX: Correctly scope `eventsOnDay` to be available for `moreCount` calculation.
                                const eventsOnDay = layouts.filter(l => dayIndex >= l.startDay && dayIndex <= l.endDay);
                                const moreCount = Math.max(0, eventsOnDay.length - MAX_TRACKS_VISIBLE);
                                
                                return (
                                    <div key={dayStr} className="relative border-b border-r border-gray-200 p-1 text-xs">
                                    <div className={`absolute -top-1 -left-1 w-[calc(100%+2px)] h-[calc(100%+2px)] z-0 rounded-lg pointer-events-none transition-all duration-200
                                        ${isSelected(dayStr, selectedDate) ? 'bg-blue-100 border-2 border-blue-500' : ''}
                                        ${!isCurrentMonth ? 'bg-gray-50' : ''}
                                    `}></div>

                                    <button onClick={() => onDateSelect(dayStr)} className={`relative z-10 flex items-center justify-center font-bold w-6 h-6 rounded-full transition-colors
                                        ${isToday ? 'bg-blue-600 text-white' : ''}
                                        ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
                                    `}>
                                        {day.getUTCDate()}
                                    </button>
                                    
                                     {/* FIX: Corrected a button with an invalid `absolute` prop to a clickable div with a proper className. */}
                                     {moreCount > 0 && (
                                        <button onClick={() => onDateSelect(dayStr)} className="absolute bottom-1 left-1 text-xs font-bold text-gray-500 z-10">
                                            +{moreCount} more
                                        </button>
                                    )}

                                </div>
                                )
                            })}

                            {/* FIX: Moved event bar rendering inside the week's returned JSX to fix scoping issues. */}
                            {/* Event bars */}
                            {layouts.map(({ event, track, startDay, endDay, duration }) => {
                                if (track >= MAX_TRACKS_VISIBLE) return null;
                                const color = workshopColorMap.get(event.id) || colorPalette[0];
                                const creator = usersMap.get(event.creatorId);
                                const isStartOfWeek = startDay === 0;
                                const isEndOfWeek = endDay === 6;

                                return (
                                    <div 
                                        key={event.id + '' + weekIndex}
                                        onClick={() => onEventClick(event)}
                                        className={`absolute h-9 ${color.bg} ${color.text} ${color.hoverBg} p-1.5 flex items-center gap-2 text-xs font-semibold cursor-pointer z-10 transition-all duration-200`}
                                        style={{
                                            top: `${1.75 + track * 2.1}rem`,
                                            left: `${(startDay / 7) * 100}%`,
                                            width: `${(duration / 7) * 100}%`,
                                            borderTopLeftRadius: isStartOfWeek ? '0.5rem' : '0',
                                            borderBottomLeftRadius: isStartOfWeek ? '0.5rem' : '0',
                                            borderTopRightRadius: isEndOfWeek ? '0.5rem' : '0',
                                            borderBottomRightRadius: isEndOfWeek ? '0.5rem' : '0',
                                        }}
                                    >
                                        {creator && creator.photoUrl && <img src={creator.photoUrl} alt={creator.nickname} className="w-5 h-5 rounded-full object-cover flex-shrink-0" />}
                                        <span className="truncate">{event.title}</span>
                                    {/* FIX: Corrected malformed closing tag. */}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

interface WorkshopCalendarViewProps {
  events: AnyEvent[];
  usersMap: Map<string, User>;
  venuesMap: Map<string, Venue>;
  groupsMap: Map<string, Group>;
  onEventClick: (event: AnyEvent) => void;
  onCreatorClick: (user: User) => void;
  onEditClick: (event: AnyEvent) => void;
  currentUser: User | null;
  todayString: string;
}

const WorkshopCalendarView: React.FC<WorkshopCalendarViewProps> = (props) => {
    const { events, todayString } = props;
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const { t } = useLanguage();

    const workshops = useMemo(() => events.filter(e => e.type === EventType.Class || e.type === EventType.Workshop), [events]);
    
    const workshopColorMap = useMemo(() => {
        const map = new Map<string, typeof colorPalette[0]>();
        workshops.forEach((ws, i) => {
            map.set(ws.id, colorPalette[i % colorPalette.length]);
        });
        return map;
    }, [workshops]);

    const months = useMemo(() => {
        const monthSet = new Set<string>();
        workshops.forEach(event => {
            getEventDates(event).forEach(dateStr => {
                const date = parseDate(dateStr);
                monthSet.add(`${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`);
            });
        });
        return Array.from(monthSet).sort();
    }, [workshops]);

    const selectedEvents = useMemo(() => {
        if (!selectedDate) return [];
        return workshops.filter(event => {
            const eventDates = getEventDates(event);
            const start = parseDate(eventDates[0]);
            const end = parseDate(eventDates[eventDates.length - 1]);
            const selected = parseDate(selectedDate);
            return selected >= start && selected <= end;
        });
    }, [selectedDate, workshops]);

    if (workshops.length === 0) {
        return <div className="text-center py-12 text-gray-500">{t('noWorkshopsFound')}</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-4">
            {months.map(monthStr => (
                <MonthCalendar
                    key={monthStr}
                    monthStr={monthStr}
                    events={workshops}
                    todayString={todayString}
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    onEventClick={props.onEventClick}
                    usersMap={props.usersMap}
                    venuesMap={props.venuesMap}
                    workshopColorMap={workshopColorMap}
                />
            ))}
            {selectedDate && (
                <div className="mt-8">
                    <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3">{selectedDate}</h3>
                    <div className="space-y-4">
                        {selectedEvents.map(event => {
                             const creator = props.usersMap.get(event.creatorId);
                             const dj = 'djId' in event && event.djId ? props.usersMap.get(event.djId) : null;
                             if (!creator) return null;
                             return <EventCard key={event.id} event={event} creator={creator} dj={dj} onCardClick={props.onEventClick} onCreatorClick={props.onCreatorClick} onEditClick={props.onEditClick} currentUser={props.currentUser} todayString={todayString} usersMap={props.usersMap} venuesMap={props.venuesMap} groupsMap={props.groupsMap} />;
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkshopCalendarView;
