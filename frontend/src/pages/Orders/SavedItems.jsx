import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/client';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './SavedItems.css';

const SavedItems = () => {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedItems = async () => {
      try {
        if (!profile) return;

        const { data, error } = await supabase
          .from('api_save')
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
          .order('time_saved', { ascending: false });

        if (error) throw error;
        setSavedItems(data);
      } catch (error) {
        console.error('Error fetching saved items:', error);
        toast.error('Failed to load saved items');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedItems();
  }, [profile]);

  if (loading) return <div>Loading saved items...</div>;

  return (
    <div className="saved-items">
      <h2>Saved Items</h2>
      {savedItems.length === 0 ? (
        <p>No saved items</p>
      ) : (
        <div className="saved-items-list">
          {savedItems.map((save) => (
            <div key={save.id} className="item-card">
              <img 
                src={save.item.image_urls[0]} 
                alt={save.item.title}
                onClick={() => navigate(`/items/${save.item.id}`)}
              />
              <div className="item-info">
                <h3>{save.item.title}</h3>
                <p>Current Price: ${save.item.highest_bid || save.item.minimum_bid}</p>
                <p>Seller: {save.item.profile.account.user.username}</p>
                <p>Saved on: {new Date(save.time_saved).toLocaleString()}</p>
                <p>Ends: {new Date(save.item.deadline).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedItems; 