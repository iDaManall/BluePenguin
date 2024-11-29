import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itemService } from '../../api/api';
import { supabase } from '../../utils/client';
import './ItemPage.css';

const ItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Mock user for now - replace with actual auth
  const currentUser = {
    id: 1,
    balance: 1000
  };

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        // Use Supabase to fetch item with owner profile
        const { data: itemData, error: itemError } = await supabase
          .from('api_item')
          .select(`
            *,
            api_profile:profile_id (*)
          `)
          .eq('id', id)
          .single();

        if (itemError) throw itemError;
        
        setItem(itemData);
        setOwner(itemData.api_profile);
      } catch (err) {
        setError('Failed to load item details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [id]);

  const isOwner = owner?.account_id === currentUser.id;

  const handleBid = async () => {
    try {
      await itemService.placeBid(id, {
        bid_price: parseFloat(bidAmount)
      });
      // Refresh item data after bid
      const updatedItem = await itemService.getItem(id);
      setItem(updatedItem);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteItem = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await itemService.deleteItem(id);
        navigate('/');
      } catch (err) {
        setError('Failed to delete item');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!item) return <div className="error">Item not found</div>;

  return (
    <div className="item-page">
      <div className="item-gallery">
        <div className="main-image">
          <img 
            src={item.image_urls[currentImageIndex]} 
            alt={item.title} 
          />
        </div>
        <div className="thumbnail-strip">
          {item.image_urls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Thumbnail ${index + 1}`}
              onClick={() => setCurrentImageIndex(index)}
              className={currentImageIndex === index ? 'active' : ''}
            />
          ))}
        </div>
      </div>

      <div className="item-details">
        <div className="item-header">
          <h1>{item.title}</h1>
          <div className="owner-info">
            <span>Seller: {owner?.username}</span>
            <span>Rating: {owner?.rating || 'N/A'}</span>
          </div>
          {isOwner && (
            <button className="menu-dots" onClick={handleDeleteItem}>
              ⋮
            </button>
          )}
        </div>

        <div className="price-section">
          <div className="current-price">
            <h2>Current Bid</h2>
            <p>${item.highest_bid}</p>
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

        {!isOwner && (
          <div className="bidding-section">
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder="Enter bid amount"
              min={item.highest_bid + 1}
            />
            <button 
              onClick={handleBid}
              disabled={!bidAmount || parseFloat(bidAmount) <= item.highest_bid}
            >
              Place Bid
            </button>
          </div>
        )}

        {isOwner && (
          <button className="complete-bid" onClick={handleCompleteBid}>
            Complete Bid
          </button>
        )}

        <div className="comments-section">
          <h2>Comments</h2>
          {/* Add comments component here */}
        </div>
      </div>
    </div>
  );
};

export default ItemPage;