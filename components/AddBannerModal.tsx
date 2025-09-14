import React, { useState, useEffect } from 'react';
import { BannerItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
// FIX: Added missing icon imports.
import { TrashIcon, EditIcon } from './icons';

interface AddBannerModalProps {
  banners: BannerItem[];
  onClose: () => void;
  onSaveBanner: (banner: Omit<BannerItem, 'id'> | BannerItem) => void;
  onDeleteBanner: (bannerId: string) => void;
}

const AddBannerModal: React.FC<AddBannerModalProps> = ({ banners, onClose, onSaveBanner, onDeleteBanner }) => {
  const { t } = useLanguage();
  
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [detailsUrl, setDetailsUrl] = useState('');
  const [signUpUrl, setSignUpUrl] = useState('');

  const isEditMode = !!editingBanner;

  useEffect(() => {
    if (editingBanner) {
      setTitle(editingBanner.title);
      setDuration(editingBanner.duration);
      setOrganizerName(editingBanner.organizerName);
      setImageUrl(editingBanner.imageUrl);
      setDetailsUrl(editingBanner.detailsUrl || '');
      setSignUpUrl(editingBanner.signUpUrl || '');
    } else {
      resetForm();
    }
  }, [editingBanner]);

  const resetForm = () => {
    setEditingBanner(null);
    setTitle('');
    setDuration('');
    setOrganizerName('');
    setImageUrl('');
    setDetailsUrl('');
    setSignUpUrl('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !duration || !organizerName || !imageUrl) {
      alert(t('fillAllFields'));
      return;
    }
    const bannerData = { title, duration, organizerName, imageUrl, detailsUrl, signUpUrl };
    if (isEditMode) {
      onSaveBanner({ ...bannerData, id: editingBanner.id });
    } else {
      onSaveBanner(bannerData);
    }
    resetForm();
  };
  
  const handleDelete = (bannerId: string) => {
    onDeleteBanner(bannerId);
    if(editingBanner?.id === bannerId) {
        resetForm();
    }
  }

  const inputClass = "w-full bg-gray-50 text-gray-900 rounded-md p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-8 w-full max-w-md mx-auto transform transition-all max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">{t('bannerManagement')}</h2>
        
        <div className="flex flex-col gap-8">
            {/* Form Section */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{isEditMode ? t('editBanner') : t('addNewBanner')}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelClass}>{t('bannerTitle')}</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} required />
                    </div>
                    <div>
                        <label className={labelClass}>{t('bannerDuration')}</label>
                        <input type="text" value={duration} onChange={e => setDuration(e.target.value)} className={inputClass} placeholder="e.g., 10.25 - 10.31" required />
                    </div>
                    <div>
                        <label className={labelClass}>{t('bannerOrganizerName')}</label>
                        <input type="text" value={organizerName} onChange={e => setOrganizerName(e.target.value)} className={inputClass} required />
                    </div>
                    <div>
                        <label className={labelClass}>{t('bannerDetailsUrl')}</label>
                        <input type="text" value={detailsUrl} onChange={e => setDetailsUrl(e.target.value)} className={inputClass} placeholder="https://..." />
                    </div>
                     <div>
                        <label className={labelClass}>{t('bannerSignUpUrl')}</label>
                        <input type="text" value={signUpUrl} onChange={e => setSignUpUrl(e.target.value)} className={inputClass} placeholder="https://..." />
                    </div>
                    <div>
                        <label className={labelClass}>{t('bannerImage')}</label>
                        <div className="mt-1 flex items-center gap-4">
                            {imageUrl && <img src={imageUrl} alt="Preview" className="w-24 h-16 rounded-md object-cover border-2 border-gray-200" />}
                            <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition">
                                <span>{t('selectFile')}</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{t('bannerImageSizeHint')}</p>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        {isEditMode && <button type="button" onClick={resetForm} className="py-2 px-6 rounded-full text-gray-700 bg-gray-200 hover:bg-gray-300 transition">{t('cancel')}</button>}
                        <button type="submit" className="py-2 px-6 rounded-full text-white bg-blue-600 hover:bg-blue-700 font-bold transition">
                            {isEditMode ? t('saveChanges') : t('addBanner')}
                        </button>
                    </div>
                </form>
            </div>
            
            {/* List Section */}
            <div className="flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t('currentBanners')}</h3>
                <div className="overflow-y-auto space-y-2 pr-2 -mr-2 flex-grow bg-gray-50 p-3 rounded-lg border border-gray-200">
                {banners.map(banner => (
                    <div key={banner.id} className="bg-white p-2 rounded-lg flex items-center justify-between gap-2 border border-gray-200">
                        <img src={banner.imageUrl} alt={banner.title} className="w-16 h-10 rounded object-cover flex-shrink-0" />
                        <div className="flex-grow overflow-hidden px-2">
                            <p className="font-bold text-gray-800 text-sm truncate">{banner.title}</p>
                            <p className="text-xs text-gray-500 truncate">{banner.duration} - {banner.organizerName}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => setEditingBanner(banner)} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition"><EditIcon className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(banner.id)} className="p-2 rounded-full text-red-500 hover:bg-red-500/10 transition"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </div>
        
        <div className="mt-8 text-right">
          <button onClick={onClose} className="py-2 px-6 rounded-full text-gray-700 bg-gray-200 hover:bg-gray-300 font-bold transition">{t('close')}</button>
        </div>
      </div>
    </div>
  );
};

export default AddBannerModal;