import React, { useState, useEffect, useMemo } from 'react';
import { Service, User, UserRole, Region, ServiceCategory, Gender } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { TrashIcon, EditIcon, PhotoIcon, XCircleIcon } from './icons';
import { ImageUploader } from './CreatePost';
import { COUNTRIES, MALE_AVATAR_URL, FEMALE_AVATAR_URL } from '../constants';

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
);
  
const ChevronRightIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
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

interface AddServiceModalProps {
  onClose: () => void;
  onSaveService: (service: Omit<Service, 'id'> | Service) => void;
  serviceToEdit?: Service | null;
  currentUser: User | null;
  onDeleteService?: (serviceId: string) => void;
}

export const AddServiceModal: React.FC<AddServiceModalProps> = ({ onClose, onSaveService, serviceToEdit, currentUser, onDeleteService }) => {
    const { t, locale, language } = useLanguage();
    const [name, setName] = useState('');
    const [category, setCategory] = useState<ServiceCategory>(ServiceCategory.Lodging);
    const [region, setRegion] = useState<Region>(Region.SeoulHongdae);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set());
    const [calendarDate, setCalendarDate] = useState(getKSTNow());

    const isEditMode = !!serviceToEdit;

    useEffect(() => {
        if (isEditMode) {
            setName(serviceToEdit.name);
            setCategory(serviceToEdit.category);
            setRegion(serviceToEdit.region);
            setImageUrls(serviceToEdit.imageUrls);
            setPrice(serviceToEdit.price);
            setDescription(serviceToEdit.description);
            setUnavailableDates(new Set(serviceToEdit.unavailableDates || []));
        } else {
            setName('');
            setCategory(ServiceCategory.Lodging);
            setRegion(Region.SeoulHongdae);
            setImageUrls([]);
            setPrice('');
            setDescription('');
            setUnavailableDates(new Set());
        }
    }, [serviceToEdit, isEditMode]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        if (!name || !category || !region || !price || imageUrls.length === 0) {
            alert(t('fillAllFields'));
            return;
        }

        const serviceData = { 
            name, 
            category, 
            region, 
            hostId: currentUser.id, 
            imageUrls, 
            price, 
            description,
            unavailableDates: Array.from(unavailableDates),
        };
        
        if (isEditMode) {
            onSaveService({ ...serviceToEdit, ...serviceData });
        } else {
            onSaveService(serviceData);
        }
        onClose();
    };
    
    const handleDelete = () => {
      if (serviceToEdit && onDeleteService) {
          onDeleteService(serviceToEdit.id);
          onClose();
      }
    };

    const handleDateClick = (date: Date) => {
        const dateStr = toYYYYMMDD(date);
        setUnavailableDates(prev => {
            const newSet = new Set(prev);
            if (newSet.has(dateStr)) {
                newSet.delete(dateStr);
            } else {
                newSet.add(dateStr);
            }
            return newSet;
        });
    };

    const changeMonth = (offset: number) => {
        setCalendarDate(prev => {
            const newDate = new Date(prev);
            newDate.setUTCMonth(newDate.getUTCMonth() + offset, 1);
            return newDate;
        });
    };

    const CalendarView = () => {
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
            <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                    <button type="button" onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200 text-gray-600"><ChevronLeftIcon className="w-5 h-5"/></button>
                    <h4 className="font-bold text-gray-800 text-center">{monthName}</h4>
                    <button type="button" onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200 text-gray-600"><ChevronRightIcon className="w-5 h-5"/></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">{daysOfWeek.map(day => <div key={day}>{day}</div>)}</div>
                <div className="grid grid-cols-7 gap-1 place-items-center">
                    {calendarDays.map((day, i) => {
                        if (!day) return <div key={`empty-${i}`} />;
                        const dayDate = new Date(Date.UTC(year, month, day));
                        const dateStr = toYYYYMMDD(dayDate);
                        const isUnavailable = unavailableDates.has(dateStr);
                        return (
                            <button type="button" key={dateStr} onClick={() => handleDateClick(dayDate)} className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-colors relative ${isUnavailable ? 'bg-red-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}>
                                {day}
                            </button>
                        )
                    })}
                </div>
            </div>
        );
    }

    const inputClass = "w-full bg-gray-50 text-gray-900 rounded-md p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-8 w-full max-w-md mx-auto transform transition-all max-h-[90vh] overflow-y-auto scrollbar-hide" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                    {isEditMode ? t('editService') : t('addNewService')}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelClass}>{t('serviceName')}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>{t('serviceCategory')}</label>
                            <select value={category} onChange={e => setCategory(e.target.value as ServiceCategory)} className={inputClass} required>
                                {Object.values(ServiceCategory).map(c => <option key={c} value={c}>{t(c)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>{t('region')}</label>
                            <select value={region} onChange={e => setRegion(e.target.value as Region)} className={inputClass} required>
                                {Object.values(Region).map(r => <option key={r} value={r}>{t(r)}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>{t('price')}</label>
                        <input type="text" value={price} onChange={e => setPrice(e.target.value)} className={inputClass} placeholder={t('pricePlaceholder')} required />
                    </div>
                    <div>
                        <label className={labelClass}>{t('description')}</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className={inputClass} rows={3}></textarea>
                    </div>
                    <ImageUploader imageUrls={imageUrls} setImageUrls={setImageUrls} />
                    <div>
                      <label className={labelClass}>{t('unavailableDates')}</label>
                      <CalendarView />
                    </div>
                    <div className="flex justify-between items-center pt-4">
                        <div>
                            {isEditMode && onDeleteService && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="py-2 px-6 rounded-full text-red-500 border border-red-500 hover:bg-red-500/10 transition"
                                >
                                    {t('delete')}
                                </button>
                            )}
                        </div>
                        <div className="flex space-x-4">
                            <button type="button" onClick={onClose} className="py-2 px-6 rounded-full text-gray-700 bg-gray-200 hover:bg-gray-300 transition">{t('cancel')}</button>
                            <button type="submit" className="py-2 px-6 rounded-full text-white bg-blue-600 hover:bg-blue-700 font-bold transition">
                                {isEditMode ? t('saveChanges') : t('addService')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
         </div>
    );
};

interface ServiceListProps {
  services: Service[];
  onCardClick: (service: Service) => void;
  onEditClick: (service: Service) => void;
  onDeleteClick: (serviceId: string) => void;
  onHostClick: (user: User) => void;
  usersMap: Map<string, User>;
  currentUser: User | null;
}

const ServiceCard: React.FC<{ 
    service: Service; 
    host?: User;
    currentUser: User | null;
    onClick: () => void; 
    onEditClick: () => void;
    onDeleteClick: (serviceId: string) => void;
    onHostClick: (host: User) => void;
}> = ({ service, host, currentUser, onClick, onEditClick, onHostClick }) => {
    const { t, language, locale } = useLanguage();
    const canEdit = currentUser && (currentUser.roles.includes(UserRole.Admin) || currentUser.id === service.hostId);

    const nextAvailableDateText = useMemo(() => {
        if (!service.unavailableDates) return null;
    
        const today = getKSTNow();
        today.setUTCHours(0, 0, 0, 0);
        let nextDate = new Date(today);
    
        while(service.unavailableDates.includes(toYYYYMMDD(nextDate))) {
            nextDate.setUTCDate(nextDate.getUTCDate() + 1);
        }
        
        if (toYYYYMMDD(nextDate) === toYYYYMMDD(today)) {
            return null;
        }
    
        const formattedDate = language === 'ko' 
            ? `${nextDate.getUTCMonth() + 1}.${nextDate.getUTCDate()}`
            : nextDate.toLocaleDateString(locale, { timeZone: 'UTC', month: 'short', day: 'numeric' });
        
        return t('availableFromDate').replace('{date}', formattedDate);
    }, [service.unavailableDates, language, locale, t]);

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden transform transition-transform hover:-translate-y-1 hover:shadow-blue-200 border border-gray-200 flex flex-col group">
            <div className="relative">
                <div onClick={onClick} className="w-full h-48 overflow-x-auto flex snap-x snap-mandatory scrollbar-hide cursor-pointer">
                    {service.imageUrls.map((url, index) => (
                        <img key={index} src={url} alt={`${service.name} ${index+1}`} className="w-full h-full object-cover flex-shrink-0 snap-center" />
                    ))}
                </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                 <span className="text-xs font-semibold text-violet-500">{t(service.category)}</span>
                <div className="flex justify-between items-start gap-2 mt-1">
                    <h3 onClick={onClick} className="text-lg font-bold text-gray-900 flex-1 cursor-pointer">{service.name}</h3>
                    <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-gray-900 whitespace-nowrap">{service.price}</p>
                    </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">{t(service.region)}</p>
                {nextAvailableDateText && (
                    <p className="text-sm text-green-600 font-semibold mt-2">{nextAvailableDateText}</p>
                )}
            </div>
             {host && (
                <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div 
                        className="flex items-center cursor-pointer group/host"
                        onClick={(e) => {
                            e.stopPropagation();
                            onHostClick(host);
                        }}
                        >
                        <img 
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 group-hover/host:border-blue-500 transition-colors" 
                            src={host.photoUrl || (host.gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL)} 
                            alt={host.nickname}
                        />
                        <div className="ml-3 flex items-baseline gap-1.5">
                            <p className="font-semibold text-sm text-gray-800 group-hover/host:text-blue-600 transition-colors">{host.nickname}</p>
                            <p className={`text-xs font-normal ${host.gender === Gender.Tanguera ? 'text-red-500' : 'text-blue-500'}`}>
                            {host.nativeNickname}
                            </p>
                            {(() => {
                                const country = COUNTRIES.find(c => c.code === host.countryCode);
                                return country && <p className="text-xs text-gray-400 font-medium">{country.flag}</p>;
                            })()}
                        </div>
                        </div>
                        {canEdit && (
                            <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditClick();
                            }}
                            className="p-1.5 text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                            aria-label={t('edit')}
                            >
                            <EditIcon className="w-4 h-4"/>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const ServiceList: React.FC<ServiceListProps> = ({ services, onCardClick, onEditClick, onDeleteClick, onHostClick, usersMap, currentUser }) => {
  const { t } = useLanguage();

  return (
    <>
      {services.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
              {services.map(service => {
                const host = usersMap.get(service.hostId);
                return (
                    <ServiceCard 
                        key={service.id} 
                        service={service} 
                        host={host}
                        currentUser={currentUser}
                        onClick={() => onCardClick(service)} 
                        onEditClick={() => onEditClick(service)}
                        onDeleteClick={onDeleteClick}
                        onHostClick={onHostClick}
                    />
                )
              })}
          </div>
      ) : (
          <div className="text-center py-16">
              <h2 className="text-2xl font-semibold text-gray-600">{t('noServicesFound')}</h2>
          </div>
      )}
    </>
  );
};

export default ServiceList;