import React, { useState, useEffect, useRef } from 'react';
import { COUNTRIES, MALE_AVATAR_URL, FEMALE_AVATAR_URL } from '../constants';
import { User, Gender, UserRole, Language } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface RegisterModalProps {
  onClose: () => void;
  onRegister: (userData: {
      nickname: string, 
      nativeNickname: string,
      countryCode: string, 
      phoneNumber: string, 
      isPhonePublic: boolean,
      roles: UserRole[],
      gender: Gender,
      photoUrl: string,
  }, saveShortcut: boolean) => void;
  existingUsers: User[];
  onAdminLogin: (userId: string) => void;
  currentUser: User | null;
  language: Language;
  setLanguage: (language: Language) => void;
  languages: { code: Language, name: string }[];
}

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose, onRegister, existingUsers, onAdminLogin, currentUser, language, setLanguage, languages }) => {
  const { t } = useLanguage();
  const [nickname, setNickname] = useState('');
  const [nativeNickname, setNativeNickname] = useState('');
  const [countryCode, setCountryCode] = useState(COUNTRIES[0].code);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhonePublic, setIsPhonePublic] = useState(true); // Default to public
  const [saveShortcut, setSaveShortcut] = useState(true);
  
  const [gender, setGender] = useState<Gender>(Gender.Tanguero);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nicknameStatus, setNicknameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'short'>('idle');
  const [debouncedNickname, setDebouncedNickname] = useState(nickname);
  
  const [view, setView] = useState<'register' | 'adminLogin'>(currentUser ? 'adminLogin' : 'register');
  const [adminSearchTerm, setAdminSearchTerm] = useState('');


  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedNickname(nickname);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [nickname]);

  useEffect(() => {
    if (debouncedNickname.trim() === '') {
      setNicknameStatus('idle');
      return;
    }
    if (debouncedNickname.trim().length < 2) {
      setNicknameStatus('short');
      return;
    }
    const nicknameRegex = /^[a-zA-Z0-9_.-]*$/;
    if (!nicknameRegex.test(debouncedNickname)) {
        setNicknameStatus('taken'); // Use 'taken' status for invalid format as well
        return;
    }

    setNicknameStatus('checking');
    setTimeout(() => { // Simulate network delay
      const isTaken = existingUsers.some(u => u.nickname.toLowerCase() === debouncedNickname.toLowerCase());
      setNicknameStatus(isTaken ? 'taken' : 'available');
    }, 300);
  }, [debouncedNickname, existingUsers]);
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nicknameStatus !== 'available') {
      if(nicknameStatus === 'short') alert(t('nicknameTooShort'));
      else alert(t('nicknameTaken'));
      return;
    }
    if (phoneNumber.replace(/-/g, '').length < 8) {
        alert(t('phoneNumberTooShort'));
        return;
    }
    if (!nickname || !phoneNumber || !nativeNickname) {
      alert(t('fillAllFields'));
      return;
    }
    const photoUrl = photoPreview || (gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL);
    onRegister({ nickname, nativeNickname, countryCode, phoneNumber, isPhonePublic, roles: [UserRole.Tangueros], gender, photoUrl }, saveShortcut);
  };

  const handleAdminPrompt = () => {
    setView('adminLogin');
  };
  
  const inputClass = "w-full bg-gray-50 text-gray-900 rounded-md p-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  
  const getNicknameMessage = () => {
    const nicknameRegex = /^[a-zA-Z0-9_.-]*$/;
    if (nickname.trim() !== '' && !nicknameRegex.test(nickname)) {
        return <p className="text-xs text-red-600 mt-1">{t('nicknameInEnglish')}</p>;
    }
    switch (nicknameStatus) {
      case 'checking':
        return <p className="text-xs text-gray-500 mt-1">{t('nicknameUniquenessCheck')}</p>;
      case 'available':
        return <p className="text-xs text-green-600 mt-1">{t('nicknameAvailable')}</p>;
      case 'taken':
        return <p className="text-xs text-red-600 mt-1">{t('nicknameTaken')}</p>;
      case 'short':
        return <p className="text-xs text-red-600 mt-1">{t('nicknameTooShort')}</p>;
      default:
        return <div className="h-4 mt-1"></div>;
    }
  };
  
  const filteredAdminUsers = existingUsers.filter(user => 
    user.nickname.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
    (user.nativeNickname && user.nativeNickname.toLowerCase().includes(adminSearchTerm.toLowerCase()))
  ).sort((a,b) => a.nickname.localeCompare(b.nickname));

  const isFormValid = nickname.trim() && nativeNickname.trim() && phoneNumber.trim() && nicknameStatus === 'available';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div 
        className="bg-white border border-gray-200 rounded-lg shadow-xl p-8 w-full max-w-md mx-auto transform transition-all max-h-[90vh] flex flex-col relative"
        onClick={e => e.stopPropagation()}
      >
        {view === 'register' ? (
            <>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center flex-shrink-0">{t('welcome')}</h2>
                <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0">
                    <div className="overflow-y-auto scrollbar-hide flex-grow -mr-4 pr-4 space-y-4">
                        <div className="flex flex-col items-center mb-4">
                            <img
                                src={photoPreview || (gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL)}
                                alt="Profile Preview"
                                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            />
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 text-sm font-semibold text-blue-600 hover:underline">{t('photo')} ({t('optional')})</button>
                            <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />

                            <div className="flex gap-2 mt-4">
                                <button type="button" onClick={() => setGender(Gender.Tanguero)} className={`py-2 px-6 rounded-full text-sm font-bold transition ${gender === Gender.Tanguero ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{t('Tanguero')}</button>
                                <button type="button" onClick={() => setGender(Gender.Tanguera)} className={`py-2 px-6 rounded-full text-sm font-bold transition ${gender === Gender.Tanguera ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{t('Tanguera')}</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="nickname" className={labelClass}>{t('nickname')}</label>
                                <input 
                                id="nickname"
                                type="text" 
                                value={nickname} 
                                onChange={e => setNickname(e.target.value)} 
                                className={inputClass} 
                                required 
                                />
                                {getNicknameMessage()}
                            </div>
                            <div>
                                <label htmlFor="nativeNickname" className={labelClass}>{t('nativeNickname')}</label>
                                <input
                                id="nativeNickname"
                                type="text"
                                value={nativeNickname}
                                onChange={e => setNativeNickname(e.target.value)}
                                className={inputClass}
                                required
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className={labelClass}>{t('phoneNumber')}</label>
                            <div className="flex gap-2">
                                <select value={countryCode} onChange={e => setCountryCode(e.target.value)} className={`${inputClass} w-1/3 !p-0 !pl-2`}>
                                    {COUNTRIES.slice(0, 9).map(c => <option key={c.code} value={c.code}>{`${c.flag} ${c.code}`}</option>)}
                                    <option disabled>---</option>
                                    {COUNTRIES.slice(9).map(c => <option key={c.code} value={c.code}>{`${c.name} (${c.code})`}</option>)}
                                </select>
                                <input
                                    type="tel"
                                    autoComplete="tel"
                                    value={phoneNumber}
                                    onChange={e => setPhoneNumber(e.target.value)} 
                                    className={inputClass} 
                                    placeholder={t('phoneNumberPlaceholder')}
                                    required 
                                />
                            </div>
                             <div className="flex items-center gap-3 mt-2">
                                <input type="checkbox" id="isPhonePublicRegister" checked={!isPhonePublic} onChange={e => setIsPhonePublic(!e.target.checked)} className="w-5 h-5 rounded text-blue-500 bg-gray-100 border-gray-300 focus:ring-blue-600 focus:ring-2 cursor-pointer" />
                                <label htmlFor="isPhonePublicRegister" className="text-sm text-gray-800 font-semibold cursor-pointer select-none">{t('phoneNumberPrivate')}</label>
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="language-select" className={labelClass}>{t('selectLanguage')}</label>
                            <select
                                id="language-select"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as Language)}
                                className={inputClass}
                            >
                                {languages.map(lang => (
                                    <option key={lang.code} value={lang.code}>{t(lang.name)}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="text-center pt-4 flex-shrink-0">
                        <div className="mb-4 space-y-2">
                            <div className="flex items-center justify-center gap-3">
                                <input type="checkbox" id="saveShortcut" checked={saveShortcut} onChange={e => setSaveShortcut(e.target.checked)} className="w-5 h-5 rounded text-blue-500 bg-gray-100 border-gray-300 focus:ring-blue-600 focus:ring-2 cursor-pointer" />
                                <label htmlFor="saveShortcut" className="text-gray-800 font-semibold cursor-pointer select-none">{t('saveShortcut')}</label>
                            </div>
                            <p className="text-xs text-center text-gray-500">{t('registerModalInfo')}</p>
                        </div>
                        <button 
                        type="submit" 
                        disabled={!isFormValid}
                        className="w-full py-3 px-6 rounded-full text-white bg-blue-600 hover:bg-blue-700 font-bold transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                        {t('start')}
                        </button>
                    </div>
                </form>
                 <div className="absolute bottom-4 right-4">
                    <button type="button" onClick={handleAdminPrompt} className="w-2 h-2 bg-gray-200 rounded-full hover:bg-gray-400 transition-colors"></button>
                </div>
            </>
        ) : (
            <>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">{t('selectUserToLogin')}</h2>
                <input
                    type="text"
                    placeholder={t('searchByUser')}
                    value={adminSearchTerm}
                    onChange={e => setAdminSearchTerm(e.target.value)}
                    className="w-full bg-gray-100 rounded-full px-4 py-2 border-transparent focus:ring-2 focus:ring-blue-500"
                    autoFocus
                />
                <div className="mt-4 flex-grow overflow-y-auto divide-y divide-gray-100 pr-2 -mr-4">
                    {filteredAdminUsers.map(user => (
                        <button
                        key={user.id}
                        onClick={() => onAdminLogin(user.id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                        >
                        <img
                            src={user.photoUrl || (user.gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL)}
                            alt={user.nickname}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <p className="font-semibold text-gray-800">{user.nickname}</p>
                            {user.nativeNickname && <p className="text-sm text-gray-500">{user.nativeNickname}</p>}
                        </div>
                        </button>
                    ))}
                </div>
                <button type="button" onClick={() => setView('register')} className="text-blue-600 hover:underline text-sm mt-4 self-center transition-colors">
                    {t('registerNewUser')}
                </button>
            </>
        )}
      </div>
    </div>
  );
};

export default RegisterModal;