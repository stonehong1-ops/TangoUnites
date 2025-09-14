import React, { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { AnyEvent, User, Venue, EventType, Language, BannerItem, Service, Post, Comment as AppComment, UserRole, ReactionType, Notification as AppNotification, Conversation, Message as AppMessage, NotificationType, Group, LucyConversation, PostCategory, Milonga, Class, Workshop, Gender } from './types';
import { MILONGAS, CLASSES, WORKSHOPS, USERS, VENUES, SERVICES, POSTS, NOTIFICATIONS, CONVERSATIONS, GROUPS, MALE_AVATAR_URL, FEMALE_AVATAR_URL, COUNTRIES } from './constants';
import UserProfileModal from './components/UserProfileModal';
import { AddVenueModal } from './components/AddVenueModal';
import EventDetailModal from './components/EventDetailModal';
import RegisterModal from './components/RegisterModal';
import ServiceDetailModal from './components/ServiceDetailModal';
import { CreatePostModal } from './components/CreatePost';
import PostCard from './components/PostCard';
import PostDetailModal from './components/PostDetailModal';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import IosInstallMessageModal from './components/IosInstallMessageModal';
// FIX: Changed default import to named import for AdminDashboard component.
import { AdminDashboard } from './components/AdminDashboard';
import AddGroupModal from './components/AddGroupModal';
import { CommunityView } from './components/CommunityView';
import ReactionListModal from './components/ReactionListModal';
import MyPageView from './components/MyPageView';
import MessengerModal from './components/MessengerModal';
import LucyChatModal from './components/LucyChatModal';
import ResourcesView from './components/ResourcesView';
import GroupDetailView from './components/GroupDetailView';
import { AddServiceModal } from './components/ServiceModal';
import NotificationModal from './components/NotificationModal';
import AddEventModal from './components/AddEventModal';
import ManageVenuesModal from './components/ManageVenuesModal';
import { LeylaProjectModal } from './components/LeylaProjectModal';
import HomeView from './components/HomeView';
import { BellIcon, MessengerIcon, SearchIcon, SearchIconFilled, SparklesIcon, CalendarIcon, UserCircleIcon, TangoCircleLogo, CalendarIconFilled, Squares2X2Icon, Squares2X2IconFilled, HeadsetIcon, HeadsetIconFilled, CoffeeIcon, CoffeeIconFilled, TicketIcon, TicketIconFilled, ChatBubbleBottomCenterTextIcon, ChatBubbleBottomCenterTextIconFilled, UsersIconFilled, UsersIcon, CarrotIcon } from './components/icons';
import { SplashScreen } from './components/SplashScreen';
import { GlobalSearchView } from './components/GlobalSearchView';
import PWAInstallPrompt from './components/PWAInstallModal';
import ContentView from './components/ContentView';

const PlaygroundView = lazy(() => import('./components/PlaygroundView'));
const ClubDetailModal = lazy(() => import('./components/ClubDetailModal'));

type MainTab = 'home' | 'feed' | 'content' | 'cafe' | 'community' | 'playground' | 'my' | 'search';

type TabId = 'poster' | 'info' | 'attendees' | 'signup' | 'inquiry';

const footerTabs = ['home', 'feed', 'cafe', 'community', 'content', 'playground', 'search'] as const;
type FooterTab = typeof footerTabs[number];

const tabIcons: Record<FooterTab, { filled: React.FC<any>; outline: React.FC<any> }> = {
    home: { filled: CalendarIconFilled, outline: CalendarIcon },
    feed: { filled: ChatBubbleBottomCenterTextIconFilled, outline: ChatBubbleBottomCenterTextIcon },
    content: { filled: HeadsetIconFilled, outline: HeadsetIcon },
    cafe: { filled: CoffeeIconFilled, outline: CoffeeIcon },
    community: { filled: UsersIconFilled, outline: UsersIcon },
    playground: { filled: TicketIconFilled, outline: TicketIcon },
    search: { filled: SearchIconFilled, outline: SearchIcon },
};

const languages: { code: Language, name: string }[] = [
    { code: Language.KO, name: 'languageKO' },
    { code: Language.EN, name: 'languageEN' },
    { code: Language.CN, name: 'languageCN' },
    { code: Language.JP, name: 'languageJP' },
    { code: Language.VN, name: 'languageVN' },
    { code: Language.DE, name: 'languageDE' },
    { code: Language.FR, name: 'languageFR' },
    { code: Language.ES, name: 'languageES' },
    { code: Language.IT, name: 'languageIT' },
    { code: Language.RU, name: 'languageRU' },
];

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
};

const parseDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
};

const getTodayKSTString = () => {
    return new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).split(' ')[0];
}

