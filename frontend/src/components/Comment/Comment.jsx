import React from 'react';
import './Comment.css';

const Comment = ({ comment }) => {
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
        <button className="like-btn">
          👍 {comment.likes_count || 0}
        </button>
        <button className="dislike-btn">
          👎 {comment.dislikes_count || 0}
        </button>
      </div>
    </div>
  );
};

export default Comment;