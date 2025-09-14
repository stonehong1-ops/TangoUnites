import React from 'react';
import { Post, User, ReactionType, Comment, Venue } from '../types';
import PostCard from './PostCard';

interface PostDetailModalProps {
  post: Post;
  usersMap: Map<string, User>;
  venuesMap: Map<string, Venue>;
  currentUser: User | null;
  onClose: () => void;
  onReactToPost: (postId: string, reactionType: ReactionType) => void;
  onAddComment: (postId: string, commentText: string, parentCommentId?: string) => void;
  onRegisterClick: () => void;
  onReactToComment: (postId: string, commentId: string, reactionType: ReactionType) => void;
  onAuthorClick: (user: User) => void;
  onEditPost: (post: Post) => void;
  onOpenReactions: (post: Post) => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = (props) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={props.onClose}
    >
      <div 
        className="bg-gray-100 rounded-lg w-full max-w-md mx-auto transform transition-all max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={e => e.stopPropagation()}
      >
        <PostCard {...props} onHighlightEnd={() => {}} />
      </div>
    </div>
  );
};

export default PostDetailModal;