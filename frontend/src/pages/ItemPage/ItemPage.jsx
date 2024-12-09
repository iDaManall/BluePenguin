import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../utils/client';
import './ItemPage.css';
import Comment from '../../components/Comment/Comment';
import { useAuth } from '../../context/AuthContext';
import { itemService } from '../../api/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { checkPermissions } from '../../utils/permissions';

const ItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const { user, profile } = useAuth();  // Add profile to the destructuring
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    console.log('Auth State:', { user, profile });
  }, [user, profile]);

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

  useEffect(() => {
    const checkIfSaved = async () => {
      if (!user || !profile || !item) return;
      
      try {
        const { data, error } = await supabase
          .from('api_save')
          .select('id')
          .eq('profile_id', profile.id)
          .eq('item_id', item.id)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        setIsSaved(!!data);
      } catch (err) {
        console.error('Error checking saved status:', err);
      }
    };

    checkIfSaved();
  }, [user, profile, item]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    try {
      if (!user || !profile) {
        setError('Please log in to post a comment');
        navigate('/login');
        return;
      }

      // Use the profile ID directly from the auth context
      const { data: commentData, error } = await supabase
        .from('api_comment')
        .insert([
          {
            item_id: id,
            profile_id: profile.id,
            text: newComment,
            date_of_comment: new Date().toISOString(),
            time_of_comment: new Date().toLocaleTimeString(),
            dislikes: 0,  // Add default value for dislikes
            likes: 0      // Add default value for likes
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

      setComments(prevComments => [commentData, ...prevComments]);
      setNewComment('');
    } catch (err) {
      console.error('Error posting comment:', err);
      setError(err.message || 'Failed to post comment');
    }
  };

  const handleThumbnailClick = (index) => {
    setSelectedImage(index);
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setBidError('');
    
    try {
      if (!user || !profile) {
        setBidError('Please log in to place a bid');
        navigate('/login');
        return;
      }

      const numericBid = parseFloat(bidAmount);
      
      // Validate bid amount
      if (isNaN(numericBid) || numericBid <= 0) {
        setBidError('Please enter a valid bid amount');
        return;
      }
      
      if (numericBid <= item.highest_bid) {
        setBidError('Bid must be higher than current highest bid');
        return;
      }

      if (numericBid < item.minimum_bid) {
        setBidError(`Bid must be at least $${item.minimum_bid}`);
        return;
      }

      if (numericBid > item.maximum_bid) {
        setBidError(`Bid cannot exceed $${item.maximum_bid}`);
        return;
      }

      // Insert new bid into Supabase with status
      const { data: bidData, error: bidError } = await supabase
        .from('api_bid')
        .insert([{
          profile_id: profile.id,
          item_id: item.id,
          bid_price: numericBid,
          time_of_bid: new Date().toISOString(),
          status: 'ACT',  // Active bid
          winner_status: 'I'  // Ineligible by default
        }])
        .select()
        .single();

      if (bidError) throw bidError;

      // Update item's highest bid
      const { error: updateError } = await supabase
        .from('api_item')
        .update({ 
          highest_bid: numericBid,
          total_bids: item.total_bids + 1
        })
        .eq('id', item.id);

      if (updateError) throw updateError;

      // Update local state
      setItem(prev => ({
        ...prev,
        highest_bid: numericBid,
        total_bids: prev.total_bids + 1
      }));

      setBidAmount('');
      // Show success message or notification
      toast.success('Bid placed successfully!');
      
    } catch (error) {
      console.error('Error placing bid:', error);
      setBidError(error.message || 'Failed to place bid');
    }
  };

  const handleSaveItem = async () => {
    try {
      // Wait for auth state to be properly loaded
      if (!user || !profile) {
        console.log('Auth state not ready:', { user, profile });
        return;
      }

      // Check if item exists in api_save
      const { data: existingSave, error: checkError } = await supabase
        .from('api_save')
        .select('id')
        .eq('profile_id', profile.id)
        .eq('item_id', item.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking saved item:', checkError);
        throw checkError;
      }

      if (existingSave) {
        const { error: deleteError } = await supabase
          .from('api_save')
          .delete()
          .eq('id', existingSave.id);

        if (deleteError) throw deleteError;
        setIsSaved(false);
        toast.success('Item removed from saved items');
      } else {
        const { error: saveError } = await supabase
          .from('api_save')
          .insert({
            profile_id: profile.id,
            item_id: item.id,
            time_saved: new Date().toISOString()
          });

        if (saveError) {
          console.error('Save error:', saveError);
          throw saveError;
        }
        setIsSaved(true);
        toast.success('Item saved successfully');
      }
    } catch (err) {
      console.error('Error saving item:', err);
      toast.error(err.message || 'Failed to save item');
    }
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
          <div className="item-header">
            <div className="title-section">
              <h1>{item.title}</h1>
              <button 
                className={`save-button ${isSaved ? 'saved' : ''}`}
                onClick={handleSaveItem}
              >
                {isSaved ? '★ Saved' : '☆ Save'}
              </button>
            </div>
          </div>
          
          <div className="seller-info">
            <span>
              Seller:{' '}
              <Link to={`/profile/${item.profile?.account?.user?.id}`} className="seller-link">
                {item.profile?.account?.user?.username}
              </Link>
            </span>
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
            <form onSubmit={handleBidSubmit}>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Enter bid amount"
                step="0.01"
                min={item.highest_bid + 0.01}
                required
              />
              <button type="submit" className="place-bid-btn">
                Place Bid
              </button>
            </form>
            {bidError && <div className="error-message">{bidError}</div>}
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