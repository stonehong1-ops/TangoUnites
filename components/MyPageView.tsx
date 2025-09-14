import React, { useState, useMemo, TouchEvent, useEffect, useRef } from 'react';
import { User, Gender, Post, ReactionType, Group, SocialPlatform, Comment, Reaction, AnyEvent, Venue, UserRole, SocialLink, Region, EventType, Language } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { MALE_AVATAR_URL, FEMALE_AVATAR_URL } from '../constants';
import PostCard from './PostCard';
import EventCard from './EventCard';
import { WebIcon, FacebookIcon, InstagramIcon, KakaoTalkIcon, ChevronUpIcon, ChevronDownIcon, EditIcon, BandIcon } from './icons';


interface MyPageViewProps {
  currentUser: User;
  onEditUser: (user: User) => void;
  posts: Post[];
  usersMap: Map<string, User>;
  venuesMap: Map<string, Venue>;
  onReactToPost: (postId: string, reactionType: ReactionType) => void;
  onAddComment: (postId: string, commentText: string, parentCommentId?: string) => void;
  onRegisterClick: () => void;
  onReactToComment: (postId: string, commentId: string, reactionType: ReactionType) => void;
  onAuthorClick: (user: User) => void;
  onEditPost: (post: Post) => void;
  onOpenReactions: (post: Post) => void;
  groups: Group[];
  events: AnyEvent[];
  groupsMap: Map<string, Group>;
  onEventClick: (event: AnyEvent) => void;
  onEditEventClick: (event: AnyEvent) => void;
  todayString: string;
  onOpenAdminDashboard: () => void;
  languages: { code: Language, name: string }[];
}

type ActivityItem = {
    type: 'post' | 'comment' | 'reaction';
    timestamp: string;
    post: Post;
    comment?: Comment;
    reaction?: Reaction;
};

// FIX: Rewrote `getEventPrimaryDate` to correctly handle all event types in the `AnyEvent` union by checking the `type` property, ensuring that date information is accessed safely for Milonga, Class, and Workshop events.
const getEventPrimaryDate = (e: AnyEvent): string => {
    if (e.type === EventType.Milonga) {
        return e.date;
    }
    if (e.type === EventType.Class) {
        return e.sessions[0]?.date || '';
    }
    if (e.type === EventType.Workshop) {
        return e.dates[0] || '';
    }
    return '';
};


const SocialIcon: React.FC<{ platform: SocialPlatform, className?: string }> = ({ platform, className = 'w-5 h-5' }) => {
    switch (platform) {
      case SocialPlatform.Facebook: return <FacebookIcon className={className} />;
      case SocialPlatform.Instagram: return <InstagramIcon className={className} />;
      case SocialPlatform.Web: return <WebIcon className={className} />;
      case SocialPlatform.KakaoTalk: return <KakaoTalkIcon className={className} />;
      default: return null;
    }
};

type MyPageTab = 'profile' | 'my-events' | 'history';

