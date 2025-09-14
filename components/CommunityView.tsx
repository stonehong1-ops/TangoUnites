import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, Group, Post, AnyEvent, UserRole, Gender, Venue, ReactionType, Comment, Reaction, EventType, Milonga, Class, Workshop, Conversation } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { MALE_AVATAR_URL, FEMALE_AVATAR_URL, COUNTRIES } from '../constants';
import PostCard from './PostCard';
import EventCard from './EventCard';
import { CreatePostModal } from './CreatePost';
import { CalendarIcon, UsersIcon, EditIcon, MaleIcon, FemaleIcon, SearchIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, HeartIcon, ChatBubbleOvalLeftIcon, QueueListIcon, PinIcon, PinIconFilled } from './icons';
import SwipeableTabView, { Tab } from './SwipeableTabView';

interface CommunityViewProps {
    currentUser: User | null;
    groups: Group[];
    posts: Post[];
    events: AnyEvent[];
    users: User[];
    usersMap: Map<string, User>;
    venuesMap: Map<string, Venue>;
    venues: Venue[];
    onAddPost: (postData: { content: string; imageUrls: string[]; videoUrl: string; linkUrls: string[]; taggedUserIds: string[]; taggedVenueId?: string; groupId?: string; isNotice?: boolean; isPinned?: boolean; }) => void;
    onReactToPost: (postId: string, reactionType: ReactionType) => void;
    onAddComment: (postId: string, commentText: string, parentCommentId?: string) => void;
    onRegisterClick: () => void;
    onReactToComment: (postId: string, commentId: string, reactionType: ReactionType) => void;
    onAuthorClick: (user: User, group?: Group) => void;
    onEditPost: (post: Post) => void;
    onOpenReactions: (post: Post) => void;
    onEventClick: (event: AnyEvent) => void;
    onEditEventClick: (event: AnyEvent) => void;
    onSavePost: (post: Post) => void;
    postToEdit?: Post | null;
    onEditGroup: (group: Group) => void;
    todayString: string;
    userGroupOrder: string[];
    onSetUserGroupOrder: (order: string[]) => void;
    conversations: Conversation[];
    onOpenGroupChat: (groupId: string) => void;
    onPostClick: (post: Post) => void;
    initialSelectedGroupId?: string | null;
    onClearInitialGroupId?: () => void;
    onTogglePinPost: (postId: string) => void;
}

type CommunityTab = 'about' | 'feed' | 'notice' | 'calendar' | 'people';

// FIX: This helper function now correctly handles all event types by checking the `type` property, preventing errors when accessing date information.
const getEventDates = (event: AnyEvent): string[] => {
    if (event.type === EventType.Milonga) return [event.date];
    if (event.type === EventType.Class) return event.sessions.map(s => s.date);
    return (event as Workshop).dates;
};

const NoticeListItem: React.FC<{ 
    post: Post; 
    onPostClick: (post: Post) => void; 
    usersMap: Map<string, User>; 
    isAdmin: boolean; 
    onTogglePin: (postId: string) => void;
}> = ({ post, onPostClick, usersMap, isAdmin, onTogglePin }) => {
    const { t } = useLanguage();
    const author = usersMap.get(post.authorId);
    const title = post.title || post.content.split('\n')[0];
    const date = new Date(post.createdAt).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' }).replace(/\s/g, '');

    return (
        <div className="flex items-center">
            <button onClick={() => onPostClick(post)} className="w-full p-4 text-left border-b last:border-b-0 hover:bg-gray-50 transition-colors flex-grow">
                <div className="flex items-center gap-2">
                    {post.isPinned && <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{t('notice')}</span>}
                    <p className="font-bold text-gray-800 truncate">{title}</p>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                    <span>{author?.nickname}</span>
                    <span className="text-gray-300">|</span>
                    <span>{date}</span>
                    <span className="text-gray-300">|</span>
                    <span>{t('views')} {post.viewCount || 0}</span>
                    <span className="ml-auto flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <HeartIcon className="w-3 h-3 text-red-400"/>
                            {post.reactions.length}
                        </span>
                        <span className="flex items-center gap-1">
                            <ChatBubbleOvalLeftIcon className="w-3 h-3 text-gray-400" />
                            {post.comments.length}
                        </span>
                    </span>
                </div>
            </button>
            {isAdmin && (
                 <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(post.id);
                    }}
                    className="p-2 rounded-full hover:bg-gray-200 text-gray-500 hover:text-blue-600 ml-2 flex-shrink-0"
                    title={post.isPinned ? t('unpinNotice') : t('pinNotice')}
                 >
                     {post.isPinned ? <PinIconFilled className="w-5 h-5 text-blue-600" /> : <PinIcon className="w-5 h-5" />}
                 </button>
            )}
        </div>
    );
};

