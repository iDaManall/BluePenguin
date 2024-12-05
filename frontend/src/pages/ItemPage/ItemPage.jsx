import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/client';
import './ItemPage.css';
import Comment from '../../components/Comment/Comment';
import { useAuth } from '../../context/AuthContext';
import { itemService } from '../../api/api';

const ItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchItemData = async () => {
      try {
        setLoading(true);
        // Fetch item data from Supabase
        const { data: itemData, error: itemError } = await supabase
          .from('api_item')
          .select(`
            *,
            profile:profile_id (
              *,
              average_rating,
              account:account_id (
                user:user_id (
                  username,
                  email
                )
              )
            )
          `)
          .eq('id', id)
          .single();

        if (itemError) throw itemError;
        if (!itemData) throw new Error('Item not found');

        setItem(itemData);
      } catch (err) {
        console.error('Error fetching item:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchItemData();
  }, [id]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data: comments, error } = await supabase
          .from('api_comment')
          .select(`
            *,
            api_profile:profile_id (
              *,
              account:account_id (
                user:user_id (
                  username
                )
              )
            )
          `)
          .eq('item_id', id)
          .order('date_of_comment', { ascending: false });

        if (error) throw error;
        setComments(comments);
      } catch (err) {
        console.error('Error fetching comments:', err);
      }
    };

    if (id) fetchComments();
  }, [id]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    try {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // User is not logged in
        setError('Please log in to post a comment');
        navigate('/login'); // Optional: redirect to login page
        return;
      }

      // Rest of your comment posting logic
      const { data: newComment, error } = await supabase
        .from('api_comment')
        .insert([
          {
            item_id: id,
            profile_id: user.id,
            text: newComment,
            date_of_comment: new Date().toISOString(),
            time_of_comment: new Date().toLocaleTimeString()
          }
        ])
        .select(`
          *,
          api_profile:profile_id (
            *,
            account:account_id (
              user:user_id (
                username
              )
            )
          )
        `)
        .single();

      if (error) throw error;

      setComments(prevComments => [newComment, ...prevComments]);
      setNewComment('');
    } catch (err) {
      console.error('Error posting comment:', err);
      setError(err.message || 'Failed to post comment');
    }
  };

  const handleThumbnailClick = (index) => {
    setSelectedImage(index);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!item) return <div>Item not found</div>;

  return (
    <div className="item-page">
      <div className="item-container">
        <div className="item-images">
          <div className="main-image">
            <img 
              src={item.image_urls?.[selectedImage] || '/default-item.png'} 
              alt={item.title} 
            />
          </div>
          <div className="thumbnail-images">
            {item.image_urls?.map((url, index) => (
              <img 
                key={index} 
                src={url} 
                alt={`${item.title} thumbnail ${index + 1}`}
                onClick={() => handleThumbnailClick(index)}
                className={selectedImage === index ? 'selected' : ''}
              />
            ))}
          </div>
        </div>

        <div className="item-details">
          <h1 className="item-title">{item.title}</h1>
          
          <div className="seller-info">
            <span>Seller: {item.profile?.account?.user?.username}</span>
            <span>Rating: {item.profile?.average_rating ? item.profile.average_rating.toFixed(1) : 'N/A'}</span>
          </div>


{/*this will have to be changed to relfect if bids being added */}
          <div className="bid-info">
            <div className="current-bid">
              <h2>Highest Bid</h2>
              <p>${item.highest_bid || 'No bids yet'}</p> 
            </div>
            <div className="time-remaining">
              <h2>Time Remaining</h2>
              <p>{new Date(item.deadline).toLocaleString()}</p>
            </div>
          </div>

          <div className="description">
            <h2>Description</h2>
            <p>{item.description}</p>
          </div>

          <div className="bid-action">
            <input type="number" placeholder="Enter bid amount" />
            <button className="place-bid-btn">Place Bid</button>
          </div>
        </div>
      </div>

      <div className="comments-section">
        <h2>Comments</h2>
        <form onSubmit={handleSubmitComment} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            required
          />
          <button type="submit">Post Comment</button>
        </form>
        <div className="comments-list">
          {comments.map(comment => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItemPage;