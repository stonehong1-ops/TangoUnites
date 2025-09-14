import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, Group, Post, Venue, PostCategory } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
// FIX: Added missing icon imports.
import { MaleIcon, FemaleIcon, PhotoIcon, XCircleIcon, VideoCameraIcon, UsersIcon, BuildingLibraryIcon, PaperClipIcon, SearchIcon } from './icons';
import { Gender } from '../types';
import { MALE_AVATAR_URL, FEMALE_AVATAR_URL } from '../constants';

interface CreatePostProps {
  currentUser: User | null;
  onOpen: (category: PostCategory) => void;
  category?: PostCategory;
}

export const ImageUploader: React.FC<{
    imageUrls: string[];
    setImageUrls: React.Dispatch<React.SetStateAction<string[]>>;
    maxImages?: number;
    disabled?: boolean;
}> = ({ imageUrls, setImageUrls, maxImages = 10, disabled = false }) => {
    const { t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const remainingSlots = maxImages - imageUrls.length;
            if (files.length > remainingSlots) {
                alert(t('max10Photos'));
            }
            
            const newImages = files.slice(0, remainingSlots);
            newImages.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (reader.result) {
                        setImageUrls(prev => [...prev, reader.result as string]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setImageUrls(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div>
            {imageUrls.length > 0 && (
                <div className="my-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {imageUrls.map((src, index) => (
                        <div key={index} className="relative aspect-square">
                            <img src={src} alt={`Preview ${index + 1}`} className="rounded-lg object-cover w-full h-full" />
                            <button 
                                type="button" 
                                onClick={() => handleRemoveImage(index)} 
                                className="absolute -top-1 -right-1 bg-white text-gray-800 rounded-full shadow"
                                aria-label={`Remove image ${index + 1}`}
                            >
                                <XCircleIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
                multiple 
                disabled={disabled}
            />
             <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-lg -ml-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={disabled || imageUrls.length >= maxImages}
            >
                <PhotoIcon className="w-6 h-6" />
                <span className="text-sm font-semibold">{t('addPhoto')} ({imageUrls.length}/{maxImages})</span>
            </button>
        </div>
    );
};

export const CreatePostModal: React.FC<{
  currentUser: User | null;
  onClose: () => void;
  onAddPost: (postData: {
    title?: string;
    content: string;
    imageUrls: string[];
    videoUrl: string;
    linkUrls: string[];
    taggedUserIds: string[];
    taggedVenueId?: string;
    groupId?: string;
    isNotice?: boolean;
    isPinned?: boolean;
    category: PostCategory;
    forSaleStatus?: 'forSale' | 'sold';
  }) => void;
  postToEdit?: Post | null;
  onSavePost?: (updatedPost: Post) => void;
  currentUserGroups?: Group[];
  isNoticeMode?: boolean;
  isPinnedMode?: boolean;
  defaultGroupId?: string;
  users: User[];
  venues: Venue[];
  isGlobalFeed?: boolean;
  defaultCategory?: PostCategory | null;
}> = ({ currentUser, onClose, onAddPost, postToEdit, onSavePost, currentUserGroups = [], isNoticeMode = false, isPinnedMode = false, defaultGroupId, users, venues, isGlobalFeed = false, defaultCategory }) => {
    const { t } = useLanguage();
    const isEditMode = !!postToEdit;
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const [linkUrls, setLinkUrls] = useState<string[]>(['']);
    const [taggedUserIds, setTaggedUserIds] = useState<string[]>([]);
    const [taggedVenueId, setTaggedVenueId] = useState<string | null>(null);
    
    const [showVideoInput, setShowVideoInput] = useState(false);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [showTagUserInput, setShowTagUserInput] = useState(false);
    const [showTagVenueInput, setShowTagVenueInput] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [venueSearch, setVenueSearch] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState<string>('');
    const [category, setCategory] = useState<PostCategory>(defaultCategory || PostCategory.Tango);
    
    useEffect(() => {
        if (isEditMode && postToEdit) {
            setTitle(postToEdit.title || '');
            setContent(postToEdit.content);
            setImageUrls(postToEdit.imageUrls || []);
            setVideoPreview(postToEdit.videoUrl || null);
            setLinkUrls(postToEdit.linkUrls && postToEdit.linkUrls.length > 0 ? postToEdit.linkUrls : ['']);
            setTaggedUserIds(postToEdit.taggedUserIds || []);
            setTaggedVenueId(postToEdit.taggedVenueId || null);
            setSelectedGroupId(postToEdit.groupId || '');
            setCategory(postToEdit.category || defaultCategory || PostCategory.Tango);
            if (postToEdit.videoUrl) setShowVideoInput(true);
            if (postToEdit.linkUrls?.length) setShowLinkInput(true);
            if (postToEdit.taggedUserIds?.length) setShowTagUserInput(true);
            if (postToEdit.taggedVenueId) setShowTagVenueInput(true);
        } else if (defaultGroupId) {
            setSelectedGroupId(defaultGroupId);
        }
        
        if (defaultCategory) {
            setCategory(defaultCategory);
        }
    }, [postToEdit, isEditMode, defaultGroupId, defaultCategory]);

    if (!currentUser) return null;

    const isYouTubePost = category === PostCategory.Youtube || category === PostCategory.TangoMusic;

    useEffect(() => {
        if(isYouTubePost) {
            setShowLinkInput(true);
            setShowVideoInput(false);
            setShowTagUserInput(false);
            setShowTagVenueInput(false);
        } else {
            setShowLinkInput(false);
        }
    }, [isYouTubePost]);

    const handleSubmit = () => {
        if (category === PostCategory.Video && !videoPreview) {
            alert(t('videoRequired'));
            return;
        }

        if (isEditMode && onSavePost && postToEdit) {
            if (content.trim() || imageUrls.length > 0 || videoPreview || (isYouTubePost && linkUrls[0].trim())) {
                onSavePost({
                    ...postToEdit,
                    title,
                    content,
                    imageUrls: isYouTubePost ? [] : (imageUrls.length > 0 ? imageUrls : undefined),
                    videoUrl: isYouTubePost ? undefined : (videoPreview || undefined),
                    linkUrls: linkUrls.filter(l => l.trim()).length > 0 ? linkUrls.filter(l => l.trim()) : undefined,
                    taggedUserIds: isYouTubePost ? undefined : (taggedUserIds.length > 0 ? taggedUserIds : undefined),
                    taggedVenueId: isYouTubePost ? undefined : (taggedVenueId || undefined),
                    groupId: selectedGroupId || undefined,
                    isNotice: postToEdit.isNotice,
                    isPinned: postToEdit.isPinned || isPinnedMode,
                    category,
                });
                onClose();
            }
        } else {
            if (content.trim() || imageUrls.length > 0 || videoPreview || (isYouTubePost && linkUrls[0].trim()) || (isNoticeMode && title.trim())) {
                onAddPost({
                    title, 
                    content, 
                    imageUrls: isYouTubePost ? [] : imageUrls, 
                    videoUrl: isYouTubePost ? '' : (videoPreview || ''),
                    linkUrls: linkUrls.filter(l => l.trim()),
                    taggedUserIds: isYouTubePost ? [] : taggedUserIds,
                    taggedVenueId: isYouTubePost ? undefined : (taggedVenueId || undefined),
                    groupId: selectedGroupId || undefined, 
                    isNotice: isNoticeMode,
                    isPinned: isPinnedMode,
                    category,
                    forSaleStatus: category === PostCategory.CarrotMarket ? 'forSale' : undefined,
                });
                onClose();
            }
        }
    };

    const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (imageUrls.length > 0) { alert(t('videoAndPhotoError')); return; }
        if (videoInputRef.current) videoInputRef.current.value = "";
    
        const tempUrl = URL.createObjectURL(file);
        setVideoPreview(tempUrl);
        setIsUploading(true);
        setUploadProgress(0);
    
        const interval = setInterval(() => {
            setUploadProgress(p => {
                const nextP = p + 10;
                if (nextP >= 100) {
                    clearInterval(interval);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setVideoPreview(reader.result as string);
                        setIsUploading(false);
                        URL.revokeObjectURL(tempUrl);
                    };
                    reader.readAsDataURL(file);
                    return 100;
                }
                return nextP;
            });
        }, 200);
    };

    const handleRemoveVideo = () => { setVideoPreview(null); setIsUploading(false); setUploadProgress(0); };

    const handleLinkChange = (index: number, value: string) => setLinkUrls(prev => prev.map((l, i) => i === index ? value : l));
    const handleAddLink = () => setLinkUrls(prev => [...prev, '']);
    const handleRemoveLink = (index: number) => setLinkUrls(prev => prev.filter((_, i) => i !== index));

    const handleToggleUserTag = (userId: string) => setTaggedUserIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);

    const usersMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
    const filteredUsers = useMemo(() => userSearch ? users.filter(u => u.nickname.toLowerCase().includes(userSearch.toLowerCase()) && u.id !== currentUser.id) : [], [userSearch, users, currentUser.id]);
    const filteredVenues = useMemo(() => venueSearch ? venues.filter(v => v.name.toLowerCase().includes(venueSearch.toLowerCase())) : [], [venueSearch, venues]);
    
    const ToolbarButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; isActive?: boolean; disabled?: boolean }> = ({ icon, label, onClick, isActive, disabled }) => (
        <button type="button" onClick={onClick} disabled={disabled} className={`flex items-center gap-2 p-2 rounded-lg text-sm font-semibold ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed`}>
            {icon}
            <span>{label}</span>
        </button>
    );
    
    const titleText = isEditMode ? t('editPost') : (isNoticeMode ? t('newNotice') : t('createPost'));
    const categories: {key: PostCategory, label: string}[] = [
        {key: PostCategory.Tango, label: t('tangoStory')},
        {key: PostCategory.Life, label: t('lifeStory')},
        {key: PostCategory.Attitude, label: t('attitudeProject')},
        {key: PostCategory.Video, label: t('classVideos')},
        {key: PostCategory.CarrotMarket, label: t('carrotMarket')},
        {key: PostCategory.Youtube, label: t('youtubeRecommendations')},
        {key: PostCategory.TangoMusic, label: t('tangoMusic')},
    ];
    const placeholderText = useMemo(() => {
        if (!currentUser) return '';
        switch(category) {
            case PostCategory.Video: return t('shareVideoPlaceholder');
            case PostCategory.Life: return t('whatsOnYourMindLife').replace('{user}', currentUser.nickname);
            case PostCategory.Attitude: return t('whatsOnYourMindAttitude');
            case PostCategory.Youtube: return t('youtubePlaceholder');
            case PostCategory.TangoMusic: return t('tangoMusicPlaceholder');
            default: return t('whatsOnYourMind').replace('{user}', currentUser.nickname);
        }
    }, [category, t, currentUser]);

    const isAnonymous = category === PostCategory.Attitude;
    const avatarUrl = isAnonymous
        ? (currentUser.gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL)
        : (currentUser.photoUrl || (currentUser.gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL));
    const displayName = isAnonymous ? t('anonymous') : currentUser.nickname;


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto transform transition-all max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">{titleText}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100"><XCircleIcon className="w-6 h-6" /></button>
                </div>
                
                <div className="p-4 flex-grow overflow-y-auto scrollbar-hide">
                    <div className="flex items-start gap-3">
                        <img src={avatarUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
                        <div className="flex-grow">
                            <span className="font-semibold">{displayName}</span>
                            <div className="flex items-center gap-2 mt-1">
                                {!isGlobalFeed && currentUserGroups.length > 0 && (
                                    <select value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)} className="text-xs bg-gray-100 border-gray-300 rounded-md focus:ring-blue-500 text-gray-700">
                                        {currentUserGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                    </select>
                                )}
                                {!isNoticeMode && <select value={category} onChange={e => {
                                    const newCat = e.target.value as PostCategory;
                                    setCategory(newCat);
                                    if(newCat === PostCategory.Video) {
                                        setImageUrls([]);
                                    } else {
                                        setVideoPreview(null);
                                    }
                                }} className="text-xs bg-gray-100 border-gray-300 rounded-md focus:ring-blue-500 text-gray-700">
                                    {categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                                </select>}
                            </div>
                        </div>
                    </div>
                    
                    {isNoticeMode && (
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder={t('noticeTitlePlaceholder')}
                            className="w-full text-lg p-2 mt-3 font-bold bg-transparent focus:outline-none border-b"
                        />
                    )}
                    <textarea value={content} onChange={e => setContent(e.target.value)} placeholder={placeholderText} className="w-full text-lg p-2 mt-3 bg-transparent focus:outline-none resize-none" rows={isYouTubePost ? 2 : 5} />
                    
                    {isYouTubePost ? (
                         <div className="my-2">
                            <input 
                                type="url" 
                                value={linkUrls[0]} 
                                onChange={e => handleLinkChange(0, e.target.value)} 
                                placeholder={t('linkUrlPlaceholder')}
                                className="w-full bg-gray-100 border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500"
                                required
                            />
                        </div>
                    ) : category === PostCategory.Video ? (
                        <div>
                            {videoPreview && (
                                <div className="my-2 relative aspect-video">
                                    {isUploading ? (
                                        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                                            <div className="w-full bg-gray-300 rounded-full h-2.5"><div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${uploadProgress}%`}}></div></div>
                                        </div>
                                    ) : (
                                        <video src={videoPreview} controls className="w-full h-full rounded-lg" />
                                    )}
                                    <button onClick={handleRemoveVideo} className="absolute -top-1 -right-1 bg-white text-gray-800 rounded-full shadow"><XCircleIcon className="w-5 h-5"/></button>
                                </div>
                            )}
                            <input type="file" ref={videoInputRef} onChange={handleVideoSelect} accept="video/*" className="hidden" disabled={!!videoPreview} />
                            <ToolbarButton icon={<VideoCameraIcon className="w-6 h-6" />} label={t('addVideo')} onClick={() => videoInputRef.current?.click()} disabled={!!videoPreview} />
                            {!!videoPreview && <p className="text-xs text-gray-500">{t('videoLimitError')}</p>}
                        </div>
                    ) : (
                        <ImageUploader imageUrls={imageUrls} setImageUrls={setImageUrls} disabled={!!videoPreview} />
                    )}

                    {showLinkInput && !isYouTubePost && (
                        <div className="space-y-2 mt-2">
                            {linkUrls.map((link, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input type="url" value={link} onChange={e => handleLinkChange(index, e.target.value)} placeholder={t('linkUrlPlaceholder')} className="flex-grow bg-gray-100 border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500" />
                                    <button onClick={() => handleRemoveLink(index)} className="p-1">&times;</button>
                                </div>
                            ))}
                            <button onClick={handleAddLink} className="text-sm font-semibold text-blue-600">+ {t('addLink')}</button>
                        </div>
                    )}
                </div>
                
                {!isYouTubePost && !isNoticeMode && (
                    <div className="p-2 border-t flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <ToolbarButton icon={<UsersIcon className="w-5 h-5" />} label={t('tagPeople')} onClick={() => setShowTagUserInput(!showTagUserInput)} isActive={showTagUserInput} />
                            <ToolbarButton icon={<BuildingLibraryIcon className="w-5 h-5" />} label={t('tagVenue')} onClick={() => setShowTagVenueInput(!showTagVenueInput)} isActive={showTagVenueInput}/>
                            <ToolbarButton icon={<PaperClipIcon className="w-5 h-5" />} label={t('link')} onClick={() => setShowLinkInput(!showLinkInput)} isActive={showLinkInput}/>
                        </div>

                        {showTagUserInput && (
                            <div className="p-2 bg-gray-50 rounded-lg">
                                <input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder={t('searchUsers')} className="w-full bg-white border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500" />
                                {userSearch && (
                                    <div className="max-h-32 overflow-y-auto mt-2 space-y-1">
                                        {filteredUsers.map(u => (
                                            <button key={u.id} type="button" onClick={() => handleToggleUserTag(u.id)} className="w-full flex items-center gap-2 p-1 hover:bg-gray-200 rounded text-left">
                                                <input type="checkbox" readOnly checked={taggedUserIds.includes(u.id)} className="w-4 h-4 rounded text-blue-600" />
                                                <span>{u.nickname}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {taggedUserIds.length > 0 && <div className="text-xs text-gray-500 mt-2">{t('with')} {taggedUserIds.map(id => usersMap.get(id)?.nickname).filter(Boolean).join(', ')}</div>}
                            </div>
                        )}
                        {showTagVenueInput && (
                            <div className="p-2 bg-gray-50 rounded-lg">
                                <input type="text" value={venueSearch} onChange={e => setVenueSearch(e.target.value)} placeholder={t('searchVenues')} className="w-full bg-white border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500" />
                                {venueSearch && (
                                    <div className="max-h-32 overflow-y-auto mt-2 space-y-1">
                                        {filteredVenues.map(v => (
                                            <button key={v.id} type="button" onClick={() => { setTaggedVenueId(v.id); setVenueSearch(v.name); setShowTagVenueInput(false); }} className="w-full p-1 hover:bg-gray-200 rounded text-left">{v.name}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}


                <div className="p-4 flex-shrink-0">
                    <button onClick={handleSubmit} disabled={isYouTubePost ? !linkUrls[0]?.trim() : (!content.trim() && imageUrls.length === 0 && !videoPreview && (!isNoticeMode || !title.trim()))} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors">
                        {isEditMode ? t('saveChanges') : t('post')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const CreatePost: React.FC<CreatePostProps> = ({ currentUser, onOpen, category = PostCategory.Tango }) => {
    const { t } = useLanguage();
    if (!currentUser) return null;

    const isAnonymous = category === PostCategory.Attitude;
    const avatarUrl = isAnonymous
        ? (currentUser.gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL)
        : (currentUser.photoUrl || (currentUser.gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL));
    const altText = isAnonymous ? t('anonymous') : currentUser.nickname;

    const placeholderText = useMemo(() => {
        if (!currentUser) return '';
        switch(category) {
            case PostCategory.Video: return t('shareVideoPlaceholder');
            case PostCategory.Life: return t('whatsOnYourMindLife').replace('{user}', currentUser.nickname);
            case PostCategory.Attitude: return t('whatsOnYourMindAttitude');
            case PostCategory.Youtube: return t('youtubePlaceholder');
            case PostCategory.TangoMusic: return t('tangoMusicPlaceholder');
            default: return t('whatsOnYourMind').replace('{user}', currentUser.nickname);
        }
    }, [category, t, currentUser]);

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-3">
            <img 
                src={avatarUrl}
                alt={altText}
                className="w-10 h-10 rounded-full object-cover"
            />
            <button 
                onClick={() => onOpen(category)}
                className="flex-grow text-left bg-gray-100 text-gray-500 rounded-full p-3 pl-4 cursor-pointer hover:bg-gray-200 transition"
            >
                {placeholderText}
            </button>
        </div>
    );
};

export default CreatePost;