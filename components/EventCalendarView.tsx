import React, { useState, useMemo } from 'react';
import { AnyEvent, User, Venue, Group, EventType, Class, Workshop } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import EventCard from './EventCard';

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
);
  
const ChevronRightIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
);


interface EventCalendarViewProps {
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

// FIX: This helper function now correctly handles all event types by checking the `type` property, preventing errors when accessing date information.
const getEventDates = (event: AnyEvent): string[] => {
    if (event.type === EventType.Milonga) return [event.date];
    if (event.type === EventType.Class) return event.sessions.map(s => s.date);
    if (event.type === EventType.Workshop) return (event as Workshop).dates;
    return [];
};

const EventCalendarView: React.FC<EventCalendarViewProps> = ({ events, ...props }) => {
    const { t, locale, language } = useLanguage();
    const [calendarDate, setCalendarDate] = useState(new Date(props.todayString));
    const [selectedDate, setSelectedDate] = useState<string | null>(props.todayString);

    const eventsByDate = useMemo(() => {
        const map = new Map<string, AnyEvent[]>();
        const year = calendarDate.getUTCFullYear();
        const month = calendarDate.getUTCMonth();

        events.forEach(event => {
            getEventDates(event).forEach(dateStr => {
                const eventDate = new Date(dateStr);
                if (eventDate.getUTCFullYear() === year && eventDate.getUTCMonth() === month) {
                    const list = map.get(dateStr) || [];
                    list.push(event);
                    map.set(dateStr, list);
                }
            });
        });
        return map;
    }, [events, calendarDate]);

    const changeMonth = (offset: number) => {
        setCalendarDate(prev => {
            const newDate = new Date(prev);
            newDate.setUTCMonth(newDate.getUTCMonth() + offset, 1);
            return newDate;
        });
    };
    
    const daysOfWeek = useMemo(() => {
        const format = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
        return Array.from({ length: 7 }, (_, i) => format.format(new Date(2023, 0, 1 + i)));
    }, [locale]);

    const renderCalendar = () => {
        const year = calendarDate.getUTCFullYear();
        const month = calendarDate.getUTCMonth();
        const monthName = calendarDate.toLocaleDateString(locale, { month: language === 'en' ? 'short' : 'long', year: 'numeric', timeZone: 'UTC' });
        
        const firstDayOfMonth = new Date(Date.UTC(year, month, 1)).getUTCDay();
        const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
        const calendarDays = [];

        for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(<div key={`empty-${i}`} />);
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(Date.UTC(year, month, day));
            const dateStr = date.toISOString().split('T')[0];
            const hasEvents = eventsByDate.has(dateStr);
            const isSelected = selectedDate === dateStr;

            calendarDays.push(
                <button
                    type="button"
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-colors relative
                        ${isSelected ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'}
                    `}
                >
                    {day}
                    {hasEvents && <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`}></div>}
                </button>
            );
        }

        return (
            <div className="bg-gray-50 p-3 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                    <button type="button" onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200 text-gray-600"><ChevronLeftIcon className="w-5 h-5"/></button>
                    <h4 className="font-bold text-gray-800 text-center">{monthName}</h4>
                    <button type="button" onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200 text-gray-600"><ChevronRightIcon className="w-5 h-5"/></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                    {daysOfWeek.map((day, i) => <div key={i}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 place-items-center">
                    {calendarDays}
                </div>
            </div>
        );
    };

    const eventsForSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        return (eventsByDate.get(selectedDate) || []).sort((a,b) => ('startTime' in a && 'startTime' in b && a.startTime && b.startTime ? a.startTime.localeCompare(b.startTime) : 0));
    }, [selectedDate, eventsByDate]);

    const formatDateForHeader = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(locale, { timeZone: 'UTC', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
            <div>{renderCalendar()}</div>
            {selectedDate && (
                <div>
                    <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3">
                        {t('eventsForDate').replace('{date}', formatDateForHeader(selectedDate))}
                    </h3>
                    {eventsForSelectedDate.length > 0 ? (
                        <div className="space-y-4">
                            {eventsForSelectedDate.map(event => {
                                const creator = props.usersMap.get(event.creatorId);
                                const dj = 'djId' in event && event.djId ? props.usersMap.get(event.djId) : null;
                                if (!creator) return null;
                                return <EventCard key={event.id} event={event} creator={creator} dj={dj} onCardClick={props.onEventClick} onCreatorClick={props.onCreatorClick} onEditClick={props.onEditClick} currentUser={props.currentUser} todayString={props.todayString} usersMap={props.usersMap} venuesMap={props.venuesMap} groupsMap={props.groupsMap} />;
                            })}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-4">{t('noEventsFound')}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default EventCalendarView;