// FIX: Define missing component FeedTabContent
const FeedTabContent: React.FC<any> = ({ posts, groupId, onOpenCreatePost, ...rest }) => {
    const { t } = useLanguage();
    const groupPosts = useMemo(() =>
        posts.filter((p: Post) => p.groupId === groupId && !p.isNotice)
             .sort((a: Post, b: Post) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        [posts, groupId]
    );

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-3">
                <img src={rest.currentUser?.photoUrl || MALE_AVATAR_URL} alt={rest.currentUser?.nickname} className="w-10 h-10 rounded-full object-cover" />
                <button onClick={onOpenCreatePost} className="flex-grow text-left bg-gray-100 text-gray-500 rounded-full p-3 pl-4 cursor-pointer hover:bg-gray-200 transition">
                    {t('whatsOnYourMind').replace('{user}', rest.currentUser.nickname)}
                </button>
            </div>
            {groupPosts.length > 0 ? (
                groupPosts.map((post: Post) => <PostCard key={post.id} post={post} {...rest} />)
            ) : (
                <p className="text-center text-gray-500 py-8">{t('noPostsYet')}</p>
            )}
        </div>
    );
};

// FIX: Define missing component CalendarTabContent
const CalendarTabContent: React.FC<any> = ({ events, groupId, ...rest }) => {
    const { t } = useLanguage();
    const groupEvents = useMemo(() =>
        events.filter((e: AnyEvent) => e.groupId === groupId)
              .sort((a: AnyEvent, b: AnyEvent) => getEventDates(a)[0].localeCompare(getEventDates(b)[0])),
        [events, groupId]
    );

    return (
        <div className="space-y-4">
            {groupEvents.length > 0 ? (
                groupEvents.map((event: AnyEvent) => {
                    const creator = rest.usersMap.get(event.creatorId);
                    const dj = 'djId' in event && event.djId ? rest.usersMap.get(event.djId) : null;
                    if (!creator) return null;
                    return <EventCard key={event.id} event={event} creator={creator} dj={dj} onCardClick={rest.onEventClick} onCreatorClick={rest.onAuthorClick} onEditClick={rest.onEditEventClick} currentUser={rest.currentUser} todayString={rest.todayString} usersMap={rest.usersMap} venuesMap={rest.venuesMap} groupsMap={rest.groupsMap} />;
                })
            ) : (
                <p className="text-center text-gray-500 py-8">{t('noEventsForVenue')}</p> 
            )}
        </div>
    );
};

