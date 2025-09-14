import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Post, User, Comment, Gender, UserRole, ReactionType, Reaction, Venue, PostCategory } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { ThumbsUpIcon, ChatBubbleOvalLeftIcon, EditIcon, HeartIcon, PaperClipIcon } from './icons';
import { HahaIcon, WowIcon, SadIcon, AngryIcon } from './ReactionIcons';
import { MALE_AVATAR_URL, FEMALE_AVATAR_URL, COUNTRIES } from '../constants';

interface PostCardProps {
  post: Post;
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
  historyContext?: {
    type: 'post' | 'reaction' | 'comment';
    timestamp: string;
    comment?: Comment;
    reaction?: Reaction;
  };
  highlightedPostId?: string | null;
  onHighlightEnd?: () => void;
  onToggleForSaleStatus?: (postId: string) => void;
}

const timeAgo = (date: Date, t: (key: string) => string) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return t('momentsAgo');
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ` ${t('yearsAgo')}`;
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ` ${t('monthsAgo')}`;
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ` ${t('daysAgo')}`;
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ` ${t('hoursAgo')}`;
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ` ${t('minutesAgo')}`;
    return t('momentsAgo');
};

const ImageGallery: React.FC<{ images: string[], onImageClick: (index: number) => void }> = ({ images, onImageClick }) => {
    if (!images || images.length === 0) return null;
    const count = images.length;
    
    const renderImage = (src: string, index: number, extra_classes: string = "") => (
      <div key={index} className={`relative ${extra_classes}`} onClick={() => onImageClick(index)}>
        <img src={src} alt="" className="w-full h-full object-cover cursor-pointer" />
      </div>
    );
    
    if (count === 1) return <div className="aspect-video">{renderImage(images[0], 0)}</div>;
    if (count === 2) return <div className="grid grid-cols-2 gap-1 aspect-video">{renderImage(images[0], 0)}{renderImage(images[1], 1)}</div>;
    if (count === 3) return <div className="grid grid-cols-2 grid-rows-1 gap-1 aspect-video">{renderImage(images[0], 0)}<div className="grid grid-rows-2 gap-1">{renderImage(images[1], 1)}{renderImage(images[2], 2)}</div></div>;
    if (count === 4) return <div className="grid grid-cols-2 grid-rows-2 gap-1 aspect-video">{renderImage(images[0], 0)}{renderImage(images[1], 1)}{renderImage(images[2], 2)}{renderImage(images[3], 3)}</div>;
    if (count > 4) return <div className="grid grid-cols-2 grid-rows-2 gap-1 aspect-video">{renderImage(images[0], 0)}{renderImage(images[1], 1)}{renderImage(images[2], 2)}<div className="relative" onClick={() => onImageClick(3)}><img src={images[3]} alt="" className="w-full h-full object-cover cursor-pointer" /><div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-3xl font-bold">+{count - 4}</div></div></div>;
    return null;
}

const ReactionIcon: React.FC<{ type: ReactionType; className?: string }> = ({ type, className = 'w-5 h-5' }) => {
    switch(type) {
        case ReactionType.Like: return <div className="bg-blue-500 p-0.5 rounded-full"><ThumbsUpIcon className={`${className} text-white`} isFilled /></div>
        case ReactionType.Love: return <HeartIcon className={`${className} text-red-500`} isFilled />
        case ReactionType.Haha: return <HahaIcon className={className} />
        case ReactionType.Wow: return <WowIcon className={className} />
        case ReactionType.Sad: return <SadIcon className={className} />
        case ReactionType.Angry: return <AngryIcon className={className} />
        default: return null;
    }
};

const HistoryContextBlock: React.FC<{ context: PostCardProps['historyContext'] }> = ({ context }) => {
    const { t } = useLanguage();
    if (!context) return null;

    const time = timeAgo(new Date(context.timestamp), t);
    let message: React.ReactNode;
    let content: React.ReactNode | null = null;

    switch (context.type) {
        case 'comment':
            message = t('youCommented');
            content = <p className="text-gray-700 italic mt-1 pl-2 border-l-2 border-gray-300">"{context.comment?.content}"</p>;
            break;
        case 'reaction':
            message = <span>{t('youReacted')}</span>;
            break;
        case 'post':
            message = t('youPosted');
            break;
        default:
            return null;
    }

    return (
        <div className="mt-3 mb-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
            <p><span className="font-semibold">{message}</span> ({time})</p>
            {content}
        </div>
    );
};

