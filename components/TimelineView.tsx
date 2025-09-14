import React from 'react';
import { AnyEvent, Venue, User, EventType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { ClockIcon, MapPinIcon, UserCircleIcon } from './icons';

interface TimelineViewProps {
  events: AnyEvent[];
  venuesMap: Map<string, Venue>;
  usersMap: Map<string, User>;
  onEventClick: (event: AnyEvent) => void;
  groupBy?: 'day' | 'month';
}

// FIX: This helper function now correctly handles all event types by checking the `type` property, preventing errors when accessing date information.
const getEventDates = (event: AnyEvent): string[] => {
  if (event.type === EventType.Milonga) return [event.date];
  if (event.type === EventType.Class) return event.sessions.map(s => s.date);
  if (event.type === EventType.Workshop) return event.dates;
  return [];
};

const TimelineView: React.FC<TimelineViewProps> = ({ events, venuesMap, usersMap, onEventClick, groupBy = 'day' }) => {
  const { t, locale } = useLanguage();

  const groupedItems = React.useMemo(() => {
    const groups: Record<string, AnyEvent[]> = {};
    events.forEach(event => {
        const primaryDateStr = getEventDates(event)[0];
        if (!primaryDateStr) return;

        const primaryDate = new Date(primaryDateStr);
        primaryDate.setUTCHours(12);

        const key = groupBy === 'month'
            ? `${primaryDate.getUTCFullYear()}-${String(primaryDate.getUTCMonth() + 1).padStart(2, '0')}` // YYYY-MM
            : primaryDate.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(event);
    });
    // Sort events within each group
    for (const key in groups) {
      groups[key].sort((a, b) => {
          const timeA = 'startTime' in a ? a.startTime : '00:00';
          const timeB = 'startTime' in b ? b.startTime : '00:00';
          return timeA.localeCompare(timeB);
      });
    }
    return groups;
  }, [events, groupBy]);

  const sortedKeys = React.useMemo(() => Object.keys(groupedItems).sort(), [groupedItems]);

  const formatWorkshopDate = (dates: string[]) => {
      if (dates.length < 1) return '';
      const start = new Date(dates[0]);
      start.setUTCHours(12);
      const end = new Date(dates[dates.length - 1]);
      end.setUTCHours(12);
      if (dates.length === 1) {
          return start.toLocaleDateString(locale, {month: 'numeric', day: 'numeric'})
      }
      return `${start.toLocaleDateString(locale, {month: 'numeric', day: 'numeric'})} - ${end.toLocaleDateString(locale, {month: 'numeric', day: 'numeric'})}`;
  }

  if (sortedKeys.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        {sortedKeys.map(key => {
          const eventsOnDate = groupedItems[key];
          const date = new Date(groupBy === 'month' ? `${key}-15T12:00:00Z` : `${key}T12:00:00Z`);
          
          const headerText = groupBy === 'month'
            ? date.toLocaleDateString(locale, { year: 'numeric', month: 'long', timeZone: 'UTC' })
            : date.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });

          return (
            <div key={key} className="mb-8 last:mb-0">
              <div className="flex items-center mb-3">
                <div className="absolute left-6 -ml-3 z-10 w-6 h-6 bg-blue-500 rounded-full border-4 border-white"></div>
                <h3 className="font-bold text-lg text-gray-800 ml-6">
                  {headerText}
                </h3>
              </div>
              
              <div className="space-y-4 ml-6">
                {eventsOnDate.map(event => {
                  const venue = event.venueId ? venuesMap.get(event.venueId) : null;
                  const creator = event.creatorId ? usersMap.get(event.creatorId) : null;
                  return (
                    <div key={event.id} className="relative pl-6">
                      <div className="absolute -left-3 top-2.5 z-10 w-3 h-3 bg-white rounded-full border-2 border-blue-500"></div>
                      <button 
                        onClick={() => onEventClick(event)}
                        className="block w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all hover:shadow-md"
                      >
                        <p className="font-bold text-gray-900">{event.title}</p>
                        {venue && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <MapPinIcon className="w-4 h-4 text-gray-400" />
                            <span>{venue.name}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm font-semibold text-gray-700 mt-2 pt-2 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-gray-500" />
                            <span>
                                {event.type === EventType.Workshop ? formatWorkshopDate(getEventDates(event)) : `${'startTime' in event ? event.startTime : ''} - ${'endTime' in event ? event.endTime : ''}`}
                            </span>
                          </div>
                          {creator && (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <UserCircleIcon className="w-4 h-4" />
                              <span>{creator.nickname}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineView;