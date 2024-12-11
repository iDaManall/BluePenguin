import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/client';
import { toast } from 'react-toastify';
import './Orders.css';
import { itemService } from '../../api/api';


const NextActions = ({ items }) => {
  const navigate = useNavigate();
  

  const handleAcceptWinner = async (item) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await itemService.chooseWinner(
        item.id, 
        { id: item.highestBid.id },
        token
      );

      if (response) {
        toast.success('Winner accepted! Transaction completed.');
        // Optionally refresh the data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error accepting winner:', error);
      toast.error('Failed to accept winner');
    }
  };

  const handleRejectWinner = async (item) => {
    try {
      const { error } = await supabase
        .from('api_bid')
        .update({ winner_status: 'R' })
        .eq('id', item.highestBid.id);

      if (error) throw error;

      toast.success('Bid rejected successfully');
    } catch (error) {
      console.error('Error rejecting winner:', error);
      toast.error('Failed to reject winner');
    }
  };

  const handleShipItem = async (item) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await transactionService.shipItem(item.transaction_id, token);

      if (response) {
        toast.success('Item marked as shipped!');
        // Optionally refresh the data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error marking item as shipped:', error);
      toast.error('Failed to mark item as shipped');
    }
  };

  
  return (
    <div className="next-actions">
      <h2>Next Actions</h2>
      {items.length === 0 ? (
        <p>No items requiring action</p>
      ) : (
        <div className="next-actions-list">
          {items.map((item) => (
            <div key={item.id} className="action-card">
              <img 
                src={item.image_urls[0]} 
                alt={item.title}
                onClick={() => navigate(`/items/${item.id}`)}
              />
              <div className="item-info">
                <h3>{item.title}</h3>
                <p>Current Highest Bid: ${item.highest_bid || 'No bids'}</p>
                
                {item.isExpired ? (
                  item.highestBid ? (
                    <div className="winner-actions">
                      <p>Winning Bidder: {item.highestBid.profile.account.user.username}</p>
                      <p>Winning Bid: ${item.highestBid.bid_price}</p>
                      <div className="action-buttons">
                        <button onClick={() => handleAcceptWinner(item)}>
                          Accept Winner
                        </button>
                        <button onClick={() => handleRejectWinner(item)}>
                          Reject Winner
                        </button>
                        {item.status === 'SOLD' && (
                          <button onClick={() => handleShipItem(item)}>
                            Mark as Shipped
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p>Auction ended with no bids</p>
                  )
                ) : (
                  <div className="ongoing-auction">
                    <p>Auction ends: {new Date(item.deadline).toLocaleString()}</p>
                    {item.highestBid && (
                      <p>Current Leader: {item.highestBid.profile.account.user.username}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NextActions; 