// FIX: Define missing component PeopleTabContent
const PeopleTabContent: React.FC<{ memberIds: string[]; users: User[]; onUserClick: (user: User, group: Group) => void; creatorId: string; staffIds: string[]; selectedGroup: Group; }> = ({ memberIds, users, onUserClick, creatorId, staffIds, selectedGroup }) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const { creator, staff, members } = useMemo(() => {
        const allMembers = memberIds.map(id => users.find(u => u.id === id)).filter((u): u is User => !!u);
        const creator = allMembers.find(u => u.id === creatorId);
        const staff = allMembers.filter(u => staffIds.includes(u.id) && u.id !== creatorId);
        const members = allMembers.filter(u => u.id !== creatorId && !staffIds.includes(u.id));

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            return {
                creator: creator,
                staff: staff.filter(u => u.nickname.toLowerCase().includes(lowerSearch) || u.nativeNickname.toLowerCase().includes(lowerSearch)),
                members: members.filter(u => u.nickname.toLowerCase().includes(lowerSearch) || u.nativeNickname.toLowerCase().includes(lowerSearch)),
            };
        }
        return { creator, staff, members };
    }, [memberIds, users, creatorId, staffIds, searchTerm]);

    const UserListItem: React.FC<{ user: User }> = ({ user }) => (
        <button onClick={() => onUserClick(user, selectedGroup)} className="w-full flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition text-left group border">
            <img src={user.photoUrl || (user.gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL)} alt={user.nickname} className="w-10 h-10 rounded-full object-cover" />
            <div>
                <p className="font-bold text-gray-800 group-hover:text-blue-600">{user.nickname}</p>
                <p className="text-sm text-gray-500">{user.nativeNickname}</p>
            </div>
        </button>
    );

    return (
        <div className="space-y-4">
            <div className="relative">
                <input type="text" placeholder={t('searchByUser')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white rounded-md p-2 pl-10 border border-gray-300" />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            {creator && (!searchTerm || creator.nickname.toLowerCase().includes(searchTerm.toLowerCase()) || creator.nativeNickname.toLowerCase().includes(searchTerm.toLowerCase())) && (
                <div>
                    <h3 className="font-bold text-gray-500 text-sm mb-2">{t('creator')}</h3>
                    <UserListItem user={creator} />
                </div>
            )}
            {staff.length > 0 && (
                <div>
                    <h3 className="font-bold text-gray-500 text-sm mb-2">{t('staff')}</h3>
                    <div className="space-y-2">
                        {staff.map(user => <UserListItem key={user.id} user={user} />)}
                    </div>
                </div>
            )}
            {members.length > 0 && (
                <div>
                    <h3 className="font-bold text-gray-500 text-sm mb-2">{t('members')}</h3>
                    <div className="space-y-2">
                        {members.map(user => <UserListItem key={user.id} user={user} />)}
                    </div>
                </div>
            )}
             {searchTerm && !creator && staff.length === 0 && members.length === 0 && (
                 <p className="text-center text-gray-500 py-8">{t('noUsersFound')}</p>
             )}
        </div>
    );
};

