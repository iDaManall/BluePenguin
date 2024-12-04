import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { profileService, itemService } from '../../api/api';
import { checkPermissions } from '../../utils/permissions';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/client';
import './Profile.css';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [displayIcon, setDisplayIcon] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch profile data
        const profile = await profileService.viewOwnProfile(token);
        console.log('Profile data:', profile); // Add this line to debug
        console.log('User from auth context:', user);
        console.log('User status:', user?.status);
        setProfileData(profile);

        // Fetch display_icon from Supabase if we have a profile ID
        if (profile?.id) {
            const { data, error } = await supabase
              .from('api_profile')
              .select('display_icon')
              .eq('id', profile.id)
              .single();
  
            if (error) {
              console.error('Error fetching display_icon:', error);
            } else if (data) {
              console.log('Fetched display_icon:', data.display_icon);
              setDisplayIcon(data.display_icon);
            }
        }

        // Fetch user's items
      if (profile && profile.id) {
        const userItems = await itemService.browseAvailableByProfile(profile.id, token);
        setItems(userItems);
      } else {
        console.error('No user_id found in profile data:', profile);
        setError('Failed to load user items');
      }
        
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate, user]);

  const handleDeleteItem = async (itemId) => {
    try {
      const token = localStorage.getItem('access_token');
      await itemService.deleteItem(itemId, token);
      // Remove item from state
      setItems(items.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item');
    }
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const handleAddItem = () => {
    navigate('/items/new'); // You'll need to create this route
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!profileData) return <div>No profile data found</div>;

  // Check status from user object instead of profileData
  const isVisitor = user?.status === 'V';
  console.log('Is visitor check:', {
    userStatus: user?.status,
    isVisitor: isVisitor
  });

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-info">
            <div className="profile-avatar">
                {displayIcon && (
                <img 
                    src={displayIcon} 
                    alt="Profile" 
                    className="profile-image"
                />
                )}
            </div>
          <div className="profile-details">
            <h2>{profileData.username}</h2>
            <p>{profileData.display_name}</p>
            <p>Status: {profileData.status}</p>
            {!isVisitor && <p>Rating: {profileData.average_rating}</p>}
            <p>{profileData.description}</p>
          </div>
        </div>
        {isVisitor ? (
          <Link 
            to="/apply-user"
            className="apply-user-btn"
          >
            Apply to be User
          </Link>
        ) : (
          checkPermissions.canUpdateSettings(user) && (
            <button 
              className="edit-profile-btn"
              onClick={handleEditProfile}
            >
              Edit Profile
            </button>
          )
        )}
      </div>

      {/* Only show product listings and reviews for non-visitors */}
      {!isVisitor && (
        <>
          <div className="product-listings">
            <div className="listings-header">
              <h3>Product Listings ({items.length})</h3>
              {checkPermissions.canUpdateSettings(user) && (
                <button 
                  className="add-item-btn"
                  onClick={handleAddItem}
                >
                  + Add Item
                </button>
              )}
            </div>

            <div className="items-grid">
              {items.map(item => (
                <div key={item.id} className="item-card">
                  <img src={item.image_url} alt={item.title} />
                  <div className="item-info">
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                    {checkPermissions.canDeleteItem(user, item) && (
                      <button 
                        className="delete-item-btn"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        X
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;