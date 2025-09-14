import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Milonga, User, EventType, Venue, UserRole, Group, Region, AnyEvent, Class, Workshop, ClassSession } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { PhotoIcon } from './icons';
import { DEFAULT_POSTER_URL } from '../constants';

interface AddEventModalProps {
  venues: Venue[];
  users: User[];
  groups: Group[];
  onClose: () => void;
  onSaveEvent: (event: Omit<AnyEvent, 'id'>, isRecurring: boolean) => void;
  onUpdateEvent: (event: AnyEvent) => void;
  eventToEdit?: AnyEvent | null;
  eventTypeForCreate?: EventType | null;
  currentUser: User | null;
}

const getKSTNow = (): Date => {
  const now = new Date();
  const kstDateTimeString = now.toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' });
  const formattedUTCString = kstDateTimeString.replace(' ', 'T') + 'Z';
  return new Date(formattedUTCString);
};

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
);
  
const ChevronRightIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
);

const inputClass = "w-full bg-gray-50 text-gray-900 rounded-md p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

// NOTE: This component is now a generic event modal, but the filename remains AddMilongaModal.tsx due to project constraints.
const AddEventModal: React.FC<AddEventModalProps> = ({ venues, users, groups, onClose, onSaveEvent, onUpdateEvent, eventToEdit, eventTypeForCreate, currentUser }) => {
  const { t, locale, language } = useLanguage();
  
  const eventType = useMemo(() => eventToEdit?.type || eventTypeForCreate, [eventToEdit, eventTypeForCreate]);
  
  const [title, setTitle] = useState('');
  const [dates, setDates] = useState<string[]>([getKSTNow().toISOString().split('T')[0]]);
  const [calendarDate, setCalendarDate] = useState(getKSTNow());
  const [startTime, setStartTime] = useState('21:00');
  const [endTime, setEndTime] = useState('02:00');
  const [groupId, setGroupId] = useState('');
  const [venueId, setVenueId] = useState('');
  const [djId, setDjId] = useState('');
  const [description, setDescription] = useState('');
  const [posterImageUrl, setPosterImageUrl] = useState<string | null>(null);
  const [providerIds, setProviderIds] = useState<string[]>([]);
  
  const [isRecurring, setIsRecurring] = useState(false);
  const [hasSignUp, setHasSignUp] = useState(false);
  const [signUpDescription, setSignUpDescription] = useState('');
  const [maxAttendees, setMaxAttendees] = useState<number | ''>('');
  
  const [venueSearch, setVenueSearch] = useState('');
  const [djSearch, setDjSearch] = useState('');

  const isEditMode = !!eventToEdit;
  
  const djs = useMemo(() => users.filter(u => u.roles.includes(UserRole.DJ)), [users]);
  const providers = useMemo(() => users.filter(u => u.roles.includes(UserRole.Organizer) || u.roles.includes(UserRole.ServiceProvider)), [users]);

  useEffect(() => {
    if (isEditMode && eventToEdit) {
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description);
      setGroupId(eventToEdit.groupId || '');
      setVenueId(eventToEdit.venueId || '');
      
      if (eventToEdit.type === EventType.Milonga) {
        setPosterImageUrl(eventToEdit.posterImageUrl || null);
        setStartTime(eventToEdit.startTime || '21:00');
        setEndTime(eventToEdit.endTime || '02:00');
        setDates([eventToEdit.date]);
        setDjId(eventToEdit.djId || '');
        setProviderIds(eventToEdit.providerIds || [eventToEdit.creatorId]);
        setIsRecurring(!!eventToEdit.seriesId);
        setHasSignUp(eventToEdit.hasSignUp || false);
        setSignUpDescription(eventToEdit.signUpDescription || '');
        setMaxAttendees(eventToEdit.maxAttendees || '');
        if(eventToEdit.djId) setDjSearch(djs.find(d=>d.id === eventToEdit.djId)?.nickname || '');
      } else if (eventToEdit.type === EventType.Class) {
          setDates(eventToEdit.sessions.map(s => s.date));
          setStartTime(eventToEdit.sessions[0]?.startTime || '19:00');
          setEndTime(eventToEdit.sessions[0]?.endTime || '21:00');
          setProviderIds([eventToEdit.creatorId]);
      } else { // Workshop
        setDates(eventToEdit.dates);
        // FIX: Removed attempt to set startTime and endTime for Workshop, which does not have these properties. This resolves a type error.
        setProviderIds([eventToEdit.creatorId]);
      }

      if(eventToEdit.venueId) setVenueSearch(venues.find(v => v.id === eventToEdit.venueId)?.name || '');
    } else {
      setTitle('');
      setDates([getKSTNow().toISOString().split('T')[0]]);
      setCalendarDate(getKSTNow());
      setStartTime('21:00');
      setEndTime('02:00');
      setGroupId('');
      setVenueId('');
      setDjId('');
      setDescription('');
      setPosterImageUrl(null);
      setProviderIds(currentUser ? [currentUser.id] : []);
      setIsRecurring(false);
      setHasSignUp(false);
      setSignUpDescription('');
      setMaxAttendees('');
      setVenueSearch('');
      setDjSearch('');
    }
  }, [isEditMode, eventToEdit, currentUser, venues, djs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !title || dates.length === 0) {
      alert(t('fillAllFields'));
      return;
    }

    const baseEventData = { title, description, venueId: venueId || undefined, groupId: groupId || undefined };

    if (isEditMode && eventToEdit) {
        let updatedEvent: AnyEvent;
        switch (eventType) {
            case EventType.Class:
                // FIX: Construct a `sessions` array for Class events.
                const sessions: ClassSession[] = dates.map(date => ({ date, startTime, endTime }));
                updatedEvent = { ...(eventToEdit as Class), ...baseEventData, type: EventType.Class, sessions, creatorId: providerIds[0] || eventToEdit.creatorId };
                onUpdateEvent(updatedEvent);
                break;
            case EventType.Workshop:
                 updatedEvent = { ...(eventToEdit as Workshop), ...baseEventData, type: EventType.Workshop, dates: [dates[0], dates[dates.length - 1] || dates[0]], creatorId: providerIds[0] || eventToEdit.creatorId };
                onUpdateEvent(updatedEvent);
                break;
            case EventType.Milonga:
            default:
                 if(providerIds.length === 0) { alert(t('atLeastOneProvider')); return; }
                 updatedEvent = { ...(eventToEdit as Milonga), ...baseEventData, type: EventType.Milonga, date: dates[0], startTime, endTime, djId: djId || undefined, providerIds, posterImageUrl: posterImageUrl || undefined, hasSignUp, signUpDescription, maxAttendees: maxAttendees ? Number(maxAttendees) : undefined, creatorId: eventToEdit.creatorId };
                onUpdateEvent(updatedEvent);
                break;
        }
    } else {
        switch (eventType) {
            case EventType.Class: {
                // FIX: Construct a `sessions` array for Class events.
                const sessions: ClassSession[] = dates.map(date => ({ date, startTime, endTime }));
                const classData: Omit<Class, 'id'> = { ...baseEventData, type: EventType.Class, creatorId: providerIds[0] || currentUser.id, sessions };
                onSaveEvent(classData, isRecurring);
                break;
            }
            case EventType.Workshop: {
                const workshopData: Omit<Workshop, 'id'> = { ...baseEventData, type: EventType.Workshop, creatorId: providerIds[0] || currentUser.id, dates: [dates[0], dates[dates.length - 1] || dates[0]] };
                onSaveEvent(workshopData, isRecurring);
                break;
            }
            case EventType.Milonga:
            default: {
                if(providerIds.length === 0) { alert(t('atLeastOneProvider')); return; }
                const milongaData: Omit<Milonga, 'id'> = { ...baseEventData, type: EventType.Milonga, creatorId: currentUser.id, date: dates[0], startTime, endTime, djId: djId || undefined, providerIds, posterImageUrl: posterImageUrl || undefined, hasSignUp, signUpDescription, maxAttendees: maxAttendees ? Number(maxAttendees) : undefined };
                onSaveEvent(milongaData, isRecurring);
                break;
            }
        }
    }
    onClose();
  };
  
  // ... (rest of the functions: handlePosterChange, changeMonth, calendar rendering, Searchable selects)

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setPosterImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const changeMonth = (offset: number) => {
    setCalendarDate(prev => {
        const newDate = new Date(prev);
        newDate.setUTCMonth(newDate.getUTCMonth() + offset, 1);
        return newDate;
    });
  };
  
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const titleKey = isEditMode 
    ? `edit${capitalize(eventType || '')}` 
    : `add${capitalize(eventType || '')}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-6 w-full max-w-md mx-auto transform transition-all max-h-[90vh] overflow-y-auto scrollbar-hide" onClick={e => e.stopPropagation()}>
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">{t(titleKey)}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder={t('eventTitle')} value={title} onChange={e => setTitle(e.target.value)} className={inputClass} required />
            
            {eventType === EventType.Milonga && !isEditMode && (
                <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="w-5 h-5 rounded text-blue-500" />
                        <span className="font-semibold text-gray-800">{t('repeatWeekly')}</span>
                    </label>
                    {isRecurring && <p className="text-xs text-gray-500 mt-1 pl-8">{t('repeatWeeklyHelp')}</p>}
                </div>
            )}
            
            {/* DATE PICKER WILL GO HERE */}

            {(eventType === EventType.Milonga || eventType === EventType.Class) && (
                <div className="grid grid-cols-2 gap-4">
                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputClass} required />
                    <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputClass} required />
                </div>
            )}

            {eventType === EventType.Milonga && (
              <div>
                <label className={labelClass}>{t('poster')}</label>
                <div className="flex items-center gap-4">
                    <div className="w-24 aspect-[9/16] bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border">
                        {posterImageUrl ? <img src={posterImageUrl} alt="Poster preview" className="w-full h-full object-cover"/> : <PhotoIcon className="w-8 h-8 text-gray-400"/>}
                    </div>
                    <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition text-sm">
                      <span>{t('selectFile')}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePosterChange} />
                    </label>
                </div>
              </div>
            )}

            <textarea placeholder={t('description')} value={description} onChange={e => setDescription(e.target.value)} className={inputClass} rows={3}></textarea>
            
            {/* VENUE/GROUP/PROVIDER/DJ SELECTS WILL GO HERE */}

            {eventType === EventType.Milonga && (
              <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={hasSignUp} onChange={e => setHasSignUp(e.target.checked)} className="w-5 h-5 rounded text-blue-500" />
                      <span className="font-semibold text-gray-800">{t('enableSignUpEvent')}</span>
                  </label>
                  {hasSignUp && (
                      <div className="pl-8 mt-2 space-y-2">
                          <input type="text" value={signUpDescription} onChange={e => setSignUpDescription(e.target.value)} placeholder={t('signUpDescriptionPlaceholder')} className={inputClass} />
                          <input type="number" value={maxAttendees} onChange={e => setMaxAttendees(e.target.value === '' ? '' : Number(e.target.value))} placeholder={t('maxAttendees')} className={inputClass} />
                      </div>
                  )}
              </div>
            )}

            <div className="flex justify-end items-center pt-4">
                <div className="flex space-x-4">
                    <button type="button" onClick={onClose} className="py-2 px-6 rounded-full text-gray-700 bg-gray-200 hover:bg-gray-300 transition">{t('cancel')}</button>
                    <button type="submit" className="py-2 px-6 rounded-full text-white bg-blue-600 hover:bg-blue-700 font-bold transition">
                       {isEditMode ? t('saveChanges') : t('add')}
                    </button>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;