export const CommentView: React.FC<{
    comment: Comment;
    postId: string;
    usersMap: Map<string, User>;
    currentUser: User | null;
    onAddComment: (postId: string, commentText: string, parentCommentId?: string) => void;
    onReactToComment: (postId: string, commentId: string, reactionType: ReactionType) => void;
    onAuthorClick: (user: User) => void;
    depth: number;
    isAnonymous: boolean;
}> = ({ comment, postId, usersMap, currentUser, onAddComment, onReactToComment, onAuthorClick, depth, isAnonymous }) => {
    const { t } = useLanguage();
    const author = usersMap.get(comment.authorId);
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [pickerVisible, setPickerVisible] = useState(false);
    const pickerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showPicker = () => {
        if(pickerTimer.current) clearTimeout(pickerTimer.current);
        setPickerVisible(true);
    };

    const hidePicker = () => {
        pickerTimer.current = setTimeout(() => setPickerVisible(false), 300);
    };

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (replyText.trim()) {
            onAddComment(postId, replyText, comment.id);
            setReplyText('');
            setIsReplying(false);
        }
    };

    if (!author) return null;
    
    const authorToDisplay = isAnonymous ? { ...author, nickname: t('anonymous'), nativeNickname: '', photoUrl: author.gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL } : author;

    const handleAuthorClick = () => {
        if (!isAnonymous) {
            onAuthorClick(author);
        }
    }

    const AuthorAvatar: React.FC<{user: User, size?: string}> = ({user, size = 'w-8 h-8'}) => {
        const photoUrl = isAnonymous ? (user.gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL) : user.photoUrl;
        return <img src={photoUrl} alt={user.nickname} className={`${size} rounded-full object-cover transition-opacity group-hover:opacity-80`} />;
    };

    const currentUserReaction = currentUser ? comment.reactions.find(r => r.userId === currentUser.id) : null;

    return (
        <div className="flex items-start gap-3">
            <button onClick={handleAuthorClick} className={`flex-shrink-0 rounded-full group mt-1 ${isAnonymous ? 'cursor-default' : ''}`}>
                <AuthorAvatar user={authorToDisplay} size="w-8 h-8" />
            </button>
            <div className="flex-grow">
                <div className="relative">
                    <div className="bg-gray-100 rounded-lg p-2 px-3 inline-block">
                        <button onClick={handleAuthorClick} disabled={isAnonymous} className={`font-bold text-sm text-gray-900 text-left ${isAnonymous ? '' : 'hover:underline'} flex items-baseline gap-1.5`}>
                            <span>{authorToDisplay.nickname}</span>
                             {!isAnonymous && <span className={`text-xs font-normal ${author.gender === Gender.Tanguera ? 'text-red-500' : 'text-blue-500'}`}>
                                {authorToDisplay.nativeNickname}
                            </span>}
                        </button>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{comment.content}</p>
                    </div>
                    {comment.reactions.length > 0 && (
                         <div className="absolute -bottom-3 right-0 bg-white px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                            {/* For simplicity, only showing one icon and count */}
                            <ReactionIcon type={comment.reactions[0].type} className="w-3 h-3" />
                            <span className="text-xs font-semibold text-gray-600">{comment.reactions.length}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 pl-1">
                    <div className="relative" onMouseEnter={showPicker} onMouseLeave={hidePicker}>
                        <button 
                            onClick={() => onReactToComment(postId, comment.id, ReactionType.Like)}
                            className={`font-semibold ${currentUserReaction ? 'text-blue-600' : 'hover:underline'}`}
                        >
                            {currentUserReaction ? t(currentUserReaction.type) : t('like')}
                        </button>
                         {pickerVisible && (
                            <div onMouseEnter={showPicker} onMouseLeave={hidePicker} className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-full flex items-center p-1 gap-1 border border-gray-200">
                                {Object.values(ReactionType).map(type => (
                                    <button key={type} onClick={() => { onReactToComment(postId, comment.id, type); setPickerVisible(false); }} className="p-1 rounded-full transition-transform transform hover:scale-125">
                                        <ReactionIcon type={type} className="w-5 h-5" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={() => setIsReplying(!isReplying)} className="font-semibold hover:underline">{t('comment')}</button>
                    <span>{timeAgo(new Date(comment.createdAt), t)}</span>
                </div>

                {isReplying && currentUser && (
                    <form onSubmit={handleReplySubmit} className="flex items-start gap-3 mt-2">
                        <AuthorAvatar user={currentUser} size="w-8 h-8"/>
                        <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={t('writeAComment')}
                            className="w-full bg-gray-100 text-gray-800 text-sm rounded-full py-2 px-4 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-500"
                            autoFocus
                       />
                    </form>
                )}

                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 space-y-3">
                        {comment.replies.map(reply => (
                            <CommentView
                                key={reply.id}
                                comment={reply}
                                postId={postId}
                                usersMap={usersMap}
                                currentUser={currentUser}
                                onAddComment={onAddComment}
                                onReactToComment={onReactToComment}
                                onAuthorClick={onAuthorClick}
                                depth={depth + 1}
                                isAnonymous={isAnonymous}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);

const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    let videoId = null;
    const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            videoId = match[1];
            break;
        }
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

const PostCard: React.FC<PostCardProps> = ({ post, usersMap, venuesMap, currentUser, onReactToPost, onAddComment, onRegisterClick, onAuthorClick, onEditPost, onOpenReactions, historyContext, onReactToComment, highlightedPostId, onHighlightEnd = () => {}, onToggleForSaleStatus }) => {
    const { t } = useLanguage();
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [pickerVisible, setPickerVisible] = useState(false);
    const pickerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [fullscreenState, setFullscreenState] = useState<{ images: string[], currentIndex: number } | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    const isAnonymous = post.category === PostCategory.Attitude;

    useEffect(() => {
        if (post.id === highlightedPostId && cardRef.current) {
            cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            cardRef.current.classList.add('highlight-post');
            const timer = setTimeout(() => {
                cardRef.current?.classList.remove('highlight-post');
                onHighlightEnd();
            }, 3000); // Highlight for 3 seconds
            return () => clearTimeout(timer);
        }
    }, [highlightedPostId, post.id, onHighlightEnd]);


    const author = usersMap.get(post.authorId);
    const currentUserReaction = useMemo(() => currentUser && post.reactions.find(r => r.userId === currentUser.id), [post.reactions, currentUser]);

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (commentText.trim()) {
            onAddComment(post.id, commentText, undefined);
            setCommentText('');
        }
    };
    
    const handleInteraction = (action: 'comment' | ReactionType) => {
        if (!currentUser) {
            onRegisterClick();
            return;
        }
        if (action === 'comment') {
            setShowComments(!showComments);
        } else {
            onReactToPost(post.id, action);
        }
    }

    const reactionSummary = useMemo(() => {
        if (post.reactions.length === 0) return null;

        const counts = post.reactions.reduce((acc, reaction) => {
            acc[reaction.type] = (acc[reaction.type] || 0) + 1;
            return acc;
        }, {} as Record<ReactionType, number>);

        const sortedReactions = Object.entries(counts)
            .sort(([, countA], [, countB]) => countB - countA)
            .map(([type]) => type as ReactionType);

        return {
            topReactions: sortedReactions.slice(0, 3),
            total: post.reactions.length,
        };
    }, [post.reactions]);
    
    const showPicker = () => {
        if(pickerTimer.current) clearTimeout(pickerTimer.current);
        setPickerVisible(true);
    };

    const hidePicker = () => {
        pickerTimer.current = setTimeout(() => setPickerVisible(false), 300);
    };

    const youtubeEmbedUrl = useMemo(() => {
        if (post.category === PostCategory.Youtube || post.category === PostCategory.TangoMusic) {
            return post.linkUrls?.[0] ? getYouTubeEmbedUrl(post.linkUrls[0]) : null;
        }
        if (post.category === PostCategory.Video && post.videoUrl && !post.videoUrl.startsWith('data:video')) {
            return getYouTubeEmbedUrl(post.videoUrl);
        }
        return null;
    }, [post.category, post.linkUrls, post.videoUrl]);

    const isUploadedVideo = post.videoUrl && post.videoUrl.startsWith('data:video');

    if (!author) return null;
    
    const authorToDisplay = isAnonymous ? { ...author, nickname: t('anonymous'), nativeNickname: '', photoUrl: author.gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL } : author;

    const handleAuthorClick = () => {
        if (!isAnonymous) {
            onAuthorClick(author);
        }
    }

    const canEdit = currentUser && (currentUser.roles.includes(UserRole.Admin) || post.authorId === currentUser.id);
    const country = COUNTRIES.find(c => c.code === author.countryCode);

    const AuthorAvatar: React.FC<{user: User, size?: string}> = ({user, size = 'w-12 h-12'}) => {
        const photoUrl = isAnonymous ? (user.gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL) : user.photoUrl;
        return <img src={photoUrl} alt={user.nickname} className={`${size} rounded-full object-cover transition-opacity group-hover:opacity-80`} />
    }
    
    const reactionButtonColors: Record<ReactionType, string> = {
        [ReactionType.Like]: 'text-blue-600',
        [ReactionType.Love]: 'text-red-500',
        [ReactionType.Haha]: 'text-yellow-500',
        [ReactionType.Wow]: 'text-yellow-500',
        [ReactionType.Sad]: 'text-yellow-500',
        [ReactionType.Angry]: 'text-orange-600',
    };

    const taggedUsers = post.taggedUserIds?.map(id => usersMap.get(id)).filter((u): u is User => !!u) || [];
    const taggedVenue = post.taggedVenueId ? venuesMap.get(post.taggedVenueId) : null;

    return (
      <div ref={cardRef} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        
        <div className="p-4">
          <div className="flex items-center justify-between">
              <button onClick={handleAuthorClick} disabled={isAnonymous} className={`flex items-center gap-3 group ${isAnonymous ? 'cursor-default' : ''}`}>
                  <AuthorAvatar user={authorToDisplay} />
                  <div className="flex flex-col items-start">
                      <div className={`font-semibold text-gray-900 ${!isAnonymous && 'group-hover:underline'} flex items-baseline gap-1.5 flex-wrap`}>
                          <span>{authorToDisplay.nickname}</span>
                           {!isAnonymous && (
                            <>
                                <span className={`text-sm font-normal ${author.gender === Gender.Tanguera ? 'text-red-500' : 'text-blue-500'}`}>
                                    {authorToDisplay.nativeNickname}
                                </span>
                                {country && (
                                        <span className="text-sm text-gray-400 font-medium">{country.flag}</span>
                                )}
                            </>
                           )}
                          {(!isAnonymous && (taggedUsers.length > 0 || taggedVenue)) && (
                            <span className="font-normal text-gray-500 text-sm">
                                {taggedUsers.length > 0 && `- ${t('with')} `}
                                {taggedUsers.map((u, i) => <strong key={u.id} className="font-semibold">{u.nickname}{i < taggedUsers.length - 1 ? ', ' : ''}</strong>)}
                                {taggedVenue && ` - ${t('at')} `}
                                {taggedVenue && <strong className="font-semibold">{taggedVenue.name}</strong>}
                            </span>
                          )}
                      </div>
                      <p className="text-xs text-gray-500 text-left">{timeAgo(new Date(post.createdAt), t)}</p>
                  </div>
              </button>
              {canEdit && (
                  <button onClick={() => onEditPost(post)} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                      <EditIcon className="w-5 h-5" />
                  </button>
              )}
          </div>
          {historyContext && <HistoryContextBlock context={historyContext} />}
          {post.isNotice && post.title && <h2 className="text-xl font-bold my-3">{post.title}</h2>}
          <p className="my-3 text-gray-800 whitespace-pre-wrap break-words">{post.content}</p>
          {post.category === PostCategory.CarrotMarket && (
            <div className="flex justify-between items-center mt-2 p-2 bg-gray-50 rounded-lg">
                <span className={`px-4 py-2 text-lg font-bold rounded-lg ${post.forSaleStatus === 'forSale' ? 'bg-green-200 text-green-800' : 'bg-pink-200 text-pink-700'}`}>
                    {t(post.forSaleStatus || 'forSale')}
                </span>
                {currentUser && currentUser.id === post.authorId && onToggleForSaleStatus && (
                    <button onClick={() => onToggleForSaleStatus(post.id)} className="text-sm font-semibold text-blue-600 hover:underline">
                        {t('toggleSaleStatus')}
                    </button>
                )}
            </div>
          )}
          {post.linkUrls && post.linkUrls.length > 0 && !youtubeEmbedUrl && (
            <div className="mt-3 space-y-2">
                {post.linkUrls.map((link, index) => (
                    <a href={link} target="_blank" rel="noopener noreferrer" key={index} className="block bg-gray-50 hover:bg-gray-100 p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                            <PaperClipIcon className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-blue-600 font-medium truncate">{link}</span>
                        </div>
                    </a>
                ))}
            </div>
          )}
        </div>
  
        {youtubeEmbedUrl && (
            <div className="aspect-video bg-black">
                <iframe src={youtubeEmbedUrl} title={post.id} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>
            </div>
        )}
        {isUploadedVideo && (
             <div className="aspect-video bg-black">
                <video src={post.videoUrl} controls className="w-full h-full"></video>
            </div>
        )}
        {!youtubeEmbedUrl && !isUploadedVideo && post.imageUrls && post.imageUrls.length > 0 && (
            <ImageGallery images={post.imageUrls} onImageClick={(index) => setFullscreenState({ images: post.imageUrls || [], currentIndex: index })} />
        )}
  
        <div className="p-4">
          {(reactionSummary || post.comments.length > 0) && (
              <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                  {reactionSummary ? (
                      <button onClick={() => onOpenReactions(post)} className="flex items-center gap-1 hover:underline">
                          {reactionSummary.topReactions.map(type => <ReactionIcon key={type} type={type} className="w-4 h-4" />)}
                          <span>{reactionSummary.total}</span>
                      </button>
                  ) : <div />}
                  {post.comments.length > 0 && <button onClick={() => setShowComments(s => !s)} className="hover:underline">{post.comments.length} {t('comments')}</button>}
              </div>
          )}
  
          <div className="border-t border-b border-gray-200 my-2 flex">
              <div className="relative flex-1" onMouseEnter={showPicker} onMouseLeave={hidePicker}>
                  <button onClick={() => handleInteraction(ReactionType.Like)} className={`w-full flex items-center justify-center gap-2 py-2 font-semibold transition-colors ${currentUserReaction ? reactionButtonColors[currentUserReaction.type] : 'text-gray-600 hover:bg-gray-100'}`}>
                      {currentUserReaction ? <ReactionIcon type={currentUserReaction.type} className="w-5 h-5" /> : <ThumbsUpIcon className="w-5 h-5" />}
                      <span>{currentUserReaction ? t(currentUserReaction.type) : t('like')}</span>
                  </button>
                  {pickerVisible && (
                      <div onMouseEnter={showPicker} onMouseLeave={hidePicker} className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-full flex items-center p-1 gap-1 border border-gray-200">
                          {Object.values(ReactionType).map(type => (
                              <button key={type} onClick={() => { handleInteraction(type); setPickerVisible(false); }} className="p-1 rounded-full transition-transform transform hover:scale-125">
                                  <ReactionIcon type={type} className="w-5 h-5" />
                              </button>
                          ))}
                      </div>
                  )}
              </div>
              <button onClick={() => handleInteraction('comment')} className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 font-semibold hover:bg-gray-100 transition-colors">
                  <ChatBubbleOvalLeftIcon className="w-5 h-5" />
                  <span>{t('comment')}</span>
              </button>
          </div>
  
          {showComments && (
              <div className="pt-4 space-y-4">
                  {post.comments.map(comment => (
                      <CommentView key={comment.id} comment={comment} postId={post.id} usersMap={usersMap} currentUser={currentUser} onAddComment={onAddComment} onReactToComment={onReactToComment} onAuthorClick={onAuthorClick} depth={0} isAnonymous={isAnonymous} />
                  ))}
                  {currentUser && (
                      <form onSubmit={handleCommentSubmit} className="flex items-start gap-3">
                          <AuthorAvatar user={currentUser} size="w-8 h-8"/>
                          <input
                              type="text"
                              value={commentText}
                              onChange={e => setCommentText(e.target.value)}
                              placeholder={t('writeAComment')}
                              className="w-full bg-gray-100 text-gray-800 text-sm rounded-full py-2 px-4 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-500"
                          />
                      </form>
                  )}
              </div>
          )}
        </div>
        {fullscreenState && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-[100]" onClick={() => setFullscreenState(null)}>
              <img src={fullscreenState.images[fullscreenState.currentIndex]} alt="Fullscreen" className="max-w-full max-h-full object-contain" />
              {fullscreenState.images.length > 1 && (
                  <>
                      <button 
                          onClick={(e) => { e.stopPropagation(); setFullscreenState(s => s && { ...s, currentIndex: (s.currentIndex - 1 + s.images.length) % s.images.length }); }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/80 transition-colors z-[101]"
                      >
                          <ChevronLeftIcon className="w-8 h-8"/>
                      </button>
                      <button
                          onClick={(e) => { e.stopPropagation(); setFullscreenState(s => s && { ...s, currentIndex: (s.currentIndex + 1) % s.images.length }); }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/80 transition-colors z-[101]"
                      >
                          <ChevronRightIcon className="w-8 h-8"/>
                      </button>
                  </>
              )}
              <button onClick={() => setFullscreenState(null)} className="absolute top-4 right-4 bg-black/50 rounded-full p-2 text-white hover:bg-black/80">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
          </div>
        )}
      </div>
    );
};

export default PostCard;