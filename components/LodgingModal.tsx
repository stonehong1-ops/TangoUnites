import React, { useState, useEffect, useRef } from 'react';
// FIX: Changed Lodging to Service and added ServiceCategory
import { Service, User, UserRole, Region, ServiceCategory } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { TrashIcon, EditIcon, PhotoIcon, XCircleIcon } from './icons';

interface AddLodgingModalProps {
  onClose: () => void;
  // FIX: Changed Lodging to Service
  onSaveLodging: (lodging: Omit<Service, 'id'> | Service) => void;
  // FIX: Changed Lodging to Service
  lodgingToEdit?: Service | null;
  users: User[];
  currentUser: User | null;
}

export const AddLodgingModal: React.FC<AddLodgingModalProps> = ({ onClose, onSaveLodging, lodgingToEdit, users, currentUser }) => {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [region, setRegion] = useState<Region>(Region.SeoulHongdae);
    const [hostId, setHostId] = useState(currentUser?.id || users[0]?.id || '');
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    // FIX: Changed from pricePerNight
    const [price, setPrice] = useState('');
    // FIX: Added for Service type
    const [description, setDescription] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isEditMode = !!lodgingToEdit;

    useEffect(() => {
        if (isEditMode && lodgingToEdit) {
            setName(lodgingToEdit.name);
            setRegion(lodgingToEdit.region);
            setHostId(lodgingToEdit.hostId);
            setImageUrls(lodgingToEdit.imageUrls);
            // FIX: Changed to price and description
            setPrice(lodgingToEdit.price);
            setDescription(lodgingToEdit.description || '');
        } else {
            setName('');
            setRegion(Region.SeoulHongdae);
            setHostId(currentUser?.id || users[0]?.id || '');
            setImageUrls([]);
            // FIX: Changed to price and description
            setPrice('');
            setDescription('');
        }
    }, [lodgingToEdit, isEditMode, currentUser, users]);
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const remainingSlots = 10 - imageUrls.length;
            if (files.length > remainingSlots) alert(t('max10Photos'));
            
            const newImages = files.slice(0, remainingSlots);
            newImages.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => setImageUrls(prev => [...prev, reader.result as string]);
                reader.readAsDataURL(file);
            });
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setImageUrls(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !region || !hostId || !price || imageUrls.length === 0) {
            alert(t('fillAllFields'));
            return;
        }

        // FIX: Construct a valid Service object
        const lodgingData = {
            name,
            region,
            hostId,
            imageUrls,
            price,
            description,
            category: ServiceCategory.Lodging,
        };
        
        if (isEditMode && lodgingToEdit) {
            onSaveLodging({ ...lodgingToEdit, ...lodgingData });
        } else {
            onSaveLodging(lodgingData as Omit<Service, 'id'>);
        }
        onClose();
    };

    const inputClass = "w-full bg-gray-50 text-gray-900 rounded-md p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-8 w-full max-w-lg mx-auto transform transition-all max-h-[90vh] overflow-y-auto scrollbar-hide" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                    {isEditMode ? t('editLodging') : t('addNewLodging')}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelClass}>{t('lodgingName')}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>{t('region')}</label>
                            <select value={region} onChange={e => setRegion(e.target.value as Region)} className={inputClass} required>
                                {Object.values(Region).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className={labelClass}>{t('host')}</label>
                            <select value={hostId} onChange={e => setHostId(e.target.value)} className={inputClass} required>
                                {users.map(u => <option key={u.id} value={u.id}>{u.nickname}</option>)}
                            </select>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>{t('pricePerNight')}</label>
                            <input type="text" value={price} onChange={e => setPrice(e.target.value)} className={inputClass} required />
                        </div>
                         <div>
                            <label className={labelClass}>{t('description')}</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} className={inputClass} rows={1}></textarea>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>{t('photo')}</label>
                        {imageUrls.length > 0 && (
                            <div className="my-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                {imageUrls.map((src, index) => (
                                    <div key={index} className="relative aspect-square">
                                        <img src={src} alt={`Preview ${index}`} className="rounded-lg object-cover w-full h-full" />
                                        <button type="button" onClick={() => handleRemoveImage(index)} className="absolute -top-1 -right-1 bg-white text-gray-800 rounded-full"><XCircleIcon className="w-5 h-5"/></button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" multiple />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-lg" disabled={imageUrls.length >= 10}>
                            <PhotoIcon className="w-6 h-6" />
                            <span className="text-sm font-semibold">{t('addPhoto')} ({imageUrls.length}/10)</span>
                        </button>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-6 rounded-full text-gray-700 bg-gray-200 hover:bg-gray-300 transition">{t('cancel')}</button>
                        <button type="submit" className="py-2 px-6 rounded-full text-white bg-blue-600 hover:bg-blue-700 font-bold transition">
                            {isEditMode ? t('saveChanges') : t('addLodging')}
                        </button>
                    </div>
                </form>
            </div>
         </div>
    );
};

