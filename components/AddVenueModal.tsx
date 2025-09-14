import React, { useState, useEffect } from 'react';
import { Venue, Region, User, SocialPlatform, SocialLink } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { ImageUploader } from './CreatePost';
import { SearchIcon } from './icons';
import { GoogleGenAI, Type } from '@google/genai';

interface AddVenueModalProps {
  onClose: () => void;
  onSaveClub: (club: Omit<Venue, 'id'> | Venue) => void;
  clubToEdit?: Venue | null;
  currentUser: User | null;
  onDeleteClub?: (clubId: string) => void;
}

export const AddVenueModal: React.FC<AddVenueModalProps> = ({ onClose, onSaveClub, clubToEdit, currentUser, onDeleteClub }) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [addressQuery, setAddressQuery] = useState('');
  const [addressEn, setAddressEn] = useState('');
  const [region, setRegion] = useState<Region>(Region.SeoulGangnam);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [mapEmbedUrl, setMapEmbedUrl] = useState<string | null>(null);
  const [transportationInfo, setTransportationInfo] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const isEditMode = !!clubToEdit;

  useEffect(() => {
    if (isEditMode && clubToEdit) {
      setName(clubToEdit.name);
      setAddress(clubToEdit.address);
      setAddressQuery(clubToEdit.address);
      setRegion(clubToEdit.region);
      setAddressEn(clubToEdit.addressEn || '');
      setImageUrls(clubToEdit.imageUrls || []);
      setSocialLinks(clubToEdit.socialLinks || []);
      if (clubToEdit.address) {
        handleAddressSearch(clubToEdit.address);
      }
    } else {
      setName('');
      setAddress('');
      setAddressQuery('');
      setAddressEn('');
      setRegion(Region.SeoulGangnam);
      setImageUrls([]);
      setSocialLinks([]);
      setMapEmbedUrl(null);
      setTransportationInfo(null);
    }
  }, [clubToEdit, isEditMode, t]);

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
  
  const handleAddressSearch = async (query?: string) => {
    const searchQuery = query || addressQuery;
    if (!searchQuery) return;
    
    setIsSearching(true);
    setSearchError(null);
    setMapEmbedUrl(null);
    setTransportationInfo(null);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const geocodeResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Geocode the address "${searchQuery}" in South Korea. Return a JSON object with "fullAddress", "latitude", and "longitude".`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        fullAddress: { type: Type.STRING },
                        latitude: { type: Type.NUMBER },
                        longitude: { type: Type.NUMBER }
                    },
                    required: ["fullAddress", "latitude", "longitude"]
                }
            }
        });
        const geocodeData = JSON.parse(geocodeResponse.text) as { fullAddress: string; latitude: number; longitude: number; };
        const { fullAddress, latitude, longitude } = geocodeData;

        setAddress(fullAddress);
        setAddressQuery(fullAddress);
        const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.005},${latitude-0.005},${longitude+0.005},${latitude+0.005}&layer=mapnik&marker=${latitude},${longitude}`;
        setMapEmbedUrl(embedUrl);

        const transportResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `For the address "${fullAddress}" in South Korea, provide brief, realistic public transportation directions.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subway: { type: Type.STRING, description: "Subway directions, e.g., 'Line 2, Hongik Univ. Station, Exit 9, 5 min walk'" },
                        bus: { type: Type.STRING, description: "Bus directions, e.g., 'Blue bus 273, get off at Hongik Univ.'" }
                    },
                    required: ["subway", "bus"]
                },
            }
        });
        const transportData = JSON.parse(transportResponse.text) as { subway: string; bus: string; };
        setTransportationInfo(`${t('subway')}: ${transportData.subway}\n${t('bus')}: ${transportData.bus}`);

    } catch (e) {
        console.error("Address search failed", e);
        setSearchError("주소를 찾을 수 없습니다. 다시 시도해주세요.");
    } finally {
        setIsSearching(false);
    }
  };


  const inputClass = "w-full bg-gray-50 text-gray-900 rounded-md p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!name || !address || !region ) {
      alert(t('fillAllFields'));
      return;
    }
    if(imageUrls.length === 0) {
        alert(t('photoRequired'));
        return;
    }
    const clubData = { name, address, addressEn, region, creatorId: currentUser.id, imageUrls, socialLinks };
    
    if (isEditMode && clubToEdit) {
      onSaveClub({ ...clubData, id: clubToEdit.id });
    } else {
      onSaveClub(clubData);
    }
  };
  
  const handleDelete = () => {
    if (clubToEdit && onDeleteClub) {
      onDeleteClub(clubToEdit.id);
      onClose();
    }
  };

  const availableSocialPlatforms = [SocialPlatform.Facebook, SocialPlatform.Instagram, SocialPlatform.DaumCafe, SocialPlatform.Band, SocialPlatform.Web];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-gray-200 rounded-lg shadow-xl p-8 w-full max-w-md mx-auto transform transition-all max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">{isEditMode ? t('editVenue') : t('addNewVenue')}</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="space-y-4">
          <div>
            <label className={labelClass}>{t('venueName')}</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>{t('region')}</label>
            <select value={region} onChange={e => setRegion(e.target.value as Region)} className={inputClass} required>
                {Object.values(Region).map(r => <option key={r} value={r}>{t(r)}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('detailedAddress')}</label>
            <div className="flex gap-2">
              <input type="text" value={addressQuery} onChange={e => setAddressQuery(e.target.value)} className={inputClass} placeholder={t('addressPlaceholder')} required />
              <button type="button" onClick={() => handleAddressSearch()} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold p-2 rounded-md transition-colors flex-shrink-0">
                <SearchIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">{t('addressSearchHelp')}</p>
          </div>

          {isSearching && (
              <div className="flex items-center justify-center h-24">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
          )}

          {searchError && <p className="text-sm text-red-600">{searchError}</p>}
          
          {!isSearching && mapEmbedUrl && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg border">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">{t('mapPreview')}</h4>
                <iframe
                    title={t('mapPreview')}
                    width="100%"
                    height="200"
                    loading="lazy"
                    allowFullScreen
                    src={mapEmbedUrl}
                    className="rounded-lg border w-full"
                ></iframe>
              </div>
              {transportationInfo && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">{t('transportationInfo')}</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap bg-white p-2 rounded-md border">{transportationInfo}</p>
                </div>
              )}
            </div>
          )}

           <div>
            <label className={labelClass}>{t('englishAddress')}</label>
            <input type="text" value={addressEn} onChange={e => setAddressEn(e.target.value)} className={inputClass} />
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
                    {availableSocialPlatforms.map(p => <option key={p} value={p}>{t(p) || p}</option>)}
                  </select>
                  <input
                    type="text"
                    value={link.url}
                    onChange={e => handleSocialLinkChange(index, 'url', e.target.value)}
                    className={`${inputClass} flex-grow`}
                    placeholder="https://..."
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
          <ImageUploader imageUrls={imageUrls} setImageUrls={setImageUrls} />

          <div className="flex justify-between items-center pt-4">
              <div>
                  {isEditMode && onDeleteClub && (
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
                      {isEditMode ? t('saveChanges') : t('addVenue')}
                  </button>
              </div>
          </div>
        </form>
      </div>
    </div>
  );
};