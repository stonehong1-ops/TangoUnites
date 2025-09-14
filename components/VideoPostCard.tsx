import React from 'react';
import { Post, User, Gender } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { MALE_AVATAR_URL, FEMALE_AVATAR_URL } from '../constants';
import PostCard from './PostCard'; // We can reuse the inner components if we export them

// This is a simplified version for now. We can expand it later.
interface VideoPostCardProps {
    post: Post;
    usersMap: Map<string, User>;
    currentUser: User | null;
    onAuthorClick: (user: User) => void;
    // We can add reaction/comment props later if needed
}

const VideoPostCard: React.FC<VideoPostCardProps> = ({ post, usersMap, currentUser, onAuthorClick }) => {
    const { t } = useLanguage();
    const author = usersMap.get(post.authorId);

    const getYouTubeEmbedUrl = (url: string) => {
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

    const embedUrl = post.videoUrl && !post.videoUrl.startsWith('data:video') ? getYouTubeEmbedUrl(post.videoUrl) : null;
    const isUploadedVideo = post.videoUrl && post.videoUrl.startsWith('data:video');

    if (!author || (!embedUrl && !isUploadedVideo)) return null;

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="aspect-video bg-black">
                {embedUrl && (
                    <iframe src={embedUrl} title={post.id} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>
                )}
                {isUploadedVideo && (
                    <video src={post.videoUrl} controls className="w-full h-full"></video>
                )}
            </div>
            <div className="p-4">
                <button onClick={() => onAuthorClick(author)} className="flex items-center gap-3 group mb-2">
                    <img src={author.photoUrl || (author.gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL)} alt={author.nickname} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                        <p className="font-semibold text-gray-900 group-hover:underline">{author.nickname}</p>
                        <p className="text-xs text-gray-500">{author.nativeNickname}</p>
                    </div>
                </button>
                <p className="text-gray-800 whitespace-pre-wrap break-words">{post.content}</p>
                 {/* Reaction and comment controls can be added here, similar to PostCard */}
            </div>
        </div>
    );
};

export default VideoPostCard;