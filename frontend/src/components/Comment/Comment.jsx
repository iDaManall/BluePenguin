import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/client';
import { useAuth } from '../../context/AuthContext';
import './Comment.css';

const Comment = ({ comment }) => {
  const [likes, setLikes] = useState(comment.likes || 0);
  const [dislikes, setDislikes] = useState(comment.dislikes || 0);
  const [userLiked, setUserLiked] = useState(false);
  const [userDisliked, setUserDisliked] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (profile) {
      checkUserInteraction();
    }
  }, [profile, comment.id]);

  const checkUserInteraction = async () => {
    if (!profile) return;

    try {
      // Check if user has liked
      const { data: likeData, error: likeError } = await supabase
        .from('api_like')
        .select('id')
        .eq('profile_id', profile.id)
        .eq('comment_id', comment.id);

      if (likeError) throw likeError;

      // Check if user has disliked
      const { data: dislikeData, error: dislikeError } = await supabase
        .from('api_dislike')
        .select('id')
        .eq('profile_id', profile.id)
        .eq('comment_id', comment.id);

      if (dislikeError) throw dislikeError;

      setUserLiked(likeData && likeData.length > 0);
      setUserDisliked(dislikeData && dislikeData.length > 0);

      // Get total counts
      const { count: likesCount } = await supabase
        .from('api_like')
        .select('id', { count: 'exact' })
        .eq('comment_id', comment.id);

      const { count: dislikesCount } = await supabase
        .from('api_dislike')
        .select('id', { count: 'exact' })
        .eq('comment_id', comment.id);

      setLikes(likesCount || 0);
      setDislikes(dislikesCount || 0);

    } catch (error) {
      console.error('Error checking interactions:', error);
    }
  };

  const handleLike = async () => {
    if (!user || !profile) return;

    try {
      if (userDisliked) {
        // Remove dislike first
        const { error: removeDislikeError } = await supabase
          .from('api_dislike')
          .delete()
          .eq('profile_id', profile.id)
          .eq('comment_id', comment.id);

        if (removeDislikeError) throw removeDislikeError;
        setDislikes(prev => Math.max(0, prev - 1));
        setUserDisliked(false);
      }

      if (userLiked) {
        // Remove like
        const { error: removeLikeError } = await supabase
          .from('api_like')
          .delete()
          .eq('profile_id', profile.id)
          .eq('comment_id', comment.id);

        if (removeLikeError) throw removeLikeError;
        setLikes(prev => Math.max(0, prev - 1));
        setUserLiked(false);
      } else {
        // Add like
        const { error: addLikeError } = await supabase
          .from('api_like')
          .insert([{
            profile_id: profile.id,
            comment_id: comment.id
          }]);

        if (addLikeError) throw addLikeError;
        setLikes(prev => prev + 1);
        setUserLiked(true);
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleDislike = async () => {
    if (!user || !profile) return;

    try {
      if (userLiked) {
        // Remove like first
        const { error: removeLikeError } = await supabase
          .from('api_like')
          .delete()
          .eq('profile_id', profile.id)
          .eq('comment_id', comment.id);

        if (removeLikeError) throw removeLikeError;
        setLikes(prev => Math.max(0, prev - 1));
        setUserLiked(false);
      }

      if (userDisliked) {
        // Remove dislike
        const { error: removeDislikeError } = await supabase
          .from('api_dislike')
          .delete()
          .eq('profile_id', profile.id)
          .eq('comment_id', comment.id);

        if (removeDislikeError) throw removeDislikeError;
        setDislikes(prev => Math.max(0, prev - 1));
        setUserDisliked(false);
      } else {
        // Add dislike
        const { error: addDislikeError } = await supabase
          .from('api_dislike')
          .insert([{
            profile_id: profile.id,
            comment_id: comment.id
          }]);

        if (addDislikeError) throw addDislikeError;
        setDislikes(prev => prev + 1);
        setUserDisliked(true);
      }
    } catch (error) {
      console.error('Error handling dislike:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="comment">
      <div className="comment-header">
        <div className="comment-user">
          <img 
            src={comment.api_profile?.display_icon || '/default-avatar.png'} 
            alt={comment.api_profile?.account?.user?.username} 
            className="user-avatar"
          />
          <span className="username">
            {comment.api_profile?.account?.user?.username || 'Anonymous'}
          </span>
        </div>
        <span className="comment-date">
          {formatDate(comment.date_of_comment)}
        </span>
      </div>
      <div className="comment-content">
        {comment.text}
      </div>
      <div className="comment-actions">
        <button 
          className={`like-btn ${userLiked ? 'active' : ''}`}
          onClick={handleLike}
          disabled={!user}
        >
          👍 {likes}
        </button>
        <button 
          className={`dislike-btn ${userDisliked ? 'active' : ''}`}
          onClick={handleDislike}
          disabled={!user}
        >
          👎 {dislikes}
        </button>
      </div>
    </div>
  );
};

export default Comment;