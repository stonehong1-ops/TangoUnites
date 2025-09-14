import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Milonga, User, EventType, Venue, UserRole, Group, AnyEvent, Class, Workshop, ClassSession } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { PhotoIcon, SearchIcon, XCircleIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from './icons';
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

const toYYYYMMDD = (date: Date) => {
    return date.toISOString().split('T')[0];
};


const inputClass = "w-full bg-gray-50 text-gray-900 rounded-md p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

const SearchableSelect: React.FC<{ items: {id: string, name: string}[], selectedId: string, onSelect: (id: string) => void, placeholder: string }> = ({ items, selectedId, onSelect, placeholder }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedItem = useMemo(() => items.find(item => item.id === selectedId), [items, selectedId]);

    useEffect(() => {
        if (selectedItem) {
            setSearchTerm(selectedItem.name);
        } else {
            setSearchTerm('');
        }
    }, [selectedItem]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                 if (selectedItem) setSearchTerm(selectedItem.name);
                 else setSearchTerm('');
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef, selectedItem]);

    const filteredItems = useMemo(() => {
        if (!searchTerm) return items;
        return items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [items, searchTerm]);

    const handleSelect = (id: string) => {
        onSelect(id);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <input
                type="text"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); onSelect(''); }}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
                className={inputClass}
            />
            {isOpen && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                    {filteredItems.map(item => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelect(item.id)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                        >
                            {item.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

const MultiSearchableSelect: React.FC<{ items: {id: string, name: string}[], selectedIds: string[], onToggle: (id: string) => void, placeholder: string }> = ({ items, selectedIds, onToggle, placeholder }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedItems = useMemo(() => items.filter(item => selectedIds.includes(item.id)), [items, selectedIds]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const filteredItems = useMemo(() => {
        return items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [items, searchTerm]);

    return (
        <div className="relative" ref={wrapperRef}>
            <div className={`${inputClass} min-h-[38px]`} onClick={() => setIsOpen(!isOpen)}>
                {selectedItems.length > 0
                    ? <div className="flex flex-wrap gap-1">{selectedItems.map(item => <span key={item.id} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">{item.name}</span>)}</div>
                    : <span className="text-gray-400">{placeholder}</span>
                }
            </div>
            {isOpen && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg p-2">
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..." className={`${inputClass} mb-2`} />
                    {filteredItems.map(item => (
                         <label key={item.id} className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded">
                            <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => onToggle(item.id)} className="w-4 h-4 rounded text-blue-600" />
                            <span className="text-sm">{item.name}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

const AddEventModal: React.FC<AddEventModalProps> = ({ venues, users, groups, onClose, onSaveEvent, onUpdateEvent, eventToEdit, eventTypeForCreate, currentUser }) => {
  const { t, locale, language } = useLanguage();
  
  const eventType = useMemo(() => eventToEdit?.type || eventTypeForCreate, [eventToEdit, eventTypeForCreate]);
  
  const [title, setTitle] = useState('');
  const [dates, setDates] = useState<string[]>([toYYYYMMDD(getKSTNow())]);
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
  
  // State for Class date management
  const [classDateInput, setClassDateInput] = useState(toYYYYMMDD(getKSTNow()));
  const [selectedClassDates, setSelectedClassDates] = useState<string[]>([]);


  const isEditMode = !!eventToEdit;
  
  const djs = useMemo(() => users.filter(u => u.roles.includes(UserRole.DJ)), [users]);
  const providers = useMemo(() => users.filter(u => u.roles.includes(UserRole.Organizer) || u.roles.includes(UserRole.Instructor)), [users]);
  const instructors = useMemo(() => users.filter(u => u.roles.includes(UserRole.Instructor)), [users]);

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
      } else if (eventToEdit.type === EventType.Class) {
        setSelectedClassDates(eventToEdit.sessions.map(s => s.date));
        setStartTime(eventToEdit.sessions[0]?.startTime || '19:00');
        setEndTime(eventToEdit.sessions[0]?.endTime || '21:00');
        setProviderIds([eventToEdit.creatorId]);
      } else { // Workshop
        setDates(eventToEdit.dates);
        setProviderIds([eventToEdit.creatorId]);
      }
    } else {
      setTitle('');
      setDates([toYYYYMMDD(getKSTNow())]);
      setSelectedClassDates([]);
      setCalendarDate(getKSTNow());
      setStartTime(eventType === EventType.Class ? '19:00' : '21:00');
      setEndTime(eventType === EventType.Class ? '21:00' : '02:00');
      setGroupId('');
      setVenueId('');
      setDjId('');
      setDescription('');
      setPosterImageUrl(null);
      setProviderIds(currentUser ? [currentUser.id] : []);
      setIsRecurring(false);
    }
  }, [isEditMode, eventToEdit, currentUser, eventType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !title) {
      alert(t('fillAllFields'));
      return;
    }
    
    const finalDates = eventType === EventType.Class ? selectedClassDates.sort() : dates;
    if (finalDates.length === 0) {
        alert(t('fillAllFields'));
        return;
    }

    const baseEventData = { title, description, venueId: venueId || undefined, groupId: groupId || undefined };

    if (isEditMode && eventToEdit) {
        let updatedEvent: AnyEvent;
        switch (eventType) {
            case EventType.Class:
                const sessions: ClassSession[] = finalDates.map(date => ({ date, startTime, endTime }));
                updatedEvent = { ...(eventToEdit as Class), ...baseEventData, type: EventType.Class, sessions, creatorId: providerIds[0] || eventToEdit.creatorId };
                onUpdateEvent(updatedEvent);
                break;
            case EventType.Workshop:
                 updatedEvent = { ...(eventToEdit as Workshop), ...baseEventData, type: EventType.Workshop, dates: [finalDates[0], finalDates[finalDates.length - 1] || finalDates[0]], creatorId: providerIds[0] || eventToEdit.creatorId };
                onUpdateEvent(updatedEvent);
                break;
            case EventType.Milonga:
            default:
                 if(providerIds.length === 0) { alert(t('atLeastOneProvider')); return; }
                 updatedEvent = { ...(eventToEdit as Milonga), ...baseEventData, type: EventType.Milonga, date: finalDates[0], startTime, endTime, djId: djId || undefined, providerIds, posterImageUrl: posterImageUrl || undefined, creatorId: eventToEdit.creatorId };
                onUpdateEvent(updatedEvent);
                break;
        }
    } else {
        switch (eventType) {
            case EventType.Class: {
                const sessions: ClassSession[] = finalDates.map(date => ({ date, startTime, endTime }));
                const classData: Omit<Class, 'id'> = { ...baseEventData, type: EventType.Class, creatorId: providerIds[0] || currentUser.id, sessions };
                onSaveEvent(classData, isRecurring);
                break;
            }
            case EventType.Workshop: {
                const workshopData: Omit<Workshop, 'id'> = { ...baseEventData, type: EventType.Workshop, creatorId: providerIds[0] || currentUser.id, dates: [finalDates[0], finalDates[finalDates.length - 1] || finalDates[0]] };
                onSaveEvent(workshopData, isRecurring);
                break;
            }
            case EventType.Milonga:
            default: {
                if(providerIds.length === 0) { alert(t('atLeastOneProvider')); return; }
                const milongaData: Omit<Milonga, 'id'> = { ...baseEventData, type: EventType.Milonga, creatorId: currentUser.id, date: finalDates[0], startTime, endTime, djId: djId || undefined, providerIds, posterImageUrl: posterImageUrl || undefined };
                onSaveEvent(milongaData, isRecurring);
                break;
            }
        }
    }
    onClose();
  };

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => setPosterImageUrl(reader.result as string);
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

  const handleDateClick = (dateStr: string) => {
    if (eventType === EventType.Milonga) {
        setDates([dateStr]);
    } else if (eventType === EventType.Class) {
        setSelectedClassDates(prev => prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr].sort());
    } else if (eventType === EventType.Workshop) {
        if (dates.length === 1 && dates[0] !== dateStr) {
            const start = dates[0] < dateStr ? dates[0] : dateStr;
            const end = dates[0] > dateStr ? dates[0] : dateStr;
            setDates([start, end]);
        } else {
            setDates([dateStr]);
        }
    }
  };

  const handleAddClassDate = () => {
      if (selectedClassDates.length >= 8) return;
      if (!selectedClassDates.includes(classDateInput)) {
          setSelectedClassDates(prev => [...prev, classDateInput].sort());
      }
  };

  const handleRemoveClassDate = (dateToRemove: string) => {
      setSelectedClassDates(prev => prev.filter(d => d !== dateToRemove));
  };
  
  const daysOfWeek = useMemo(() => Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(new Date(2023, 0, 1 + i))), [locale]);

  const renderMilongaCalendar = () => {
    const year = calendarDate.getUTCFullYear();
    const month = calendarDate.getUTCMonth();
    const monthName = calendarDate.toLocaleDateString(locale, { month: language === 'en' ? 'short' : 'long', year: 'numeric', timeZone: 'UTC' });
    
    const firstDayOfMonth = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const calendarDays = [...Array(firstDayOfMonth).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    const todayStr = toYYYYMMDD(getKSTNow());

    return (
        <div className="bg-gray-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200 text-gray-600"><ChevronLeftIcon className="w-5 h-5"/></button>
                <h4 className="font-bold text-gray-800 text-center">{monthName}</h4>
                <button type="button" onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200 text-gray-600"><ChevronRightIcon className="w-5 h-5"/></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">{daysOfWeek.map((day, i) => <div key={i}>{day}</div>)}</div>
            <div className="grid grid-cols-7 gap-1 place-items-center">
                {calendarDays.map((day, i) => {
                    if (!day) return <div key={`empty-${i}`} />;
                    const dayDate = new Date(Date.UTC(year, month, day));
                    const dateStr = toYYYYMMDD(dayDate);
                    
                    const isSelected = dates.includes(dateStr);
                    let inRange = false;
                    if (eventType === EventType.Workshop && dates.length === 2) {
                        inRange = dateStr > dates[0] && dateStr < dates[1];
                    }

                    let dayClasses = `w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-colors`;
                    if(isSelected) {
                        dayClasses += ' bg-blue-600 text-white';
                    } else if (inRange) {
                        dayClasses += ' bg-blue-200 text-blue-800';
                    } else if (dateStr === todayStr) {
                         dayClasses += ' ring-2 ring-blue-500 text-blue-600';
                    } else {
                        dayClasses += ' text-gray-700 hover:bg-gray-200';
                    }

                    return (
                        <button type="button" key={dateStr} onClick={() => handleDateClick(dateStr)} className={dayClasses}>
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
  };

  const renderClassDateManager = () => (
      <div className="space-y-3">
          <div>
              <label className={labelClass}>{t('setClassDates')}</label>
              <div className="flex gap-2">
                  <input type="date" value={classDateInput} onChange={e => setClassDateInput(e.target.value)} className={inputClass} />
                  <button type="button" onClick={handleAddClassDate} disabled={selectedClassDates.length >= 8} className="bg-blue-600 text-white font-semibold px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 transition-colors">
                      {t('add')}
                  </button>
              </div>
          </div>
          {selectedClassDates.length > 0 && (
              <div className="bg-gray-100 p-3 rounded-lg space-y-2 max-h-40 overflow-y-auto">
                  <h4 className="font-semibold text-sm text-gray-800">{t('classSchedule')} ({t('totalXSessions').replace('{count}', selectedClassDates.length.toString())})</h4>
                  {selectedClassDates.map((dateStr, index) => {
                      const date = new Date(dateStr);
                      date.setUTCHours(12);
                      const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
                      return (
                          <div key={dateStr} className="flex justify-between items-center bg-white p-2 rounded-md">
                              <p className="text-sm text-gray-700"><span className="font-bold">[{t('sessionX').replace('{index}', (index + 1).toString())}]</span> {dateStr} ({weekday})</p>
                              <button type="button" onClick={() => handleRemoveClassDate(dateStr)} className="text-gray-400 hover:text-red-500">
                                  <XMarkIcon className="w-4 h-4" />
                              </button>
                          </div>
                      );
                  })}
              </div>
          )}
      </div>
  );
  
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const titleKey = isEditMode ? `edit${capitalize(eventType || '')}` : `add${capitalize(eventType || '')}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-6 w-full max-w-md mx-auto transform transition-all max-h-[90vh] overflow-y-auto scrollbar-hide" onClick={e => e.stopPropagation()}>
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">{t(titleKey)}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder={t('eventTitle')} value={title} onChange={e => setTitle(e.target.value)} className={inputClass} required />
            
            {eventType === EventType.Milonga && !isEditMode && (
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="w-5 h-5 rounded text-blue-500" />
                    <span className="font-semibold text-gray-800">{t('repeatWeekly')}</span>
                </label>
            )}
            
            {eventType === EventType.Class ? renderClassDateManager() : renderMilongaCalendar()}

            {(eventType === EventType.Milonga || eventType === EventType.Class) && (
                <div className="grid grid-cols-2 gap-4">
                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputClass} required />
                    <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputClass} required />
                </div>
            )}
            
            <SearchableSelect items={venues.map(v => ({id: v.id, name: v.name}))} selectedId={venueId} onSelect={setVenueId} placeholder={t('selectVenue')} />
            <SearchableSelect items={groups.map(g => ({id: g.id, name: g.name}))} selectedId={groupId} onSelect={setGroupId} placeholder={t('noGroupOptional')} />
            
            {eventType === EventType.Class ? (
                 <SearchableSelect items={instructors.map(p => ({id: p.id, name: p.nickname}))} selectedId={providerIds[0] || ''} onSelect={(id) => setProviderIds([id])} placeholder={t('instructor')} />
            ) : (
                <MultiSearchableSelect items={providers.map(p => ({id: p.id, name: p.nickname}))} selectedIds={providerIds} onToggle={(id) => setProviderIds(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id])} placeholder={t('providers')} />
            )}

            {eventType === EventType.Milonga && (
                <SearchableSelect items={djs.map(d => ({id: d.id, name: d.nickname}))} selectedId={djId} onSelect={setDjId} placeholder={t('selectDjOptional')} />
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