import React, { useState, useEffect } from 'react';
import { User, SocialLink, SocialPlatform, Gender, UserRole, Region } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { COUNTRIES, MALE_AVATAR_URL, FEMALE_AVATAR_URL } from '../constants';
import { InformationCircleIcon } from './icons';

interface AddOrEditOrganizerModalProps {
  onClose: () => void;
  onSaveOrganizer: (organizer: Omit<User, 'id' | 'createdAt'> | User) => void;
  organizerToEdit?: User | null;
  onDeleteOrganizer?: (organizerId: string) => void;
}

const AddOrEditOrganizerModal: React.FC<AddOrEditOrganizerModalProps> = ({ onClose, onSaveOrganizer, organizerToEdit, onDeleteOrganizer }) => {
  const { t } = useLanguage();
  const [nickname, setNickname] = useState('');
  const [nativeNickname, setNativeNickname] = useState('');
  const [countryCode, setCountryCode] = useState(COUNTRIES[0].code);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [gender, setGender] = useState<Gender>(Gender.Tanguero);
  const [roles, setRoles] = useState<Set<UserRole>>(new Set([UserRole.Tangueros]));
  const [isPhonePublic, setIsPhonePublic] = useState(true);
  const [favoriteRegion, setFavoriteRegion] = useState<Region | 'all'>('all');
  
  const isEditMode = !!organizerToEdit;

  useEffect(() => {
    if (isEditMode && organizerToEdit) {
      setNickname(organizerToEdit.nickname);
      setNativeNickname(organizerToEdit.nativeNickname || '');
      setCountryCode(organizerToEdit.countryCode);
      setPhoneNumber(organizerToEdit.phoneNumber);
      setPhotoUrl(organizerToEdit.photoUrl);
      setSocialLinks(organizerToEdit.socialLinks);
      setGender(organizerToEdit.gender);
      setRoles(new Set(organizerToEdit.roles));
      setIsPhonePublic(organizerToEdit.isPhonePublic);
      setFavoriteRegion(organizerToEdit.favoriteRegion || 'all');
    } else {
      setNickname('');
      setNativeNickname('');
      setCountryCode(COUNTRIES[0].code);
      setPhoneNumber('');
      setPhotoUrl('');
      setSocialLinks([]);
      setGender(Gender.Tanguero);
      setRoles(new Set([UserRole.Tangueros]));
      setIsPhonePublic(true);
      setFavoriteRegion('all');
    }
  }, [organizerToEdit, isEditMode]);

  const inputClass = "w-full bg-gray-50 text-gray-900 rounded-md p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  
  const handleRoleChange = (role: UserRole) => {
    setRoles(prev => {
        const newRoles = new Set(prev);
        if (newRoles.has(role)) {
            newRoles.delete(role);
        } else {
            newRoles.add(role);
        }
        if (newRoles.size === 0) {
            newRoles.add(UserRole.Tangueros);
        } else if (newRoles.size > 1) {
            newRoles.delete(UserRole.Tangueros);
        }
        return newRoles;
    });
  };

  const handleAddSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: SocialPlatform.Facebook, url: '' }]);
  };

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleSocialLinkChange = (index: number, field: keyof SocialLink, value: string) => {
    const newLinks = [...socialLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setSocialLinks(newLinks);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname || !phoneNumber || !nativeNickname) {
      alert(t('fillAllFields'));
      return;
    }

    const finalSocialLinks = socialLinks.map(link => {
        let finalUrl = link.url.trim();
        if (!finalUrl) return null;

        switch (link.platform) {
            case SocialPlatform.Facebook:
                if (!finalUrl.startsWith('http')) finalUrl = `https://www.facebook.com/${finalUrl}`;
                break;
            case SocialPlatform.Instagram:
                if (!finalUrl.startsWith('http')) finalUrl = `https://www.instagram.com/${finalUrl}`;
                break;
            case SocialPlatform.Band:
                if (!finalUrl.startsWith('http')) finalUrl = `https://band.us/${finalUrl}`;
                break;
            case SocialPlatform.Web:
                if (!finalUrl.startsWith('http')) finalUrl = `https://${finalUrl}`;
                break;
            default:
                break;
        }
        return { ...link, url: finalUrl };
    }).filter((l): l is SocialLink => l !== null);


    const organizerData = { nickname, nativeNickname, countryCode, phoneNumber, photoUrl, socialLinks: finalSocialLinks, gender, roles: Array.from(roles), isPhonePublic, favoriteRegion };

    if (isEditMode && organizerToEdit) {
        onSaveOrganizer({ ...organizerToEdit, ...organizerData });
    } else {
        onSaveOrganizer(organizerData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (organizerToEdit && onDeleteOrganizer) {
      onDeleteOrganizer(organizerToEdit.id);
    }
  };

  const getSocialLinkPlaceholder = (platform: SocialPlatform) => {
    switch(platform) {
        case SocialPlatform.Facebook:
        case SocialPlatform.Instagram:
        case SocialPlatform.Band:
        case SocialPlatform.KakaoTalk:
            return t('socialPlaceholderId');
        case SocialPlatform.Contact:
// FIX: Replace non-existent 'WhatsApp' with 'Contact' for phone numbers, using the 'tel:' scheme for the URL to ensure correct handling.
            return t('socialPlaceholderPhone');
        default:
            return t('socialPlaceholderWeb');
    }
  }


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-gray-200 rounded-lg shadow-xl p-8 w-full max-w-md mx-auto transform transition-all max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            {isEditMode ? t('editUser') : t('addNewUser')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t('nickname')}</label>
              <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} className={inputClass} required />
            </div>
             <div>
              <label className={labelClass}>{t('nativeNickname')}</label>
              <input type="text" value={nativeNickname} onChange={e => setNativeNickname(e.target.value)} className={inputClass} required />
            </div>
          </div>
           <div>
            <label className={labelClass}>{t('phoneNumber')}</label>
            <div className="flex gap-2">
                <select value={countryCode} onChange={e => setCountryCode(e.target.value)} className={`${inputClass} w-1/3`}>
                    {COUNTRIES.slice(0, 9).map(c => <option key={c.code} value={c.code}>{`${c.flag} ${c.code}`}</option>)}
                    <option disabled>---</option>
                    {COUNTRIES.slice(9).map(c => <option key={c.code} value={c.code}>{`${c.name} (${c.code})`}</option>)}
                </select>
                <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className={inputClass} placeholder={t('phoneNumberPlaceholder')} required autoComplete="tel" />
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <input type="checkbox" id="isPhonePublic" checked={isPhonePublic} onChange={e => setIsPhonePublic(e.target.checked)} className="w-5 h-5 rounded text-blue-500 bg-gray-100 border-gray-300 focus:ring-blue-600 focus:ring-2 cursor-pointer" />
            <label htmlFor="isPhonePublic" className="text-gray-800 font-semibold cursor-pointer select-none">{t('makePhonePublic')}</label>
            <div className="group relative">
                <InformationCircleIcon className="w-4 h-4 text-gray-400" />
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-gray-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                   {t('phoneNumberPublicHelp')}
                </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t('gender')}</label>
              <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setGender(Gender.Tanguero)} className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition ${gender === Gender.Tanguero ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{t('Tanguero')}</button>
                  <button type="button" onClick={() => setGender(Gender.Tanguera)} className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition ${gender === Gender.Tanguera ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{t('Tanguera')}</button>
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('photo')}</label>
              <div className="flex items-center gap-3">
                <img src={photoUrl || (gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL)} alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-gray-200" />
                  <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition text-sm">
                      <span>{t('selectFile')}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
              </div>
            </div>
          </div>
           <div>
              <label className={labelClass}>{t('roles')}</label>
              <div className="flex flex-wrap gap-2 mt-2">
                  {[UserRole.Organizer, UserRole.Instructor, UserRole.DJ].map(role => (
                      <button key={role} type="button" onClick={() => handleRoleChange(role)} className={`py-1.5 px-3 rounded-full text-sm font-semibold transition ${roles.has(role) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{t(role)}</button>
                  ))}
              </div>
          </div>

          <div>
            <label className={labelClass}>{t('myFavoriteLocation')}</label>
            <select value={favoriteRegion} onChange={e => setFavoriteRegion(e.target.value as Region | 'all')} className={inputClass}>
                <option value="all">{t('allRegions')}</option>
                {Object.values(Region).map(r => <option key={r} value={r}>{t(r)}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>{t('socialLinks')}</label>
            <div className="space-y-3">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={link.platform}
                    onChange={e => handleSocialLinkChange(index, 'platform', e.target.value)}
                    className={`${inputClass} w-1/3`}
                  >
                    {Object.values(SocialPlatform).filter(p => p !== SocialPlatform.Contact).map(p => <option key={p} value={p}>{t(p) || p}</option>)}
                  </select>
                  <input
                    type="text"
                    value={link.url}
                    onChange={e => handleSocialLinkChange(index, 'url', e.target.value)}
                    className={`${inputClass} flex-grow`}
                    placeholder={getSocialLinkPlaceholder(link.platform)}
                    required
                  />
                  <button type="button" onClick={() => handleRemoveSocialLink(index)} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-600 flex-shrink-0 text-xl leading-none flex items-center justify-center w-8 h-8">
                    &times;
                  </button>
                </div>
              ))}
            </div>
             <button type="button" onClick={handleAddSocialLink} className="mt-2 text-sm text-blue-600 hover:text-blue-500 font-semibold">
                + {t('addSocialLink')}
            </button>
          </div>

          <div className="flex justify-between items-center pt-4">
            <div>
              {isEditMode && onDeleteOrganizer && (
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
                  {isEditMode ? t('saveChanges') : t('addCreator')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrEditOrganizerModal;