const FeedView: React.FC<{
  posts: Post[];
  usersMap: Map<string, User>;
  venuesMap: Map<string, Venue>;
  currentUser: User | null;
  onReactToPost: (postId: string, reactionType: ReactionType) => void;
  onAddComment: (postId: string, commentText: string, parentCommentId?: string) => void;
  onRegisterClick: () => void;
  onReactToComment: (postId: string, commentId: string, reactionType: ReactionType) => void;
  onAuthorClick: (user: User) => void;
  onEditPost: (post: Post) => void;
  onOpenReactions: (post: Post) => void;
  onOpenCreatePost: (category: PostCategory) => void;
  highlightedPostId: string | null;
  onHighlightEnd: () => void;
  onToggleForSaleStatus: (postId: string) => void;
  onOpenLeylaProject: () => void;
}> = (props) => {
  const { t } = useLanguage();
  const { posts, onOpenCreatePost, currentUser, onOpenLeylaProject, ...rest } = props;

  const feedCategories: { key: PostCategory; labelKey: string; icon?: React.ReactNode; }[] = [
    { key: PostCategory.Tango, labelKey: 'tangoStory' },
    { key: PostCategory.Life, labelKey: 'lifeStory' },
    { key: PostCategory.CarrotMarket, labelKey: 'carrotMarket', icon: <CarrotIcon className="w-5 h-5 text-orange-500" /> },
    { key: PostCategory.Attitude, labelKey: 'attitudeProject' },
  ];

  const [activeCategory, setActiveCategory] = useState<PostCategory>(PostCategory.Tango);
  const [showForSaleOnly, setShowForSaleOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const isAnonymous = activeCategory === PostCategory.Attitude;
  const avatarUrl = isAnonymous 
    ? (currentUser?.gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL)
    : (currentUser?.photoUrl || MALE_AVATAR_URL);
  
  const placeholderText = useMemo(() => {
    if (!currentUser) return '';
    switch(activeCategory) {
        case PostCategory.Tango: return t('whatsOnYourMindTango').replace('{user}', currentUser.nickname);
        case PostCategory.Life: return t('whatsOnYourMindLife').replace('{user}', currentUser.nickname);
        case PostCategory.CarrotMarket: return t('whatsOnYourMindCarrot').replace('{user}', currentUser.nickname);
        case PostCategory.Attitude: return t('whatsOnYourMindAttitudeNew');
        default: return t('whatsOnYourMind').replace('{user}', currentUser.nickname || '');
    }
  }, [activeCategory, t, currentUser]);

  const filteredPosts = useMemo(() => {
    let filtered = posts.filter(p => p.category === activeCategory || (activeCategory === PostCategory.Tango && !p.category));
    
    if (activeCategory === PostCategory.CarrotMarket && showForSaleOnly) {
      filtered = filtered.filter(p => p.forSaleStatus === 'forSale');
    }

    if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(p => {
            const contentMatch = p.content.toLowerCase().includes(lowerSearchTerm);

            if (activeCategory === PostCategory.Attitude) {
                return contentMatch;
            }

            const author = props.usersMap.get(p.authorId);
            const authorNameMatch = author ?
                author.nickname.toLowerCase().includes(lowerSearchTerm) ||
                author.nativeNickname.toLowerCase().includes(lowerSearchTerm) :
                false;
            return contentMatch || authorNameMatch;
        });
    }

    return filtered;
  }, [posts, activeCategory, showForSaleOnly, searchTerm, props.usersMap]);


  return (
    <div className="space-y-4">
      <div className="flex border-b border-gray-200 -mx-4">
        {feedCategories.map(({ key, labelKey, icon }) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeCategory === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
            }`}
          >
            {icon}
            <span>{t(labelKey)}</span>
          </button>
        ))}
      </div>

      {activeCategory === PostCategory.Attitude && (
        <div className="p-2 -mb-2">
            <div
                onClick={onOpenLeylaProject}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow text-center"
            >
                <h3 className="font-bold text-lg drop-shadow-sm">{t('leylaProjectTitle')}</h3>
                <p className="text-sm opacity-90 hover:underline">{t('leylaProjectWhatIs')}</p>
            </div>
            <p className="text-xs text-center text-gray-500 mt-2 px-4">{t('leylaProjectIntroText')}</p>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-3">
            <img 
                src={avatarUrl}
                alt={currentUser?.nickname}
                className="w-10 h-10 rounded-full object-cover"
            />
            <button 
                onClick={() => onOpenCreatePost(activeCategory)}
                className="flex-grow text-left bg-gray-100 text-gray-500 rounded-full p-3 pl-4 cursor-pointer hover:bg-gray-200 transition"
            >
                {placeholderText}
            </button>
        </div>
        
      <div className="relative">
        <input
          type="text"
          placeholder={t('searchByPostContent')}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-full focus:ring-blue-500 pl-10 text-sm py-2 shadow-sm"
        />
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>
      
      {activeCategory === PostCategory.CarrotMarket && (
        <div className="flex items-center justify-end">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                <input type="checkbox" checked={showForSaleOnly} onChange={e => setShowForSaleOnly(e.target.checked)} className="rounded text-blue-600"/>
                {t('showForSaleOnly')}
            </label>
        </div>
      )}

      {filteredPosts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          currentUser={currentUser}
          onToggleForSaleStatus={props.onToggleForSaleStatus}
          {...rest}
        />
      ))}
    </div>
  );
};

const AppContent: React.FC = () => {
    const { language, setLanguage, t } = useLanguage();
    const [isLoading, setIsLoading] = useState(true);
    const [mainTab, setMainTab] = useState<MainTab>('home');
    const [currentDate, setCurrentDate] = useState(() => parseDate(getTodayKSTString()));
    
    const [users, setUsers] = useState<User[]>([]);
    const [milongas, setMilongas] = useState<Milonga[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [lucyConversations, setLucyConversations] = useState<LucyConversation[]>([]);

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userGroupOrder, setUserGroupOrder] = useState<string[]>([]);
    
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<AnyEvent | null>(null);
    const [initialModalTab, setInitialModalTab] = useState<TabId | null>(null);
    const [selectedUserContext, setSelectedUserContext] = useState<{ user: User; group?: Group | null } | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
    const [selectedGroupForDetail, setSelectedGroupForDetail] = useState<Group | null>(null);
    
    const [postDetailId, setPostDetailId] = useState<string | null>(null);
    const [reactionListPostId, setReactionListPostId] = useState<string | null>(null);

    const postForDetailModal = useMemo(() => posts.find(p => p.id === postDetailId), [posts, postDetailId]);
    const postForReactionModal = useMemo(() => posts.find(p => p.id === reactionListPostId), [posts, reactionListPostId]);

    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    const [addEventType, setAddEventType] = useState<EventType | null>(null);
    const [eventToEdit, setEventToEdit] = useState<AnyEvent | null>(null);

    const [isAddVenueModalOpen, setAddVenueModalOpen] = useState(false);
    const [venueToEdit, setVenueToEdit] = useState<Venue | null>(null);
    
    const [isAddServiceModalOpen, setAddServiceModalOpen] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);

    const [isAddGroupModalOpen, setAddGroupModalOpen] = useState(false);
    const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);

    const [isCreatePostModalOpen, setCreatePostModalOpen] = useState(false);
    const [postToEdit, setPostToEdit] = useState<Post | null>(null);
    const [createPostCategory, setCreatePostCategory] = useState<PostCategory | null>(null);

    const [isManageVenuesModalOpen, setManageVenuesModalOpen] = useState(false);
    
    const [isIosInstallModalOpen, setIosInstallModalOpen] = useState(false);
    const [isAdminDashboardOpen, setAdminDashboardOpen] = useState(false);

    const [isMessengerOpen, setMessengerOpen] = useState(false);
    const [initialConversationId, setInitialConversationId] = useState<string | null>(null);
    const [isNotificationOpen, setNotificationOpen] = useState(false);

    const [isLucyChatOpen, setLucyChatOpen] = useState(false);
    const [activeLucyConversation, setActiveLucyConversation] = useState<LucyConversation | null>(null);
    const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);
    const [isLeylaProjectModalOpen, setIsLeylaProjectModalOpen] = useState(false);
    const [initialSelectedGroupIdForCafe, setInitialSelectedGroupIdForCafe] = useState<string | null>(null);

    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            if (window.matchMedia('(display-mode: standalone)').matches) {
                return;
            }
             const dismissed = sessionStorage.getItem('pwaInstallBannerDismissed');
            if (!dismissed) {
                setInstallPrompt(e);
                setShowInstallPrompt(true);
            }
        };
        window.addEventListener('beforeinstallprompt', handler);
        
        const loadData = () => {
            setUsers(USERS);
            setMilongas(MILONGAS);
            setClasses(CLASSES);
            setWorkshops(WORKSHOPS);
            setVenues(VENUES);
            setServices(SERVICES);
            setPosts(POSTS);
            setNotifications(NOTIFICATIONS);
            setConversations(CONVERSATIONS);
            setGroups(GROUPS);
            
            const testUser = USERS.find(u => u.id === 'user1');
            if (testUser) {
              setCurrentUser(testUser);
            } else {
              setIsRegisterModalOpen(true);
            }

            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;
            const hasSeenPrompt = localStorage.getItem('hasSeenIosInstallPrompt');
            if(isIOS && !isInStandaloneMode && !hasSeenPrompt) {
                setTimeout(() => setIosInstallModalOpen(true), 5000);
            }

            setTimeout(() => setIsLoading(false), 2000);
        };
        loadData();

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        }
        setInstallPrompt(null);
        setShowInstallPrompt(false);
    };
    
    const handleDismissInstallPrompt = () => {
        sessionStorage.setItem('pwaInstallBannerDismissed', 'true');
        setShowInstallPrompt(false);
    };

    const allEvents = useMemo(() => [...milongas, ...classes, ...workshops], [milongas, classes, workshops]);
    const usersMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
    const venuesMap = useMemo(() => new Map(venues.map(v => [v.id, v])), [venues]);
    const groupsMap = useMemo(() => new Map(groups.map(g => [g.id, g])), [groups]);
    const milongasMap = useMemo(() => new Map(milongas.map(m => [m.id, m])), [milongas]);
    const todayString = useMemo(() => getTodayKSTString(), []);
    
    const banners = useMemo((): BannerItem[] => allEvents
        .filter(e => ('posterImageUrl' in e && e.posterImageUrl) || (e.imageUrls && e.imageUrls.length > 0))
        .slice(0, 5)
        .map(e => ({
            id: e.id,
            title: e.title,
            duration: e.type === EventType.Milonga ? e.date : e.type === EventType.Workshop ? e.dates.join(' ~ ') : (e as Class).sessions[0]?.date || '',
            organizerName: usersMap.get(e.creatorId)?.nickname || '',
            imageUrl: ('posterImageUrl' in e && e.posterImageUrl) ? e.posterImageUrl : e.imageUrls![0],
            detailsUrl: 'detailsUrl' in e ? e.detailsUrl : undefined,
            signUpUrl: 'signUpUrl' in e ? e.signUpUrl : undefined,
        })), [allEvents, usersMap]);
    
    const countryUserCounts = useMemo(() => {
        const counts: { [code: string]: number } = {};
        USERS.forEach(user => {
            counts[user.countryCode] = (counts[user.countryCode] || 0) + 1;
        });
        
        return COUNTRIES.map(country => ({
            name: (country as any).nameKo || country.name,
            count: counts[country.code] || 0
        }))
        .filter(c => c.count > 0)
        .sort((a, b) => b.count - a.count);
    }, []);

    const handleLogoClick = () => {
        if (currentUser && currentUser.roles.includes(UserRole.SystemAdmin)) {
            setIsRegisterModalOpen(true);
        } else {
            setMainTab('home');
        }
    };

    const handleUserClick = (user: User, group?: Group) => {
        setSelectedUserContext({ user, group });
    };

    const handleStartConversation = (userId: string) => {
        if (!currentUser) return;
        
        const existingConv = conversations.find(c => 
            c.participantIds.length === 2 && 
            c.participantIds.includes(userId) && 
            c.participantIds.includes(currentUser.id)
        );
        
        let conversationId: string;
        if (existingConv) {
            conversationId = existingConv.id;
        } else {
            const newConv: Conversation = {
                id: `conv_${Date.now()}`, 
                participantIds: [currentUser.id, userId], 
                messages: [], 
                lastMessageAt: new Date().toISOString()
            };
            setConversations(prev => [newConv, ...prev]);
            conversationId = newConv.id;
        }
        
        setInitialConversationId(conversationId);
        setMessengerOpen(true);
    };

    const handleSetStaff = (groupId: string, userId: string, isStaff: boolean) => {
        setGroups(prevGroups => prevGroups.map(g => {
            if (g.id === groupId) {
                const staffIds = new Set(g.staffIds || []);
                if (isStaff) {
                    staffIds.add(userId);
                } else {
                    staffIds.delete(userId);
                }
                const updatedGroup = { ...g, staffIds: Array.from(staffIds) };
                
                if (selectedUserContext && selectedUserContext.group?.id === groupId) {
                    setSelectedUserContext(ctx => ctx ? ({ ...ctx, group: updatedGroup }) : null);
                }

                return updatedGroup;
            }
            return g;
        }));
    };

    const handleAddItem = (type: 'class' | 'milonga' | 'club' | 'service' | 'workshop' | 'admin' | 'group') => {
        if (type === 'milonga' || type === 'class' || type === 'workshop') {
            setEventToEdit(null);
            setAddEventType(type === 'milonga' ? EventType.Milonga : type === 'class' ? EventType.Class : EventType.Workshop);
            setIsAddEventModalOpen(true);
        }
        if (type === 'club') setAddVenueModalOpen(true);
        if (type === 'service') setAddServiceModalOpen(true);
        if (type === 'group') setAddGroupModalOpen(true);
        if (type === 'admin') setAdminDashboardOpen(true);
    };

    const handleOpenAddGroupModal = () => { setGroupToEdit(null); setAddGroupModalOpen(true); };
    const handleOpenAddVenueModal = () => { setVenueToEdit(null); setAddVenueModalOpen(true); };
    const handleOpenAddServiceModal = () => { setServiceToEdit(null); setAddServiceModalOpen(true); };

    const handleSaveUser = (userData: Omit<User, 'id' | 'createdAt'> | User) => { // This is for admin/other user edits
        if ('id' in userData) { // Edit
            setUsers(prev => prev.map(u => u.id === userData.id ? { ...u, ...userData } : u));
            if (currentUser?.id === userData.id) {
                setCurrentUser(userData);
                localStorage.setItem('currentUser', JSON.stringify(userData));
            }
        } else { // Add
            const newUser: User = {
                ...userData,
                id: `user${Date.now()}`,
                createdAt: new Date().toISOString(),
            };
            setUsers(prev => [...prev, newUser]);
        }
    };

    // Add new handler specifically for the current user's profile edit from MyPageView.
    const handleEditCurrentUser = (updatedUser: User) => {
        // Ensure roles are not empty
        if (updatedUser.roles.length === 0) {
            updatedUser.roles = [UserRole.Tangueros];
        }
        handleSaveUser(updatedUser);
    };
    
    const handleRegister = (userData: {
        nickname: string;
        nativeNickname: string;
        countryCode: string;
        phoneNumber: string;
        isPhonePublic: boolean;
        roles: UserRole[];
        gender: any;
        photoUrl: string;
    }, saveShortcut: boolean) => {
        const newUser: User = {
            ...userData,
            id: `user${Date.now()}`,
            createdAt: new Date().toISOString(),
            socialLinks: [],
            points: 0,
        };
        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        setIsRegisterModalOpen(false);
        if (saveShortcut) {
            handleInstall();
        }
    };
    
    const handleAdminLogin = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            setCurrentUser(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            setIsRegisterModalOpen(false);
        }
    };

    const handleSaveEvent = (eventData: Omit<AnyEvent, 'id'>, isRecurring: boolean) => {
        if (eventData.type === EventType.Milonga && isRecurring) {
            const milongaData = eventData as Omit<Milonga, 'id' | 'seriesId'>;
            const seriesId = `series-${Date.now()}`;
            const newEvents: Milonga[] = [];
            const firstDate = parseDate(milongaData.date);
    
            for (let i = 0; i < 12; i++) {
                const eventDate = addDays(firstDate, i * 7);
                const eventDataForThisWeek = { ...milongaData };
                if (i > 0) {
                    eventDataForThisWeek.djId = undefined;
                }
                const newEvent: Milonga = {
                    ...eventDataForThisWeek,
                    id: `milonga-${Date.now()}-${i}`,
                    seriesId,
                    date: eventDate.toISOString().split('T')[0],
                };
                newEvents.push(newEvent);
            }
            setMilongas(prev => [...prev, ...newEvents]);
        } else {
            const newEvent = { ...eventData, id: `event-${Date.now()}` };
            if (newEvent.type === EventType.Milonga) setMilongas(prev => [...prev, newEvent as Milonga]);
            else if (newEvent.type === EventType.Class) setClasses(prev => [...prev, newEvent as Class]);
            else if (newEvent.type === EventType.Workshop) setWorkshops(prev => [...prev, newEvent as Workshop]);
        }
    };
    
    const handleUpdateEvent = (updatedEvent: AnyEvent) => {
        switch (updatedEvent.type) {
            case EventType.Milonga:
                setMilongas(prev => prev.map(e => e.id === updatedEvent.id ? (updatedEvent as Milonga) : e));
                break;
            case EventType.Class:
                setClasses(prev => prev.map(e => e.id === updatedEvent.id ? (updatedEvent as Class) : e));
                break;
            case EventType.Workshop:
                setWorkshops(prev => prev.map(e => e.id === updatedEvent.id ? (updatedEvent as Workshop) : e));
                break;
        }
        setSelectedEvent(updatedEvent);
    };
    
    const handleDeleteEvent = (eventId: string) => {
        setMilongas(prev => prev.filter(e => e.id !== eventId));
        setClasses(prev => prev.filter(e => e.id !== eventId));
        setWorkshops(prev => prev.filter(e => e.id !== eventId));
    };
    
    const handleSaveVenue = (venueData: Omit<Venue, 'id'> | Venue) => {
        if ('id' in venueData) {
            setVenues(prev => prev.map(v => v.id === venueData.id ? { ...v, ...venueData } : v));
        } else {
            const newVenue: Venue = { ...venueData, id: `venue${Date.now()}`};
            setVenues(prev => [...prev, newVenue]);
        }
        setAddVenueModalOpen(false);
        setVenueToEdit(null);
    };

    const handleSaveService = (serviceData: Omit<Service, 'id'> | Service) => {
        if ('id' in serviceData) {
            setServices(prev => prev.map(s => s.id === serviceData.id ? { ...s, ...serviceData } : s));
        } else {
            const newService: Service = { ...serviceData, id: `service${Date.now()}`};
            setServices(prev => [...prev, newService]);
        }
        setAddServiceModalOpen(false);
        setServiceToEdit(null);
    };

    const handleSaveGroup = (groupData: Omit<Group, 'id'|'memberIds'|'creatorId'|'createdAt'> | Group) => {
        if ('id' in groupData) {
            setGroups(prev => prev.map(g => g.id === groupData.id ? { ...g, ...groupData } : g));
        } else {
            if (!currentUser) return;
            const newGroup: Group = {
                ...groupData,
                id: `group${Date.now()}`,
                creatorId: currentUser.id,
                memberIds: [currentUser.id],
                createdAt: new Date().toISOString()
            };
            setGroups(prev => [...prev, newGroup]);

            const newConversation: Conversation = {
                id: `conv_group_${newGroup.id}`,
                groupId: newGroup.id,
                participantIds: [currentUser.id],
                messages: [],
                lastMessageAt: newGroup.createdAt,
                name: newGroup.name,
                creatorId: currentUser.id,
            };
            setConversations(prev => [...prev, newConversation]);
        }
        setAddGroupModalOpen(false);
        setGroupToEdit(null);
    };
    
    const handleAddPost = (postData: any) => {
        if (!currentUser) return;
        const newPost: Post = {
            id: `post${Date.now()}`,
            authorId: currentUser.id,
            ...postData,
            createdAt: new Date().toISOString(),
            reactions: [],
            comments: [],
        };
        if (newPost.category === PostCategory.CarrotMarket && !newPost.forSaleStatus) {
            newPost.forSaleStatus = 'forSale';
        }
        setPosts(prev => [newPost, ...prev]);
        setCreatePostModalOpen(false);
    };

    const handleSavePost = (updatedPost: Post) => {
        setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
        setPostToEdit(null);
        setCreatePostModalOpen(false);
    };

    const handleTogglePinPost = (postId: string) => {
        setPosts(prevPosts => prevPosts.map(p => {
            if (p.id === postId) {
                return { ...p, isPinned: !p.isPinned };
            }
            return p;
        }));
    };

    const handleToggleForSaleStatus = (postId: string) => {
        setPosts(prevPosts => prevPosts.map(p => {
            if (p.id === postId) {
                const newStatus = p.forSaleStatus === 'forSale' ? 'sold' : 'forSale';
                return { ...p, forSaleStatus: newStatus };
            }
            return p;
        }));
    };

    const handleOpenCreatePost = (category: PostCategory) => {
        setCreatePostCategory(category);
        setCreatePostModalOpen(true);
    };

    const handleReactToPost = (postId: string, reactionType: ReactionType) => {
        if (!currentUser) return;
        setPosts(prevPosts => prevPosts.map(p => {
            if (p.id === postId) {
                const existingReactionIndex = p.reactions.findIndex(r => r.userId === currentUser.id);
                if (existingReactionIndex > -1) {
                    if (p.reactions[existingReactionIndex].type === reactionType) {
                        return { ...p, reactions: p.reactions.filter(r => r.userId !== currentUser.id) };
                    } else {
                        const newReactions = [...p.reactions];
                        newReactions[existingReactionIndex] = { userId: currentUser.id, type: reactionType };
                        return { ...p, reactions: newReactions };
                    }
                } else {
                    return { ...p, reactions: [...p.reactions, { userId: currentUser.id, type: reactionType }] };
                }
            }
            return p;
        }));
    };

    const handleAddComment = (postId: string, commentText: string, parentCommentId?: string) => {
        if (!currentUser) return;

        const newComment: AppComment = {
            id: `c${Date.now()}`,
            authorId: currentUser.id,
            content: commentText,
            createdAt: new Date().toISOString(),
            reactions: [],
            replies: [],
        };

        setPosts(prevPosts => prevPosts.map(p => {
            if (p.id === postId) {
                if (parentCommentId) {
                    const findAndAddReply = (comments: AppComment[]): AppComment[] => {
                        return comments.map(c => {
                            if (c.id === parentCommentId) {
                                return { ...c, replies: [...c.replies, newComment] };
                            }
                            if (c.replies.length > 0) {
                                return { ...c, replies: findAndAddReply(c.replies) };
                            }
                            return c;
                        });
                    };
                    return { ...p, comments: findAndAddReply(p.comments) };
                } else {
                    return { ...p, comments: [...p.comments, newComment] };
                }
            }
            return p;
        }));
    };

    const handleReactToComment = (postId: string, commentId: string, reactionType: ReactionType) => {
        if (!currentUser) return;

        setPosts(prevPosts => prevPosts.map(p => {
            if (p.id === postId) {
                const findAndReact = (comments: AppComment[]): AppComment[] => {
                    return comments.map(c => {
                        if (c.id === commentId) {
                            const existingReactionIndex = c.reactions.findIndex(r => r.userId === currentUser.id);
                            if (existingReactionIndex > -1) {
                                if (c.reactions[existingReactionIndex].type === reactionType) {
                                    return { ...c, reactions: c.reactions.filter(r => r.userId !== currentUser.id) };
                                } else {
                                    const newReactions = [...c.reactions];
                                    newReactions[existingReactionIndex] = { userId: currentUser.id, type: reactionType };
                                    return { ...c, reactions: newReactions };
                                }
                            } else {
                                return { ...c, reactions: [...c.reactions, { userId: currentUser.id, type: reactionType }] };
                            }
                        }
                        if (c.replies.length > 0) {
                            return { ...c, replies: findAndReact(c.replies) };
                        }
                        return c;
                    });
                };
                return { ...p, comments: findAndReact(p.comments) };
            }
            return p;
        }));
    };

    const handleAddMilongaInquiry = (milongaId: string, inquiryText: string, parentInquiryId?: string) => {
        if (!currentUser) return;

        const newInquiry: AppComment = {
            id: `inq${Date.now()}`,
            authorId: currentUser.id,
            content: inquiryText,
            createdAt: new Date().toISOString(),
            reactions: [],
            replies: [],
        };

        let targetMilonga: Milonga | undefined;

        setMilongas(prevMilongas => {
            const newMilongas = prevMilongas.map(m => {
                if (m.id === milongaId) {
                    targetMilonga = m;
                    if (parentInquiryId) {
                        const findAndAddReply = (inquiries: AppComment[]): AppComment[] => {
                            return inquiries.map(i => {
                                if (i.id === parentInquiryId) {
                                    return { ...i, replies: [...i.replies, newInquiry] };
                                }
                                if (i.replies.length > 0) {
                                    return { ...i, replies: findAndAddReply(i.replies) };
                                }
                                return i;
                            });
                        };
                        return { ...m, inquiries: findAndAddReply(m.inquiries || []) };
                    } else {
                        return { ...m, inquiries: [...(m.inquiries || []), newInquiry] };
                    }
                }
                return m;
            });
            if (selectedEvent && selectedEvent.id === milongaId) {
                const updatedEvent = newMilongas.find(m => m.id === milongaId);
                if (updatedEvent) {
                    setSelectedEvent(updatedEvent);
                }
            }
            return newMilongas;
        });

        if (targetMilonga) {
            const organizerIds = targetMilonga.providerIds || [targetMilonga.creatorId];
            const isUserOrganizer = organizerIds.includes(currentUser.id);

            if (!isUserOrganizer) {
                const newNotifications: AppNotification[] = organizerIds.map(organizerId => ({
                    id: `notif-${Date.now()}-${organizerId}`,
                    type: NotificationType.MilongaInquiry,
                    fromUserId: currentUser.id,
                    recipientId: organizerId,
                    milongaId: milongaId,
                    commentId: newInquiry.id,
                    read: false,
                    createdAt: new Date().toISOString(),
                }));
                setNotifications(prev => [...prev, ...newNotifications]);
            }
        }
    };
    const handleSendMessage = (conversationId: string, message: { text?: string; imageUrl?: string; videoUrl?: string; }) => {
        if (!currentUser) return;
        setConversations(prev => prev.map(conv => {
            if (conv.id === conversationId) {
                const newMessage: AppMessage = {
                    id: `msg-${Date.now()}`,
                    senderId: currentUser.id,
                    createdAt: new Date().toISOString(),
                    read: true,
                    ...message
                };
                return {
                    ...conv,
                    messages: [...conv.messages, newMessage],
                    lastMessageAt: newMessage.createdAt
                };
            }
            return conv;
        }));
    };

    const getGreeting = (): string => {
        const hour = new Date().getHours();
        if (hour < 12) return t('lucyGreetingMorning');
        if (hour < 18) return t('lucyGreetingAfternoon');
        return t('lucyGreetingEvening');
    };

    const handleLucyClick = () => {
        if (!currentUser) {
            setIsRegisterModalOpen(true);
            return;
        }

        let conversation = lucyConversations.length > 0 ? lucyConversations[0] : null;
        if (!conversation) {
            const newConversation: LucyConversation = {
                id: `lucy_conv_${Date.now()}`,
                title: 'New Chat with Lucy',
                messages: [
                    {
                        id: `msg_${Date.now()}`,
                        role: 'model',
                        text: t('lucyWelcomeFirstTime').replace('{greeting}', getGreeting()).replace('{userName}', currentUser.nickname),
                    }
                ],
                lastUpdatedAt: new Date().toISOString(),
            };
            setLucyConversations(prev => [...prev, newConversation]);
            conversation = newConversation;
        }
        setActiveLucyConversation(conversation);
        setLucyChatOpen(true);
    };

    const handleSaveLucyConversation = (conversation: LucyConversation) => {
        setLucyConversations(prev => {
            const index = prev.findIndex(c => c.id === conversation.id);
            if (index > -1) {
                const newConversations = [...prev];
                newConversations[index] = conversation;
                return newConversations;
            }
            return [...prev, conversation];
        });
    };
    
    const handleNewLucyConversation = () => {
        if(!currentUser) return;
        const newConversation: LucyConversation = {
            id: `lucy_conv_${Date.now()}`,
            title: 'New Chat with Lucy',
            messages: [
                {
                    id: `msg_${Date.now()}`,
                    role: 'model',
                    text: t('lucyWelcomeBack').replace('{greeting}', getGreeting()).replace('{userName}', currentUser.nickname),
                }
            ],
            lastUpdatedAt: new Date().toISOString(),
        };
        setLucyConversations(prev => [newConversation, ...prev]);
        setActiveLucyConversation(newConversation);
    };
    
    const handleEditEvent = (event: AnyEvent) => {
        setEventToEdit(event);
        setAddEventType(null);
        setIsAddEventModalOpen(true);
    };
    
    const handleNotificationClick = (notification: AppNotification) => {
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    
        if (notification.type === NotificationType.Like || notification.type === NotificationType.Comment) {
            if (notification.postId) {
                setPostDetailId(notification.postId);
                setNotificationOpen(false);
            }
        } else if (notification.type === NotificationType.MilongaInquiry) {
            const milonga = milongas.find(m => m.id === notification.milongaId);
            if (milonga) {
                setInitialModalTab('inquiry');
                setSelectedEvent(milonga);
                setNotificationOpen(false);
            }
        } else if (notification.type === NotificationType.GroupRequestApproved) {
            const group = groups.find(g => g.id === notification.groupId);
            if (group) {
                setInitialSelectedGroupIdForCafe(group.id);
                setMainTab('cafe');
                setNotificationOpen(false);
            }
        }
    };

    const handleGroupRequestAction = (notification: AppNotification, status: 'approved' | 'declined') => {
        if (!currentUser || !notification.groupId || !notification.fromUserId) return;
    
        setNotifications(prev => prev.map(n =>
            n.id === notification.id ? { ...n, read: true, requestStatus: status } : n
        ));
    
        if (status === 'approved') {
            const { groupId, fromUserId } = notification;
    
            setGroups(prev => prev.map(g =>
                g.id === groupId ? { ...g, memberIds: [...new Set([...g.memberIds, fromUserId])] } : g
            ));
    
            setConversations(prev => prev.map(conv => {
                if (conv.groupId === groupId && !conv.participantIds.includes(fromUserId)) {
                    return { ...conv, participantIds: [...conv.participantIds, fromUserId] };
                }
                return conv;
            }));
    
            const newNotif: AppNotification = {
                id: `notif-${Date.now()}`,
                type: NotificationType.GroupRequestApproved,
                fromUserId: currentUser.id,
                recipientId: fromUserId,
                groupId: groupId,
                read: false,
                createdAt: new Date().toISOString(),
            };
            setNotifications(prev => [...prev, newNotif]);
        }
    };

    const handleOpenGroupChat = (groupId: string) => {
        const conversation = conversations.find(c => c.groupId === groupId);
        if (conversation) {
            setInitialConversationId(conversation.id);
            setMessengerOpen(true);
        }
    };

    const unreadNotifs = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
    const unreadMsgs = useMemo(() => {
        if (!currentUser) return 0;
        return conversations.reduce((count, conv) => {
            return count + conv.messages.filter(msg => !msg.read && msg.senderId !== currentUser.id).length;
        }, 0);
    }, [conversations, currentUser]);

    if (isLoading) {
        return <SplashScreen countryUserCounts={countryUserCounts} />;
    }

    return (
        <div className={`${(mainTab === 'feed' || mainTab === 'content') ? 'bg-white' : 'bg-gray-100'} text-gray-900 pb-20 relative overflow-hidden`}>
            <header className="sticky top-0 bg-white/90 backdrop-blur-sm z-40 shadow-sm">
                <div className="p-3 flex items-center justify-between h-[56px]">
                    <button onClick={handleLogoClick} className="flex items-center gap-2">
                        <TangoCircleLogo />
                        <h1 className="text-xl font-bold">Tango Korea</h1>
                    </button>
                    <div className="flex items-center gap-2">
                        <button className="relative p-2 rounded-full hover:bg-gray-200" onClick={() => setNotificationOpen(true)}>
                            <BellIcon className="w-6 h-6"/>
                            {unreadNotifs > 0 && (
                                <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-1 ring-white"></span>
                            )}
                        </button>
                        <button className="relative p-2 rounded-full hover:bg-gray-200" onClick={() => setMessengerOpen(true)}>
                            <MessengerIcon className="w-6 h-6"/>
                            {unreadMsgs > 0 && (
                                <span className="absolute top-1 right-1 text-xs bg-red-500 text-white rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                                    {unreadMsgs > 9 ? '9+' : unreadMsgs}
                                </span>
                            )}
                        </button>
                        <button className="p-2 rounded-full hover:bg-gray-200" onClick={handleLucyClick}><SparklesIcon className="w-6 h-6 text-purple-500"/></button>
                        <button className="p-2 rounded-full hover:bg-gray-200" onClick={() => currentUser ? setMainTab('my') : setIsRegisterModalOpen(true)}>
                            {currentUser && currentUser.photoUrl ? (
                                <img src={currentUser.photoUrl} alt="My" className="w-6 h-6 rounded-full object-cover"/>
                            ) : (
                                <UserCircleIcon className="w-6 h-6"/>
                            )}
                        </button>
                    </div>
                </div>
            </header>
            
            {showInstallPrompt && installPrompt && (
                <PWAInstallPrompt onInstall={handleInstall} onClose={handleDismissInstallPrompt} />
            )}
            
            <main className="p-4">
                {mainTab === 'home' && <HomeView milongas={milongas} classes={classes} workshops={workshops} venuesMap={venuesMap} usersMap={usersMap} groupsMap={groupsMap} onEventClick={setSelectedEvent} onCreatorClick={handleUserClick} onEditClick={handleEditEvent} currentUser={currentUser} todayString={todayString} banners={banners} currentDate={currentDate} setCurrentDate={setCurrentDate} onAddItem={handleAddItem} />}
                {mainTab === 'feed' && <FeedView posts={posts} usersMap={usersMap} venuesMap={venuesMap} currentUser={currentUser} onReactToPost={handleReactToPost} onAddComment={handleAddComment} onRegisterClick={() => setIsRegisterModalOpen(true)} onReactToComment={handleReactToComment} onAuthorClick={handleUserClick} onEditPost={(p) => { setPostToEdit(p); setCreatePostModalOpen(true); }} onOpenReactions={(p) => setReactionListPostId(p.id)} onOpenCreatePost={handleOpenCreatePost} highlightedPostId={highlightedPostId} onHighlightEnd={() => setHighlightedPostId(null)} onToggleForSaleStatus={handleToggleForSaleStatus} onOpenLeylaProject={() => setIsLeylaProjectModalOpen(true)} />}
                {mainTab === 'content' && <ContentView posts={posts} usersMap={usersMap} venuesMap={venuesMap} currentUser={currentUser} onReactToPost={handleReactToPost} onAddComment={handleAddComment} onRegisterClick={() => setIsRegisterModalOpen(true)} onReactToComment={handleReactToComment} onAuthorClick={handleUserClick} onEditPost={(p) => { setPostToEdit(p); setCreatePostModalOpen(true); }} onOpenReactions={(p) => setReactionListPostId(p.id)} onOpenCreatePost={handleOpenCreatePost} />}
                {mainTab === 'cafe' && <CommunityView currentUser={currentUser} groups={groups} posts={posts} events={allEvents} users={users} usersMap={usersMap} venuesMap={venuesMap} venues={venues} onAddPost={handleAddPost} onReactToPost={handleReactToPost} onAddComment={handleAddComment} onRegisterClick={() => setIsRegisterModalOpen(true)} onReactToComment={handleReactToComment} onAuthorClick={handleUserClick} onEditPost={(p) => { setPostToEdit(p); setCreatePostModalOpen(true); }} onOpenReactions={(p) => setReactionListPostId(p.id)} onEventClick={setSelectedEvent} onEditEventClick={handleEditEvent} onSavePost={handleSavePost} postToEdit={postToEdit} onEditGroup={(g) => { setGroupToEdit(g); setAddGroupModalOpen(true); }} todayString={todayString} userGroupOrder={userGroupOrder} onSetUserGroupOrder={setUserGroupOrder} conversations={conversations} onOpenGroupChat={handleOpenGroupChat} onPostClick={(p) => setPostDetailId(p.id)} initialSelectedGroupId={initialSelectedGroupIdForCafe} onClearInitialGroupId={() => setInitialSelectedGroupIdForCafe(null)} onTogglePinPost={handleTogglePinPost} />}
                {mainTab === 'community' && <ResourcesView users={users} venues={venues} services={services} groups={groups} usersMap={usersMap} currentUser={currentUser} onUserClick={handleUserClick} onClubClick={setSelectedVenue} onServiceClick={setSelectedService} onGroupClick={setSelectedGroupForDetail} onEditService={(s) => { setServiceToEdit(s); setAddServiceModalOpen(true); }} onDeleteService={(id) => setServices(prev => prev.filter(s => s.id !== id))} onAddCommunity={handleOpenAddGroupModal} onAddVenue={handleOpenAddVenueModal} onAddService={handleOpenAddServiceModal} onHostClick={handleUserClick}/>}
                {mainTab === 'playground' && <Suspense fallback={<div>Loading...</div>}><PlaygroundView currentUser={currentUser} onUpdateUserPoints={(points) => { if(currentUser) setCurrentUser({...currentUser, points: (currentUser.points || 0) + points}) }} /></Suspense>}
                {mainTab === 'my' && currentUser && <MyPageView currentUser={currentUser} onEditUser={handleEditCurrentUser} posts={posts} usersMap={usersMap} venuesMap={venuesMap} onReactToPost={handleReactToPost} onAddComment={handleAddComment} onRegisterClick={() => setIsRegisterModalOpen(true)} onReactToComment={handleReactToComment} onAuthorClick={handleUserClick} onEditPost={(p) => { setPostToEdit(p); setCreatePostModalOpen(true); }} onOpenReactions={(p) => setReactionListPostId(p.id)} groups={groups} events={allEvents} groupsMap={groupsMap} onEventClick={setSelectedEvent} onEditEventClick={handleEditEvent} todayString={todayString} onOpenAdminDashboard={() => setAdminDashboardOpen(true)} languages={languages} />}
                {mainTab === 'search' && <GlobalSearchView users={users} events={allEvents} services={services} groups={groups} clubs={venues} posts={posts} currentUser={currentUser} onUserClick={handleUserClick} onEventClick={setSelectedEvent} onServiceClick={setSelectedService} onClubClick={setSelectedVenue} onPostClick={(p) => setPostDetailId(p.id)} usersMap={usersMap} venuesMap={venuesMap} onGroupClick={setSelectedGroupForDetail} />}
            </main>

            {isRegisterModalOpen && <RegisterModal onClose={() => setIsRegisterModalOpen(false)} onRegister={handleRegister} existingUsers={users} onAdminLogin={handleAdminLogin} currentUser={currentUser} setLanguage={setLanguage} language={language} languages={languages} />}
            {selectedEvent && <EventDetailModal event={selectedEvent} creator={usersMap.get(selectedEvent.creatorId)!} dj={'djId' in selectedEvent && selectedEvent.djId ? usersMap.get(selectedEvent.djId) : undefined} club={selectedEvent.venueId ? venuesMap.get(selectedEvent.venueId) : undefined} group={selectedEvent.groupId ? groupsMap.get(selectedEvent.groupId) : undefined} onClose={() => { setSelectedEvent(null); setInitialModalTab(null); }} onUpdateEvent={handleUpdateEvent} currentUser={currentUser} onSignUp={() => setIsRegisterModalOpen(true)} usersMap={usersMap} onUserClick={handleUserClick} onEditEvent={handleEditEvent} initialTab={initialModalTab} onAddMilongaInquiry={handleAddMilongaInquiry} />}
            {selectedUserContext && <UserProfileModal user={selectedUserContext.user} contextGroup={selectedUserContext.group} onClose={() => setSelectedUserContext(null)} onEdit={(u) => { /* TODO: Re-implement user editing */ }} currentUser={currentUser} onSetStaff={handleSetStaff} onStartConversation={handleStartConversation} />}
            {selectedService && <ServiceDetailModal service={selectedService} host={usersMap.get(selectedService.hostId)} onClose={() => setSelectedService(null)} currentUser={currentUser} onHostClick={handleUserClick} onUpdateService={(s) => setServices(prev => prev.map(ps => ps.id === s.id ? s : ps))} onEdit={(s) => { setSelectedService(null); setServiceToEdit(s); setAddServiceModalOpen(true); }} />}
            {selectedVenue && <Suspense fallback={<div>Loading...</div>}><ClubDetailModal club={selectedVenue} onClose={() => setSelectedVenue(null)} events={allEvents} usersMap={usersMap} venuesMap={venuesMap} groupsMap={groupsMap} onEventClick={setSelectedEvent} currentUser={currentUser} onEdit={(v) => { setSelectedVenue(null); setVenueToEdit(v); setAddVenueModalOpen(true); }} todayString={todayString} onCreatorClick={handleUserClick} /></Suspense>}
            {postForDetailModal && <PostDetailModal post={postForDetailModal} usersMap={usersMap} venuesMap={venuesMap} currentUser={currentUser} onClose={() => setPostDetailId(null)} onReactToPost={handleReactToPost} onAddComment={handleAddComment} onRegisterClick={() => setIsRegisterModalOpen(true)} onReactToComment={handleReactToComment} onAuthorClick={handleUserClick} onEditPost={(p) => { setPostDetailId(null); setPostToEdit(p); setCreatePostModalOpen(true); }} onOpenReactions={(p) => setReactionListPostId(p.id)} />}
            {selectedGroupForDetail && <GroupDetailView group={selectedGroupForDetail} onClose={() => setSelectedGroupForDetail(null)} currentUser={currentUser} onJoinOrRequest={(g) => { if(currentUser) {setGroups(prev => prev.map(pg => pg.id === g.id ? {...pg, memberIds: [...pg.memberIds, currentUser.id]} : pg)); setSelectedGroupForDetail(null); setMainTab('cafe');} }} />}
            
            {isAddEventModalOpen && <AddEventModal venues={venues} users={users} groups={groups} onClose={() => { setIsAddEventModalOpen(false); setEventToEdit(null); }} onSaveEvent={handleSaveEvent} onUpdateEvent={handleUpdateEvent} eventToEdit={eventToEdit} eventTypeForCreate={addEventType} currentUser={currentUser} />}
            {isAddVenueModalOpen && <AddVenueModal onClose={() => { setAddVenueModalOpen(false); setVenueToEdit(null); }} onSaveClub={handleSaveVenue} clubToEdit={venueToEdit} currentUser={currentUser} onDeleteClub={(id) => setVenues(prev => prev.filter(v => v.id !== id))} />}
            {isAddServiceModalOpen && <AddServiceModal onClose={() => { setAddServiceModalOpen(false); setServiceToEdit(null); }} onSaveService={handleSaveService} serviceToEdit={serviceToEdit} currentUser={currentUser} onDeleteService={(id) => setServices(prev => prev.filter(s => s.id !== id))} />}
            {isAddGroupModalOpen && <AddGroupModal clubs={venues} onClose={() => { setAddGroupModalOpen(false); setGroupToEdit(null); }} onSaveGroup={handleSaveGroup} groupToEdit={groupToEdit} currentUser={currentUser} onDeleteGroup={(id) => setGroups(prev => prev.filter(g => g.id !== id))} />}
            {isCreatePostModalOpen && <CreatePostModal currentUser={currentUser} onClose={() => { setCreatePostModalOpen(false); setPostToEdit(null); }} onAddPost={handleAddPost} onSavePost={handleSavePost} currentUserGroups={groups.filter(g => currentUser && g.memberIds.includes(currentUser.id))} users={users} venues={venues} isGlobalFeed={mainTab === 'feed'} defaultCategory={createPostCategory} />}
            {isIosInstallModalOpen && <IosInstallMessageModal onClose={() => { setIosInstallModalOpen(false); localStorage.setItem('hasSeenIosInstallPrompt', 'true'); }}/>}
            {isAdminDashboardOpen && currentUser?.roles.includes(UserRole.Admin) && <AdminDashboard users={users} milongas={milongas} classes={classes} workshops={workshops} clubs={venues} services={services} posts={posts} groups={groups} banners={banners} onClose={() => setAdminDashboardOpen(false)} onSaveBanner={(b) => { if('id' in b) { /* update */ } else { /* add */ } }} onDeleteBanner={(id) => {}} onEditUser={(u)=>{/* TODO: Re-implement user editing */}} onDeleteUser={(id) => setUsers(prev => prev.filter(u => u.id !== id))} onEditEvent={handleEditEvent} onDeleteEvent={handleDeleteEvent} onEditClub={(v)=>{setVenueToEdit(v); setAddVenueModalOpen(true);}} onDeleteClub={(id) => setVenues(prev => prev.filter(v => v.id !== id))} onEditService={(s) => {setServiceToEdit(s); setAddServiceModalOpen(true);}} onDeleteService={(id) => setServices(prev => prev.filter(s => s.id !== id))} onEditPost={(p) => {setPostToEdit(p); setCreatePostModalOpen(true);}} onDeletePost={(id) => setPosts(prev => prev.filter(p => p.id !== id))} onEditGroup={(g) => {setGroupToEdit(g); setAddGroupModalOpen(true);}} onDeleteGroup={(id) => setGroups(prev => prev.filter(g => g.id !== id))} usersMap={usersMap} venuesMap={venuesMap} />}
            {postForReactionModal && <ReactionListModal post={postForReactionModal} usersMap={usersMap} onClose={() => setReactionListPostId(null)} onUserClick={handleUserClick} />}
            {isManageVenuesModalOpen && <ManageVenuesModal venues={venues} users={users} onClose={() => setManageVenuesModalOpen(false)} onEditVenue={(v) => {setVenueToEdit(v); setAddVenueModalOpen(true);}} onAddNewVenue={() => {setVenueToEdit(null); setAddVenueModalOpen(true);}} onDeleteVenue={(id) => setVenues(prev => prev.filter(v => v.id !== id))} />}
            {currentUser && <MessengerModal isOpen={isMessengerOpen} onClose={() => setMessengerOpen(false)} currentUser={currentUser} users={users} conversations={conversations} onSendMessage={handleSendMessage} onStartConversation={(userId) => { const conv = conversations.find(c => c.participantIds.length === 2 && c.participantIds.includes(userId) && c.participantIds.includes(currentUser.id)); if (conv) return conv.id; const newConv = {id: `conv_${Date.now()}`, participantIds: [currentUser.id, userId], messages: [], lastMessageAt: new Date().toISOString()}; setConversations(prev => [newConv, ...prev]); return newConv.id; }} onStartGroupConversation={(userIds, groupName) => { const newConv = { id: `conv_group_${Date.now()}`, participantIds: [currentUser.id, ...userIds], name: groupName, messages: [], lastMessageAt: new Date().toISOString()}; setConversations(prev => [newConv, ...prev]); return newConv.id; }} onMarkAsRead={(convId) => { setConversations(prev => prev.map(c => c.id === convId ? {...c, messages: c.messages.map(m => ({...m, read: true}))} : c)); }} initialConversationId={initialConversationId} onClearInitialConversation={() => setInitialConversationId(null)} />}
            {isNotificationOpen && currentUser && <NotificationModal isOpen={isNotificationOpen} onClose={() => setNotificationOpen(false)} notifications={notifications} usersMap={usersMap} groupsMap={groupsMap} milongasMap={milongasMap} currentUser={currentUser} onNotificationClick={handleNotificationClick} onGroupRequestAction={handleGroupRequestAction} />}
            {activeLucyConversation && <LucyChatModal isOpen={isLucyChatOpen} onClose={() => setLucyChatOpen(false)} currentUser={currentUser} conversation={activeLucyConversation} onSaveConversation={handleSaveLucyConversation} allConversations={lucyConversations} onSelectConversation={setActiveLucyConversation} onNewConversation={handleNewLucyConversation} events={allEvents} services={services} posts={posts} venuesMap={venuesMap} />}
            {isLeylaProjectModalOpen && <LeylaProjectModal onClose={() => setIsLeylaProjectModalOpen(false)} />}

            <footer className="fixed bottom-0 w-full max-w-[450px] left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border-t shadow-top-md z-40">
                <div className="flex justify-around items-center h-[64px]">
                    {footerTabs.map(tab => (
                        <button key={tab} onClick={() => setMainTab(tab)} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${mainTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>
                            {React.createElement(mainTab === tab ? tabIcons[tab].filled : tabIcons[tab].outline, { className: 'w-6 h-6' })}
                            <span className="text-xs mt-1 font-semibold">{t(tab)}</span>
                        </button>
                    ))}
                </div>
            </footer>
        </div>
    );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}