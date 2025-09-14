import React, { useState, useEffect } from 'react';
import { User, SocialLink, SocialPlatform, Gender, UserRole, Region, Language } from '../types';
import { COUNTRIES, MALE_AVATAR_URL, FEMALE_AVATAR_URL } from '../constants';
import { InformationCircleIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface AddOrEditUserModalProps {
  onClose: () => void;
  onSaveUser: (user: Omit<User, 'id' | 'createdAt'> | User) => void;
  userToEdit?: User | null;
  onDeleteUser?: (userId: string) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  languages: { code: Language, name: string }[];
}

const AddOrEditUserModal: React.FC<AddOrEditUserModalProps> = ({ onClose, onSaveUser, userToEdit, onDeleteUser, language, setLanguage, languages }) => {
  const { t } = useLanguage();
  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [nativeNickname, setNativeNickname] = useState('');
  const [countryCode, setCountryCode] = useState(COUNTRIES[0].code);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [gender, setGender] = useState<Gender>(Gender.Tanguero);
  const [roles, setRoles] = useState<Set<UserRole>>(new Set([UserRole.Tangueros]));
  const [isPhonePublic, setIsPhonePublic] = useState(true);
  const [favoriteRegion, setFavoriteRegion] = useState<Region | 'all'>('all');
  
  const isEditMode = !!userToEdit;

  useEffect(() => {
    if (isEditMode && userToEdit) {
      setNickname(userToEdit.nickname);
      setNativeNickname(userToEdit.nativeNickname || '');
      setCountryCode(userToEdit.countryCode);
      setPhoneNumber(userToEdit.phoneNumber);
      setPhotoUrl(userToEdit.photoUrl || '');
      setSocialLinks(userToEdit.socialLinks);
      setGender(userToEdit.gender);
      setRoles(new Set(userToEdit.roles));
      setIsPhonePublic(userToEdit.isPhonePublic);
      setFavoriteRegion(userToEdit.favoriteRegion || 'all');
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
  }, [userToEdit, isEditMode]);

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
        } else if (newRoles.size > 1 && newRoles.has(UserRole.Tangueros)) {
            newRoles.delete(UserRole.Tangueros);
        }
        return newRoles;
    });
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);
    const nicknameRegex = /^[a-zA-Z0-9_.-]*$/;
    if (value.trim() !== '' && !nicknameRegex.test(value)) {
        setNicknameError(t('nicknameInEnglish'));
    } else {
        setNicknameError('');
    }
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
    if (nicknameError) return;
    if (!nickname || !phoneNumber || !nativeNickname) {
      alert(t('fillAllFields'));
      return;
    }
    const userData = { nickname, nativeNickname, countryCode, phoneNumber, photoUrl: photoUrl || '', socialLinks, gender, roles: Array.from(roles), isPhonePublic, favoriteRegion };

    if (isEditMode && userToEdit) {
        onSaveUser({ ...userToEdit, ...userData });
    } else {
        onSaveUser(userData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (userToEdit && onDeleteUser) {
      onDeleteUser(userToEdit.id);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4"
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
            <div className="flex flex-col items-center mb-4">
                <div className="flex items-center gap-4">
                    <img src={photoUrl || (gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL)} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-gray-200" />
                    <div>
                         <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition text-sm">
                            <span>{t('selectFile')}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                        </label>
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <button type="button" onClick={() => setGender(Gender.Tanguero)} className={`py-2 px-6 rounded-full text-sm font-bold transition ${gender === Gender.Tanguero ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{t('Tanguero')}</button>
                    <button type="button" onClick={() => setGender(Gender.Tanguera)} className={`py-2 px-6 rounded-full text-sm font-bold transition ${gender === Gender.Tanguera ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{t('Tanguera')}</button>
                </div>
            </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t('nickname')}</label>
              <input type="text" value={nickname} onChange={handleNicknameChange} className={inputClass} required />
              {nicknameError && <p className="text-xs text-red-500 mt-1">{nicknameError}</p>}
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
           <div>
              <label className={labelClass}>{t('additionalRolesPrompt')}</label>
              <div className="flex flex-wrap gap-2 mt-2">
                  {[UserRole.Organizer, UserRole.Instructor, UserRole.DJ, UserRole.TranslatorEN, UserRole.TranslatorES, UserRole.ServiceProvider].map(role => (
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
              <label className={labelClass}>{t('language')}</label>
              <select value={language} onChange={e => setLanguage(e.target.value as Language)} className={inputClass}>
                  {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>{t(lang.name)}</option>
                  ))}
              </select>
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <div>
              {isEditMode && onDeleteUser && (
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
                  {isEditMode ? t('saveChanges') : t('addUser')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrEditUserModal;