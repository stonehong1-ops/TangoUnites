import React, { useState, useMemo } from 'react';
// FIX: Replaced Lodging with Service
import { Service, User, UserRole } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface LodgingDetailModalProps {
  // FIX: Replaced Lodging with Service
  lodging: Service;
  onClose: () => void;
  host?: User;
  currentUser: User | null;
  onHostClick: (user: User) => void;
}

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);

const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const toYYYYMMDD = (date: Date) => {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
};

const LodgingDetailModal: React.FC<LodgingDetailModalProps> = ({ lodging, onClose, host, currentUser, onHostClick }) => {
    const { t, locale, language } = useLanguage();

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    // FIX: Removed logic for `availableFromDate` which is not on the Service type.
    const canEditCalendar = false; // This is a detail modal, not an edit modal.

    const [currentDate, setCurrentDate] = useState(new Date(today));
    // FIX: Use lodging.unavailableDates to display data, not local state for editing.
    const unavailableDates = useMemo(() => new Set(lodging.unavailableDates || []), [lodging.unavailableDates]);

    const handleDateClick = (date: Date) => {
        // This is a detail modal, so no editing logic is needed here.
    };

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset, 1);
            return newDate;
        });
    };
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthName = currentDate.toLocaleDateString(locale, { month: language === 'en' ? 'short' : 'long', year: 'numeric' });
    const daysOfWeek = useMemo(() => {
        const format = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(2023, 0, 1 + i);
            days.push(format.format(date));
        }
        return days;
    }, [locale]);

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(year, month, day);
        const dateStr = toYYYYMMDD(dayDate);
        
        const isUnavailableByUser = unavailableDates.has(dateStr);
        // FIX: Removed `isBeforeAvailable`
        const isPast = dayDate < today;
        const isDisabled = isPast;
        const isClickable = canEditCalendar && !isDisabled;

        let dayClasses = "w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold transition-colors relative";
        
        if (isDisabled) dayClasses += " text-gray-300 cursor-not-allowed line-through";
        else if (isUnavailableByUser) dayClasses += " text-red-400" + (isClickable ? " cursor-pointer" : "");
        else dayClasses += " text-gray-700" + (isClickable ? " hover:bg-blue-600 hover:text-white cursor-pointer" : "");
        
        calendarDays.push(
            <button key={dateStr} onClick={() => handleDateClick(dayDate)} disabled={!isClickable} className={dayClasses} aria-label={`Date ${day}`}>
                <span className={isUnavailableByUser ? 'opacity-30' : ''}>{day}</span>
                {isUnavailableByUser && <span className="absolute text-red-400 font-bold text-xl select-none">✕</span>}
            </button>
        );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
        <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-4xl mx-auto transform transition-all max-h-[90vh] flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
            <div className="md:w-1/2 flex-shrink-0 relative">
                <div className="w-full h-64 md:h-full overflow-hidden rounded-t-lg md:rounded-l-lg md:rounded-t-none bg-gray-100">
                    {lodging.imageUrls.map((url, index) => (
                        <img key={index} src={url} alt={`${lodging.name} ${index + 1}`} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`} />
                    ))}
                </div>
                 {lodging.imageUrls.length > 1 && (
                    <>
                        <button onClick={() => setCurrentImageIndex(i => (i - 1 + lodging.imageUrls.length) % lodging.imageUrls.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-1 rounded-full text-white hover:bg-black/80"><ChevronLeftIcon className="w-6 h-6"/></button>
                        <button onClick={() => setCurrentImageIndex(i => (i + 1) % lodging.imageUrls.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-1 rounded-full text-white hover:bg-black/80"><ChevronRightIcon className="w-6 h-6"/></button>
                    </>
                )}
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{lodging.name}</h2>
                        {host && (
                            <p className="text-sm text-gray-500 mt-1">
                                {lodging.region} · {t('hostedBy')}
                                <button onClick={() => onHostClick(host)} className="text-blue-600 hover:underline ml-1">{host.nickname}</button>
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="bg-gray-100 rounded-full p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors" aria-label={t('close')}>
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="mt-6 flex flex-col flex-grow">
                     <div className="flex items-center justify-between mb-4">
                        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900"><ChevronLeftIcon /></button>
                        <h3 className="text-lg font-bold text-gray-800 text-center">{monthName}</h3>
                        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900"><ChevronRightIcon /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                       {daysOfWeek.map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1 place-items-center">
                        {calendarDays}
                    </div>
                </div>

                <div className="mt-auto pt-4 text-xs text-center text-gray-500">
                    <p>{canEditCalendar ? t('lodgingCalendarAdminInfo') : t('lodgingCalendarInfo')}</p>
                </div>
            </div>
        </div>
      </div>
    );
};

export default LodgingDetailModal;