const MyPageView: React.FC<MyPageViewProps> = ({ currentUser, onEditUser, posts, usersMap, venuesMap, groups, events, groupsMap, onEventClick, onEditEventClick, todayString, onOpenAdminDashboard, languages, ...postCardProps }) => {
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<MyPageTab>('profile');
  
  const [editableUser, setEditableUser] = useState<User>(currentUser);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [facebookId, setFacebookId] = useState('');
  const [instagramId, setInstagramId] = useState('');
  const [bandId, setBandId] = useState('');
  const [kakaoId, setKakaoId] = useState('');
  const [webUrl, setWebUrl] = useState('');
  
  const editableRoles = [UserRole.Organizer, UserRole.Instructor, UserRole.DJ, UserRole.ServiceProvider, UserRole.TranslatorEN, UserRole.TranslatorES];
  const fixedRoles = currentUser.roles.filter(r => !editableRoles.includes(r) && r !== UserRole.Tangueros);

  const handleRoleChange = (role: UserRole) => {
    setEditableUser(prev => {
        const newRoles = new Set(prev.roles);
        if (newRoles.has(role)) {
            newRoles.delete(role);
        } else {
            newRoles.add(role);
        }
        
        const hasOtherEditableRole = Array.from(newRoles).some(r => editableRoles.includes(r));
        if (hasOtherEditableRole) {
            newRoles.delete(UserRole.Tangueros);
        } else {
            newRoles.add(UserRole.Tangueros);
        }
        return { ...prev, roles: Array.from(newRoles) };
    });
  };

  const resetFormState = (user: User) => {
    setEditableUser(JSON.parse(JSON.stringify(user)));
    const fbLink = user.socialLinks.find(l => l.platform === SocialPlatform.Facebook)?.url || '';
    const igLink = user.socialLinks.find(l => l.platform === SocialPlatform.Instagram)?.url || '';
    const bandLink = user.socialLinks.find(l => l.platform === SocialPlatform.Band)?.url || '';
    setFacebookId(fbLink.replace('https://www.facebook.com/', ''));
    setInstagramId(igLink.replace(/https?:\/\/www\.instagram\.com\/(.*)\/?/, '$1'));
    setBandId(bandLink.replace(/https?:\/\/(www\.)?band\.us\//, ''));
    setKakaoId(user.socialLinks.find(l => l.platform === SocialPlatform.KakaoTalk)?.url || '');
    setWebUrl(user.socialLinks.find(l => l.platform === SocialPlatform.Web)?.url || '');
  };

  useEffect(() => {
    resetFormState(currentUser);
  }, [currentUser]);

  const handleCancelClick = () => {
    resetFormState(currentUser);
  };

  const handleSaveClick = () => {
    const newSocialLinks: SocialLink[] = [];
    if (facebookId) newSocialLinks.push({ platform: SocialPlatform.Facebook, url: `https://www.facebook.com/${facebookId.trim()}` });
    if (instagramId) newSocialLinks.push({ platform: SocialPlatform.Instagram, url: `https://www.instagram.com/${instagramId.trim()}` });
    if (bandId) {
        let finalUrl = bandId.trim();
        if (!finalUrl.startsWith('http')) finalUrl = `https://band.us/${finalUrl}`;
        newSocialLinks.push({ platform: SocialPlatform.Band, url: finalUrl });
    }
    if (kakaoId) newSocialLinks.push({ platform: SocialPlatform.KakaoTalk, url: kakaoId.trim() });
    if (webUrl) {
      let finalUrl = webUrl.trim();
      if (!/^https:\/\/|http:\/\//.test(finalUrl)) {
        finalUrl = `https://${finalUrl}`;
      }
      newSocialLinks.push({ platform: SocialPlatform.Web, url: finalUrl });
    }
    
    onEditUser({ ...editableUser, socialLinks: newSocialLinks });
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setEditableUser(prev => ({ ...prev, photoUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  const handleFieldChange = (field: keyof User, value: any) => {
    setEditableUser(prev => ({...prev, [field]: value}));
  };

  const tabs: MyPageTab[] = ['profile', 'my-events', 'history'];
  const activeIndex = tabs.indexOf(activeTab);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: TouchEvent) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;

      if (isLeftSwipe && activeIndex < tabs.length - 1) {
          setActiveTab(tabs[activeIndex + 1]);
      } else if (isRightSwipe && activeIndex > 0) {
          setActiveTab(tabs[activeIndex - 1]);
      }

      setTouchStart(null);
      setTouchEnd(null);
  };

  const myEvents = useMemo(() => {
    return events
      .filter(e => e.creatorId === currentUser.id)
      .sort((a,b) => (getEventPrimaryDate(b) || '').localeCompare(getEventPrimaryDate(a) || ''));
  }, [events, currentUser.id]);

  const myActivityFeed = useMemo(() => {
    const feed: ActivityItem[] = [];
    const userId = currentUser.id;

    const findComments = (comments: Comment[], post: Post) => {
        for (const comment of comments) {
            if (comment.authorId === userId) {
                feed.push({ type: 'comment', timestamp: comment.createdAt, post, comment });
            }
            if (comment.replies) {
                findComments(comment.replies, post);
            }
        }
    };

    for (const post of posts) {
        if (post.authorId === userId) {
            feed.push({ type: 'post', timestamp: post.createdAt, post });
        }
        for (const reaction of post.reactions) {
            if (reaction.userId === userId) {
                feed.push({ type: 'reaction', timestamp: post.createdAt, post, reaction });
            }
        }
        findComments(post.comments, post);
    }
    
    return feed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [posts, currentUser.id]);


  const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap px-4 ${isActive ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-800 hover:border-gray-300'}`}
    >
        {label}
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 text-center">
        <div className="relative w-24 h-24 mx-auto">
            <img
            src={editableUser.photoUrl || (currentUser.gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL)}
            alt={currentUser.nickname}
            className="w-24 h-24 rounded-full mx-auto border-4 border-blue-500 object-cover shadow-lg"
            />
            <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-transform transform hover:scale-110 shadow-md border-2 border-white">
                <EditIcon className="w-4 h-4"/>
            </button>
            <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mt-4">{currentUser.nickname}</h2>
        {currentUser.nativeNickname && <p className="text-gray-500">{currentUser.nativeNickname}</p>}
        <div className="mt-4 inline-block bg-gray-100 text-gray-800 font-bold text-lg px-4 py-2 rounded-full">
            {t('totalPoints')}: {currentUser.points || 0}
        </div>
      </div>

      <div className="sticky top-[56px] z-30 bg-white border-b border-t border-gray-200 flex overflow-x-auto scrollbar-hide shadow-sm">
        {tabs.map(tabId => (
          <TabButton key={tabId} label={t(tabId === 'profile' ? 'myInfo' : tabId === 'my-events' ? 'myCreatedEvents' : 'history')} isActive={activeTab === tabId} onClick={() => setActiveTab(tabId)} />
        ))}
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="overflow-x-hidden">
            <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
                <div className="w-full flex-shrink-0 p-4 min-h-[300px]">
                     {activeTab === 'profile' && (
                        <div className="text-gray-700 space-y-4 animate-fade-in">
                            <div>
                                <label className="font-bold block mb-2">{t('gender')}</label>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => handleFieldChange('gender', Gender.Tanguero)} className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition ${editableUser.gender === Gender.Tanguero ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{t('Tanguero')}</button>
                                    <button type="button" onClick={() => handleFieldChange('gender', Gender.Tanguera)} className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition ${editableUser.gender === Gender.Tanguera ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>{t('Tanguera')}</button>
                                </div>
                            </div>
                            
                            <div>
                                <label className="font-bold block mb-2">{t('roles')}</label>
                                <div className="flex flex-wrap gap-2">
                                    {editableRoles.map(role => (
                                        <button key={role} type="button" onClick={() => handleRoleChange(role)} className={`py-1.5 px-3 rounded-full text-sm font-semibold transition ${editableUser.roles.includes(role) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{t(role)}</button>
                                    ))}
                                </div>
                                {fixedRoles.length > 0 && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        <strong>고정 역할:</strong> {fixedRoles.map(r => t(r)).join(', ')}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="font-bold block mb-1">{t('myFavoriteLocation')}</label>
                                <select value={editableUser.favoriteRegion || 'all'} onChange={(e) => handleFieldChange('favoriteRegion', e.target.value)} className="w-full bg-gray-50 rounded-md p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                                    <option value="all">{t('allRegions')}</option>
                                    {Object.values(Region).map(r => <option key={r} value={r}>{t(r)}</option>)}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">{t('myFavoriteLocationHelp')}</p>
                            </div>
                            
                            <div>
                                <label className="font-bold block mb-1">{t('language')}</label>
                                <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="w-full bg-gray-50 rounded-md p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                                    {languages.map(lang => (
                                        <option key={lang.code} value={lang.code}>{t(lang.name)}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="font-bold block mb-1">{t('phoneNumber')}</label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">{editableUser.countryCode}</span>
                                    <input type="tel" value={editableUser.phoneNumber} onChange={(e) => handleFieldChange('phoneNumber', e.target.value)} className="flex-grow bg-gray-50 rounded-r-md p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                                </div>
                                <label className="flex items-center gap-2 mt-2 text-sm">
                                    <input type="checkbox" checked={editableUser.isPhonePublic} onChange={(e) => handleFieldChange('isPhonePublic', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                                    {t('makePhonePublic')}
                                </label>
                            </div>
                            <div className="pt-4 border-t">
                                <strong className="text-gray-700 block mb-2">{t('socialLinks')}:</strong>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <label className="bg-gray-100 p-2 rounded-md w-40 text-sm font-semibold flex items-center gap-2 border"><FacebookIcon className="w-5 h-5 text-[#1877F2]"/><span>facebook.com/</span></label>
                                        <input type="text" value={facebookId} onChange={(e) => setFacebookId(e.target.value)} className="flex-grow bg-gray-50 rounded-md p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder={t('socialPlaceholderId')} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                         <label className="bg-gray-100 p-2 rounded-md w-40 text-sm font-semibold flex items-center gap-2 border"><InstagramIcon className="w-5 h-5 text-[#E4405F]"/><span>instagram.com/</span></label>
                                        <input type="text" value={instagramId} onChange={(e) => setInstagramId(e.target.value)} className="flex-grow bg-gray-50 rounded-md p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder={t('socialPlaceholderId')} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="bg-gray-100 p-2 rounded-md w-40 text-sm font-semibold flex items-center gap-2 border"><BandIcon className="w-5 h-5 text-green-500"/><span>band.us/</span></label>
                                        <input type="text" value={bandId} onChange={(e) => setBandId(e.target.value)} className="flex-grow bg-gray-50 rounded-md p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder={t('socialPlaceholderId')} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                         <label className="bg-gray-100 p-2 rounded-md w-40 text-sm font-semibold flex items-center gap-2 border"><KakaoTalkIcon className="w-5 h-5"/><span>{t('KakaoTalk')} ID</span></label>
                                        <input type="text" value={kakaoId} onChange={(e) => setKakaoId(e.target.value)} className="flex-grow bg-gray-50 rounded-md p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder={t('socialPlaceholderId')} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                         <label className="bg-gray-100 p-2 rounded-md w-40 text-sm font-semibold flex items-center gap-2 border"><WebIcon className="w-5 h-5 text-gray-500"/><span>{t('Web')}</span></label>
                                        <input type="text" value={webUrl} onChange={(e) => setWebUrl(e.target.value)} className="flex-grow bg-gray-50 rounded-md p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder={t('socialPlaceholderWeb')} />
                                    </div>
                                </div>
                            </div>
                             <div className="mt-6 flex gap-2">
                                <button onClick={handleCancelClick} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-full transition">{t('cancel')}</button>
                                <button onClick={handleSaveClick} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition">{t('saveChanges')}</button>
                            </div>
                        </div>
                     )}
                </div>
                <div className="w-full flex-shrink-0 p-4 min-h-[300px]">
                    {activeTab === 'my-events' && (
                        <div className="space-y-4">
                            {myEvents.length > 0 ? (
                                myEvents.map(event => {
                                    const dj = 'djId' in event ? usersMap.get(event.djId!) : null;
                                    return <EventCard key={event.id} event={event} creator={currentUser} dj={dj} onCardClick={onEventClick} onCreatorClick={postCardProps.onAuthorClick} onEditClick={onEditEventClick} currentUser={currentUser} todayString={todayString} usersMap={usersMap} venuesMap={venuesMap} groupsMap={groupsMap} />;
                                })
                            ) : (
                            <p className="text-center text-gray-500 py-8">{t('noEventsCreated')}</p>
                            )}
                        </div>
                    )}
                </div>
                <div className="w-full flex-shrink-0 p-4 min-h-[300px]">
                    {activeTab === 'history' && (
                         <div className="space-y-4">
                            {myActivityFeed.length > 0 ? (
                                myActivityFeed.map(activity => (
                                    <PostCard
                                        key={`${activity.post.id}-${activity.timestamp}-${activity.type}`}
                                        post={activity.post}
                                        usersMap={usersMap}
                                        venuesMap={venuesMap}
                                        currentUser={currentUser}
                                        historyContext={activity}
                                        {...postCardProps}
                                    />
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-8">{t('noActivities')}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {currentUser.roles.includes(UserRole.SystemAdmin) && (
        <div className="p-4 border-t border-gray-200">
            <button
                onClick={onOpenAdminDashboard}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition"
            >
                {t('adminView')}
            </button>
        </div>
      )}
    </div>
  );
};

export default MyPageView;