export const CommunityView: React.FC<CommunityViewProps> = (props) => {
    const { currentUser, groups, userGroupOrder, onSetUserGroupOrder, conversations, onOpenGroupChat, initialSelectedGroupId, onClearInitialGroupId } = props;
    const { t } = useLanguage();

    const [isGroupSelectorOpen, setIsGroupSelectorOpen] = useState(false);
    const [isEditingOrder, setIsEditingOrder] = useState(false);
    
    const { myPersonalGroups, myPublicGroups } = useMemo(() => {
        if (!currentUser) return { myPersonalGroups: [], myPublicGroups: [] };
        const memberGroups = groups.filter(g => g.memberIds.includes(currentUser.id));
        const personal = memberGroups.filter(g => !g.isPublic);
        const publicGroups = memberGroups.filter(g => g.isPublic);

        const personalInOrder = userGroupOrder
            .map(id => personal.find(g => g.id === id))
            .filter((g): g is Group => !!g);
        
        const personalNotInOrder = personal.filter(g => !userGroupOrder.includes(g.id));
        return { myPersonalGroups: [...personalInOrder, ...personalNotInOrder], myPublicGroups: publicGroups };
    }, [groups, currentUser, userGroupOrder]);

    const myGroups = useMemo(() => [...myPersonalGroups, ...myPublicGroups], [myPersonalGroups, myPublicGroups]);
    
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(myGroups[0]?.id || null);
    
    const [draggableList, setDraggableList] = useState<Group[]>([]);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    useEffect(() => {
        if (initialSelectedGroupId && myGroups.some(g => g.id === initialSelectedGroupId)) {
            setSelectedGroupId(initialSelectedGroupId);
            if (onClearInitialGroupId) {
              onClearInitialGroupId();
            }
        } else if (!selectedGroupId && myGroups.length > 0) {
            setSelectedGroupId(myGroups[0].id);
        }
    }, [initialSelectedGroupId, myGroups, onClearInitialGroupId, selectedGroupId]);

    const [isNoticeModalOpen, setNoticeModalOpen] = useState(false);
    const [isCreatePostModalOpen, setCreatePostModalOpen] = useState(false);
    const [isPinnedMode, setIsPinnedMode] = useState(false);

    const handleStartEditing = () => {
        setDraggableList(myPersonalGroups);
        setIsEditingOrder(true);
    };
    
    const handleSaveOrder = () => {
        onSetUserGroupOrder(draggableList.map(g => g.id));
        setIsEditingOrder(false);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
        dragItem.current = position;
    };
    
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
        dragOverItem.current = position;
        const listCopy = [...draggableList];
        const dragItemContent = listCopy[dragItem.current!];
        listCopy.splice(dragItem.current!, 1);
        listCopy.splice(dragOverItem.current!, 0, dragItemContent);
        dragItem.current = dragOverItem.current;
        dragOverItem.current = null;
        setDraggableList(listCopy);
    };
    
    const handleDragEnd = () => {
        dragItem.current = null;
        dragOverItem.current = null;
    };

    const selectedGroup = useMemo(() => groups.find(g => g.id === selectedGroupId), [groups, selectedGroupId]);
    const isGroupAdmin = currentUser?.roles.includes(UserRole.SystemAdmin) || currentUser?.roles.includes(UserRole.Admin) || (selectedGroup && selectedGroup.creatorId === currentUser?.id);
    
    const handleNewNotice = () => {
        setIsPinnedMode(false);
        setNoticeModalOpen(true);
    };

    if (!currentUser || myGroups.length === 0) {
        return <div className="text-center p-8">{t('noGroupsJoined')}</div>;
    }

    if (!selectedGroup) {
        return <div className="text-center p-8">{t('selectGroup')}</div>;
    }

    const tabs: Tab[] = [
        { id: 'about', label: t('about'), content: <AboutTabContent selectedGroup={selectedGroup} users={props.users} venuesMap={props.venuesMap} isAdmin={isGroupAdmin} onEditGroup={props.onEditGroup} conversations={conversations} onOpenGroupChat={onOpenGroupChat} currentUser={currentUser} /> },
        { id: 'notice', label: t('notice'), content: <NoticeTabContent posts={props.posts} groupId={selectedGroup.id} usersMap={props.usersMap} isAdmin={isGroupAdmin} onNewNoticeClick={handleNewNotice} onPostClick={props.onPostClick} onTogglePinPost={props.onTogglePinPost} /> },
        { id: 'feed', label: t('feed'), content: <FeedTabContent posts={props.posts} groupId={selectedGroup.id} venuesMap={props.venuesMap} onOpenCreatePost={() => setCreatePostModalOpen(true)} {...props} /> },
        { id: 'calendar', label: t('calendar'), content: <CalendarTabContent events={props.events} groupId={selectedGroup.id} venuesMap={props.venuesMap} selectedGroup={selectedGroup} {...props} /> },
        { id: 'people', label: t('people'), content: <PeopleTabContent memberIds={selectedGroup.memberIds} users={props.users} onUserClick={props.onAuthorClick} creatorId={selectedGroup.creatorId} staffIds={selectedGroup.staffIds || []} selectedGroup={selectedGroup} /> }
    ];

    return (
        <div>
            {/* Group Header */}
            <div className="mb-4">
                <div className="relative p-2 bg-white rounded-lg shadow-sm border">
                    <button onClick={() => setIsGroupSelectorOpen(!isGroupSelectorOpen)} className="w-full flex items-center justify-between p-2">
                        <div className="flex items-center gap-3">
                            <img src={selectedGroup.imageUrls[0]} alt={selectedGroup.name} className="w-8 h-8 rounded-lg object-cover"/>
                            <span className="font-bold text-lg">{selectedGroup.name}</span>
                        </div>
                        <ChevronDownIcon className={`w-6 h-6 transition-transform ${isGroupSelectorOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isGroupSelectorOpen && (
                         <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-30 animate-fade-in">
                            <div className="p-2 flex justify-end border-b">
                                {!isEditingOrder ? (
                                    <button onClick={handleStartEditing} className="text-sm font-semibold text-blue-600 hover:text-blue-500">{t('editOrder')}</button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsEditingOrder(false)} className="text-sm font-semibold text-gray-600 hover:text-gray-500">{t('cancel')}</button>
                                        <button onClick={handleSaveOrder} className="text-sm font-semibold text-blue-600 hover:text-blue-500">{t('done')}</button>
                                    </div>
                                )}
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                               {isEditingOrder ? (
                                    draggableList.map((group, index) => (
                                        <div
                                            key={group.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragEnter={(e) => handleDragEnter(e, index)}
                                            onDragEnd={handleDragEnd}
                                            onDragOver={(e) => e.preventDefault()}
                                            className="p-2 flex items-center gap-3 cursor-grab active:cursor-grabbing bg-gray-50 border-b"
                                        >
                                            <QueueListIcon className="w-5 h-5 text-gray-400" />
                                            <img src={group.imageUrls[0]} alt={group.name} className="w-8 h-8 rounded-lg object-cover"/>
                                            <span>{group.name}</span>
                                        </div>
                                    ))
                                ) : (
                                    <>
                                        {myPersonalGroups.map(group => (
                                            <button key={group.id} onClick={() => { setSelectedGroupId(group.id); setIsGroupSelectorOpen(false); }} className="w-full text-left p-2 flex items-center gap-3 hover:bg-gray-100 border-b">
                                                <img src={group.imageUrls[0]} alt={group.name} className="w-8 h-8 rounded-lg object-cover"/>
                                                <span>{group.name}</span>
                                            </button>
                                        ))}
                                         {myPublicGroups.length > 0 && <div className="p-2 text-xs text-gray-400 font-semibold border-b">공용 까페</div>}
                                        {myPublicGroups.map(group => (
                                            <button key={group.id} onClick={() => { setSelectedGroupId(group.id); setIsGroupSelectorOpen(false); }} className="w-full text-left p-2 flex items-center gap-3 hover:bg-gray-100 border-b">
                                                <img src={group.imageUrls[0]} alt={group.name} className="w-8 h-8 rounded-lg object-cover"/>
                                                <span>{group.name}</span>
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <SwipeableTabView tabs={tabs} stickyHeader />

            {isNoticeModalOpen && (
                <CreatePostModal
                    currentUser={currentUser}
                    onClose={() => setNoticeModalOpen(false)}
                    onAddPost={props.onAddPost}
                    onSavePost={props.onSavePost}
                    isNoticeMode={true}
                    isPinnedMode={isPinnedMode}
                    defaultGroupId={selectedGroup.id}
                    users={props.users}
                    venues={props.venues}
                    currentUserGroups={[selectedGroup]}
                    postToEdit={props.postToEdit}
                />
            )}
            {isCreatePostModalOpen && (
                 <CreatePostModal
                    currentUser={currentUser}
                    onClose={() => setCreatePostModalOpen(false)}
                    onAddPost={props.onAddPost}
                    onSavePost={props.onSavePost}
                    defaultGroupId={selectedGroup.id}
                    users={props.users}
                    venues={props.venues}
                    currentUserGroups={[selectedGroup]}
                    postToEdit={props.postToEdit}
                />
            )}
        </div>
    );
};

const AboutTabContent: React.FC<{
    selectedGroup: Group;
    users: User[];
    venuesMap: Map<string, Venue>;
    isAdmin: boolean;
    onEditGroup: (group: Group) => void;
    conversations: Conversation[];
    onOpenGroupChat: (groupId: string) => void;
    currentUser: User | null;
}> = ({ selectedGroup, users, venuesMap, isAdmin, onEditGroup, conversations, onOpenGroupChat, currentUser }) => {
    const { t } = useLanguage();
    const { tangueraCount, tangueroCount } = useMemo(() => {
        if (!selectedGroup) return { tangueraCount: 0, tangueroCount: 0 };
        const groupMembers = users.filter(user => selectedGroup.memberIds.includes(user.id));
        return {
            tangueraCount: groupMembers.filter(member => member.gender === Gender.Tanguera).length,
            tangueroCount: groupMembers.filter(member => member.gender === Gender.Tanguero).length,
        };
    }, [selectedGroup, users]);

    const groupConversation = useMemo(() => {
        return conversations.find(c => c.groupId === selectedGroup.id);
    }, [conversations, selectedGroup.id]);

    const unreadCount = useMemo(() => {
        if (!groupConversation || !currentUser) return 0;
        return groupConversation.messages.filter(msg => !msg.read && msg.senderId !== currentUser.id).length;
    }, [groupConversation, currentUser]);


    const associatedVenue = selectedGroup.clubId ? venuesMap.get(selectedGroup.clubId) : null;

    let joinMethodText = '';
    if (selectedGroup.isPublic) {
        joinMethodText = t('publicGroup');
    } else if (selectedGroup.requiresApproval) {
        joinMethodText = t('approvalRequired');
    } else {
        joinMethodText = t('openToAll');
    }
    
    return (
        <div className="space-y-4 bg-white p-4 rounded-xl shadow-sm">
             <div className="w-full h-40 bg-gray-200 rounded-lg overflow-hidden relative">
                <img src={selectedGroup.imageUrls[0]} alt={selectedGroup.name} className="w-full h-full object-cover" />
                {isAdmin && (
                    <button onClick={() => onEditGroup(selectedGroup)} className="absolute top-2 right-2 flex items-center gap-2 bg-white/70 backdrop-blur-sm text-gray-800 font-semibold py-1 px-3 rounded-full hover:bg-white transition text-sm">
                        <EditIcon className="w-4 h-4" />
                        {t('editGroupInfo')}
                    </button>
                )}
            </div>
            
            <p className="text-gray-700 whitespace-pre-wrap">{selectedGroup.description}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('memberCount')}</h4>
                    <p className="text-base font-semibold mt-1 text-gray-800 flex items-center gap-3 flex-wrap justify-center sm:justify-start">
                        <span className="flex items-center gap-1.5 text-blue-600"><MaleIcon className="w-4 h-4" />{t('Tanguero')} {tangueroCount}</span>
                        <span className="text-gray-300">/</span>
                        <span className="flex items-center gap-1.5 text-red-600"><FemaleIcon className="w-4 h-4" />{t('Tanguera')} {tangueraCount}</span>
                    </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('joinMethod')}</h4>
                    <p className="text-base font-semibold mt-1 text-gray-800">{joinMethodText}</p>
                </div>
            </div>

            {associatedVenue && (
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('associatedVenue')}</h4>
                    <p className="text-base font-semibold mt-1 text-gray-800">{associatedVenue.name}</p>
                </div>
            )}

            <div className="pt-4 border-t">
                <button 
                    onClick={() => onOpenGroupChat(selectedGroup.id)}
                    className="w-full relative flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-transform transform hover:scale-105"
                >
                    {t('goToGroupChat')}
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{unreadCount}</span>
                    )}
                </button>
            </div>
        </div>
    );
};

const NoticeTabContent: React.FC<{
    posts: Post[];
    groupId: string;
    usersMap: Map<string, User>;
    isAdmin: boolean;
    onNewNoticeClick: () => void;
    onPostClick: (post: Post) => void;
    onTogglePinPost: (postId: string) => void;
}> = ({ posts, groupId, usersMap, isAdmin, onNewNoticeClick, onPostClick, onTogglePinPost }) => {
    const { t } = useLanguage();
    const noticePosts = useMemo(() => {
        return posts
            .filter(p => p.groupId === groupId && p.isNotice)
            .sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
    }, [posts, groupId]);

    return (
        <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-4 flex justify-between items-center border-b">
                <h3 className="font-bold text-lg">{t('notice')}</h3>
                {isAdmin && <button onClick={onNewNoticeClick} className="bg-blue-600 text-white font-semibold text-sm py-1.5 px-3 rounded-full hover:bg-blue-700 transition">+ {t('newNotice')}</button>}
            </div>
            {noticePosts.length > 0 ? (
                <div>
                    {noticePosts.map(post => <NoticeListItem key={post.id} post={post} onPostClick={onPostClick} usersMap={usersMap} isAdmin={isAdmin} onTogglePin={onTogglePinPost} />)}
                </div>
            ) : (
                <p className="text-center text-gray-500 p-8">{t('noNotices')}</p>
            )}
        </div>
    );
};
