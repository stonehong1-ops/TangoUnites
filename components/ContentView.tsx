import React, { useState, useMemo } from 'react';
import { Post, User, Venue, ReactionType, PostCategory, Gender } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import PostCard from './PostCard';
import SwipeableTabView, { Tab } from './SwipeableTabView';
import { MALE_AVATAR_URL, FEMALE_AVATAR_URL } from '../constants';
import { SearchIcon } from './icons';

interface ContentViewProps {
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
}

const ContentView: React.FC<ContentViewProps> = (props) => {
    const { t } = useLanguage();
    const { posts, onOpenCreatePost, currentUser, ...rest } = props;
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<PostCategory>(PostCategory.Video);

    const contentCategories: { key: PostCategory; labelKey: string }[] = [
        { key: PostCategory.Video, labelKey: 'classVideos' },
        { key: PostCategory.Youtube, labelKey: 'youtubeRecommendations' },
        { key: PostCategory.TangoMusic, labelKey: 'tangoMusic' },
    ];

    const placeholderText = useMemo(() => {
        if (!currentUser) return '';
        switch (activeCategory) {
            case PostCategory.Video: return t('whatsOnYourMindVideo').replace('{user}', currentUser.nickname);
            case PostCategory.Youtube: return t('whatsOnYourMindYoutube');
            case PostCategory.TangoMusic: return t('whatsOnYourMindTangoMusic');
            default: return t('whatsOnYourMind').replace('{user}', currentUser.nickname || '');
        }
    }, [activeCategory, t, currentUser]);

    const tabs: Tab[] = contentCategories.map(({ key, labelKey }) => {
        const categoryPosts = useMemo(() => {
            let filtered = posts.filter(p => p.category === key);
            if (searchTerm) {
                const lowerSearchTerm = searchTerm.toLowerCase();
                filtered = filtered.filter(p => {
                    const contentMatch = p.content.toLowerCase().includes(lowerSearchTerm);
                    const author = props.usersMap.get(p.authorId);
                    const authorNameMatch = author ?
                        author.nickname.toLowerCase().includes(lowerSearchTerm) ||
                        author.nativeNickname.toLowerCase().includes(lowerSearchTerm) :
                        false;
                    return contentMatch || authorNameMatch;
                });
            }
            return filtered;
        }, [posts, key, searchTerm, props.usersMap]);

        return {
            id: key,
            label: t(labelKey),
            content: (
                <div className="space-y-4">
                    {categoryPosts.length > 0 ? (
                        categoryPosts.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                                currentUser={currentUser}
                                {...rest}
                            />
                        ))
                    ) : (
                        searchTerm ? <div className="text-center py-8 text-gray-500"><p>{t('noResultsForTerm').replace('{term}', searchTerm)}</p></div> : <div className="h-1"></div>
                    )}
                </div>
            )
        };
    });

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-3">
                <img
                    src={currentUser?.photoUrl || (currentUser?.gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL)}
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

            <SwipeableTabView
                tabs={tabs}
                onTabChange={(id) => setActiveCategory(id as PostCategory)}
            />
        </div>
    );
};

export default ContentView;
