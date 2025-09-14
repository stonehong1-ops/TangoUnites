import React, { useState, useMemo } from 'react';
import { Service, User, UserRole, Gender } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { EditIcon } from './icons';
import { COUNTRIES } from '../constants';


interface ServiceDetailModalProps {
  service: Service;
  onClose: () => void;
  host?: User;
  currentUser: User | null;
  onHostClick: (user: User) => void;
  onUpdateService: (service: Service) => void;
  onEdit: (service: Service) => void;
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

const getKSTNow = (): Date => {
  const now = new Date();
  const kstDateTimeString = now.toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' });
  const formattedUTCString = kstDateTimeString.replace(' ', 'T') + 'Z';
  return new Date(formattedUTCString);
};

const toYYYYMMDD = (date: Date) => {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
};

const ServiceCalendarView: React.FC<{
    calendarDate: Date;
    unavailableDates: string[] | undefined;
    canEdit: boolean;
    locale: string;
    language: string;
    changeMonth: (offset: number) => void;
    handleDateClick: (date: Date) => void;
}> = ({ calendarDate, unavailableDates, canEdit, locale, language, changeMonth, handleDateClick }) => {
    const { t } = useLanguage();
    const year = calendarDate.getUTCFullYear();
    const month = calendarDate.getUTCMonth();
    const monthName = calendarDate.toLocaleDateString(locale, { month: language === 'en' ? 'short' : 'long', year: 'numeric', timeZone: 'UTC' });
    const daysOfWeek = useMemo(() => {
        const format = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
        return Array.from({ length: 7 }, (_, i) => format.format(new Date(2023, 0, 1 + i)));
    }, [locale]);

    const firstDayOfMonth = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    
    const calendarDays = [...Array(firstDayOfMonth).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    
    return (
        <div className="p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200 text-gray-500"><ChevronLeftIcon className="w-6 h-6"/></button>
                <h3 className="text-lg font-bold text-gray-800 text-center">{monthName}</h3>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200 text-gray-500"><ChevronRightIcon className="w-6 h-6"/></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">{daysOfWeek.map(day => <div key={day}>{day}</div>)}</div>
            <div className="grid grid-cols-7 gap-1 place-items-center">
                {calendarDays.map((day, i) => {
                    if (!day) return <div key={`empty-${i}`} className="w-10 h-10"></div>;
                    const dayDate = new Date(Date.UTC(year, month, day));
                    const dateStr = toYYYYMMDD(dayDate);
                    const isUnavailable = unavailableDates?.includes(dateStr);
                    
                    let dayClasses = "w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold transition-colors relative";
                    if (isUnavailable) dayClasses += " text-red-400";
                    else dayClasses += " text-gray-700";

                    if (canEdit) dayClasses += " hover:bg-gray-200 cursor-pointer";
                    
                    return (
                        <button key={dateStr} onClick={() => handleDateClick(dayDate)} disabled={!canEdit} className={dayClasses}>
                            <span className={isUnavailable ? 'opacity-30' : ''}>{day}</span>
                            {isUnavailable && <span className="absolute text-red-400 font-bold text-xl select-none">✕</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({ service, onClose, host, currentUser, onHostClick, onUpdateService, onEdit }) => {
    const { t, locale, language } = useLanguage();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'info' | 'calendar'>('info');
    const [calendarDate, setCalendarDate] = useState(getKSTNow());
    const [fullscreenState, setFullscreenState] = useState<{ images: string[], currentIndex: number } | null>(null);

    const canEdit = currentUser && (currentUser.roles.includes(UserRole.Admin) || currentUser.id === service.hostId);
    
    const handleDateClick = (date: Date) => {
        if (!canEdit) return;
        
        const dateStr = toYYYYMMDD(date);
        const currentUnavailable = new Set(service.unavailableDates || []);
        if (currentUnavailable.has(dateStr)) {
            currentUnavailable.delete(dateStr);
        } else {
            currentUnavailable.add(dateStr);
        }
        onUpdateService({ ...service, unavailableDates: Array.from(currentUnavailable) });
    };

    const changeMonth = (offset: number) => {
        setCalendarDate(prev => {
            const newDate = new Date(prev);
            newDate.setUTCMonth(newDate.getUTCMonth() + offset, 1);
            return newDate;
        });
    };

    const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${isActive ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-800 hover:border-gray-300'}`}
        >
            {label}
        </button>
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
        <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-md mx-auto transform transition-all max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex-shrink-0 relative bg-gray-100">
                <div className="w-full h-64 overflow-hidden rounded-t-lg">
                    {service.imageUrls.map((url, index) => (
                        <img key={index} src={url} alt={`${service.name} ${index + 1}`} onClick={() => setFullscreenState({ images: service.imageUrls, currentIndex: currentImageIndex })} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 cursor-pointer ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`} />
                    ))}
                </div>
                 {service.imageUrls.length > 1 && (
                    <>
                        <button onClick={() => setCurrentImageIndex(i => (i - 1 + service.imageUrls.length) % service.imageUrls.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-1 rounded-full text-white hover:bg-black/80"><ChevronLeftIcon className="w-6 h-6"/></button>
                        <button onClick={() => setCurrentImageIndex(i => (i + 1) % service.imageUrls.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-1 rounded-full text-white hover:bg-black/80"><ChevronRightIcon className="w-6 h-6"/></button>
                    </>
                )}
                 <div className="absolute top-4 right-4 flex items-center gap-2">
                    {canEdit && (
                        <button 
                           onClick={() => onEdit(service)} 
                           className="p-2 text-gray-800 bg-white/50 hover:bg-white rounded-full transition-colors flex-shrink-0"
                           aria-label={t('edit')}
                       >
                           <EditIcon className="w-5 h-5"/>
                       </button>
                    )}
                    <button onClick={onClose} className="bg-white/50 rounded-full p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors z-20" aria-label={t('close')}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                 </div>
            </div>

            <div className="border-b border-gray-200 flex">
                <TabButton label={t('serviceInfo')} isActive={activeTab === 'info'} onClick={() => setActiveTab('info')} />
                <TabButton label={t('calendar')} isActive={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
            </div>

            <div className="flex flex-col flex-grow overflow-y-auto scrollbar-hide">
                {activeTab === 'info' && (
                    <div className="p-6 space-y-4">
                        <div>
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">{t(service.category)}</span>
                            <h2 className="text-2xl font-bold text-gray-900 mt-2">{service.name}</h2>
                            <p className="text-sm text-gray-500 mt-1">{t(service.region)}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('price')}</h3>
                            <p className="text-lg text-gray-900 font-semibold">{service.price}</p>
                        </div>
                        {service.description && (
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('description')}</h3>
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{service.description}</p>
                            </div>
                        )}
                        {host && (
                            <div className="pt-4 border-t border-gray-200">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{t('provider')}</h3>
                                <button onClick={() => onHostClick(host)} className="flex items-center gap-3 group">
                                    {host.photoUrl ? (
                                    <img src={host.photoUrl} alt={host.nickname} className="w-10 h-10 rounded-full object-cover transition-opacity group-hover:opacity-80" />
                                    ) : (
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"></div>
                                    )}
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-lg font-bold text-gray-900 group-hover:text-blue-600">{host.nickname}</span>
                                        <span className={`text-base font-normal ${host.gender === Gender.Tanguera ? 'text-red-500' : 'text-blue-500'}`}>
                                            {host.nativeNickname}
                                        </span>
                                        {(() => {
                                            const country = COUNTRIES.find(c => c.code === host.countryCode);
                                            return country && <span className="text-base text-gray-400 font-medium">{country.flag}</span>
                                        })()}
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'calendar' && (
                    <>
                        <ServiceCalendarView 
                            calendarDate={calendarDate}
                            unavailableDates={service.unavailableDates}
                            canEdit={canEdit}
                            locale={locale}
                            language={language}
                            changeMonth={changeMonth}
                            handleDateClick={handleDateClick}
                        />
                        <div className="p-4 text-xs text-center text-gray-500">
                            <p>{canEdit ? t('lodgingCalendarAdminInfo') : t('lodgingCalendarInfo')}</p>
                        </div>
                    </>
                )}
            </div>
            {fullscreenState && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-[100]" onClick={() => setFullscreenState(null)}>
                    <img src={fullscreenState.images[fullscreenState.currentIndex]} alt="Fullscreen" className="max-w-full max-h-full object-contain" />
                    {fullscreenState.images.length > 1 && (
                        <>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setFullscreenState(s => s && { ...s, currentIndex: (s.currentIndex - 1 + s.images.length) % s.images.length }); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/80 transition-colors z-[101]"
                            >
                                <ChevronLeftIcon className="w-8 h-8"/>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setFullscreenState(s => s && { ...s, currentIndex: (s.currentIndex + 1) % s.images.length }); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/80 transition-colors z-[101]"
                            >
                                <ChevronRightIcon className="w-8 h-8"/>
                            </button>
                        </>
                    )}
                    <button onClick={() => setFullscreenState(null)} className="absolute top-4 right-4 bg-black/50 rounded-full p-2 text-white hover:bg-black/80">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}
        </div>
      </div>
    );
};

export default ServiceDetailModal;