interface LodgingListProps {
  // FIX: Changed Lodging to Service
  lodgings: Service[];
  // FIX: Changed Lodging to Service
  onCardClick: (lodging: Service) => void;
  // FIX: Changed Lodging to Service
  onEditClick: (lodging: Service) => void;
  onDeleteClick: (lodgingId: string) => void;
  onHostClick: (user: User) => void;
  usersMap: Map<string, User>;
  currentUser: User | null;
}

const LodgingCard: React.FC<{ 
    // FIX: Changed Lodging to Service
    lodging: Service; 
    host?: User;
    currentUser: User | null;
    onClick: () => void; 
    onEditClick: () => void;
    onDeleteClick: () => void;
    onHostClick: (host: User) => void;
}> = ({ lodging, host, currentUser, onClick, onEditClick, onDeleteClick, onHostClick }) => {
    const { t, language } = useLanguage();
    // FIX: price is a string, not number.
    const formattedPrice = lodging.price;

    const canEdit = currentUser && (currentUser.roles.includes(UserRole.Admin) || currentUser.id === lodging.hostId);

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden transform transition-transform hover:-translate-y-1 hover:shadow-blue-200 border border-gray-200 flex flex-col group">
            <div className="relative">
                <div className="w-full h-48 overflow-x-auto flex snap-x snap-mandatory scrollbar-hide">
                    {lodging.imageUrls.map((url, index) => (
                        <img key={index} onClick={onClick} src={url} alt={`${lodging.name} ${index+1}`} className="w-full h-full object-cover flex-shrink-0 snap-center cursor-pointer" />
                    ))}
                </div>
                {canEdit && (
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); onEditClick(); }} className="bg-white/60 p-2 rounded-full text-gray-800 hover:bg-white/90"><EditIcon className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteClick(); }} className="bg-white/60 p-2 rounded-full text-gray-800 hover:bg-white/90"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start gap-2">
                    <h3 onClick={onClick} className="text-lg font-bold text-gray-900 flex-1 cursor-pointer">{lodging.name}</h3>
                    <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-gray-900 whitespace-nowrap">
                            ₩{formattedPrice}
                        </p>
                        <p className="text-xs font-normal text-gray-500 -mt-1">{t('pricePerNightSuffix')}</p>
                    </div>
                </div>
                
                {host && (
                    <p className="text-sm text-gray-500 mt-2">
                        {lodging.region} <span className="text-gray-300 mx-1">·</span> 
                        {t('hostedBy')}
                        <button onClick={() => onHostClick(host)} className="text-blue-500 hover:underline ml-1">{host.nickname}</button>
                    </p>
                )}

            </div>
        </div>
    );
};

const LodgingList: React.FC<LodgingListProps> = ({ lodgings, onCardClick, onEditClick, onDeleteClick, onHostClick, usersMap, currentUser }) => {
  const { t } = useLanguage();

  return (
    <>
      {lodgings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {lodgings.map(lodging => {
                const host = usersMap.get(lodging.hostId);
                return (
                    <LodgingCard 
                        key={lodging.id} 
                        lodging={lodging} 
                        host={host}
                        currentUser={currentUser}
                        onClick={() => onCardClick(lodging)} 
                        onEditClick={() => onEditClick(lodging)}
                        onDeleteClick={() => onDeleteClick(lodging.id)}
                        onHostClick={onHostClick}
                    />
                )
              })}
          </div>
      ) : (
          <div className="text-center py-16">
              <h2 className="text-2xl font-semibold text-gray-600">{t('noLodgingFound')}</h2>
          </div>
      )}
    </>
  );
};

export default LodgingList;