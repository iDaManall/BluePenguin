import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/client';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './PendingBids.css';
const PendingBids = () => {
  const [pendingBids, setPendingBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingBids = async () => {
      try {
        if (!profile) return;

        const { data, error } = await supabase
          .from('api_bid')
          .select(`
            *,
            item:item_id (
              *,
              profile:profile_id (
                *,
                account:account_id (
                  user:user_id (
                    username
                  )
                )
              )
            )
          `)
          .eq('profile_id', profile.id)
          .eq('status', 'ACT')
          .order('time_of_bid', { ascending: false });

        if (error) throw error;

        // Group bids by item and keep only the highest bid for each item
        const uniqueItemBids = data.reduce((acc, bid) => {
          if (!acc[bid.item_id] || acc[bid.item_id].bid_price < bid.bid_price) {
            acc[bid.item_id] = bid;
          }
          return acc;
        }, {});

        setPendingBids(Object.values(uniqueItemBids));
      } catch (error) {
        console.error('Error fetching pending bids:', error);
        toast.error('Failed to load pending bids');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingBids();
  }, [profile]);

  if (loading) return <div>Loading pending bids...</div>;

  return (
    <div className="pending-bids">
      <h2>Pending Bids</h2>
      {pendingBids.length === 0 ? (
        <p>No pending bids</p>
      ) : (
        <div className="pending-bids-list">
          {pendingBids.map((bid) => (
            <div key={bid.id} className="bid-card">
              <img 
                src={bid.item.image_urls[0]} 
                alt={bid.item.title}
                onClick={() => navigate(`/items/${bid.item.id}`)}
              />
              <div className="bid-info">
                <h3>{bid.item.title}</h3>
                <p>Your Bid: ${bid.bid_price}</p>
                <p className={bid.bid_price < bid.item.highest_bid ? 'outbid' : ''}>
                  Current Highest: ${bid.item.highest_bid}
                </p>
                <p>Seller: {bid.item.profile.account.user.username}</p>
                <p>Bid placed: {new Date(bid.time_of_bid).toLocaleString()}</p>
                <p>Ends: {new Date(bid.item.deadline).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingBids; 