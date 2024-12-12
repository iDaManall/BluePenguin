import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { checkPermissions } from '../../utils/permissions';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/client';
import { profileService } from '../../api/api';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const { id } = useParams(); // Get the profile ID from URL
  const [profileData, setProfileData] = useState(null);
  const [displayIcon, setDisplayIcon] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true); // Separate loading state for profile data
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [canRate, setCanRate] = useState(true);  
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        let profileId = id || (profile?.id);
        if (!profileId) {
          setError('No profile ID available');
          return;
        }

        // Fetch profile data from Supabase
        const { data: profileData, error: profileError } = await supabase
          .from('api_profile')
          .select(`
            *,
            account:account_id (
              status,
              user:user_id (
                id,
                username,
                email
              )
            )
          `)
          .eq('id', profileId)
          .single();

        if (profileError) throw profileError;
        setProfileData(profileData);
        setDisplayIcon(profileData.display_icon);

        // Fetch items for this profile
        const { data: itemsData, error: itemsError } = await supabase
          .from('api_item')
          .select(`
            *,
            collection:collection_id (title)
          `)
          .eq('profile_id', profileId)
          .eq('availability', 'A')
          .order('date_posted', { ascending: false });

        if (itemsError) throw itemsError;
        setItems(itemsData || []);

      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
        setProfileLoading(false); // Set profile loading to false after data is fetched
      }
    };

    fetchProfileData();
  }, [id, profile]);

  useEffect(() => {
    const checkCanRate = async () => {
      console.log('User:', user);
      console.log('Profile Data:', profileData);
      console.log('User Status:', user?.status);

      if (!id || !profileData || user.status === 'VISITOR') {
        console.log('Failed: User is not signed in or is a visitor');
        setCanRate(false);
        return;
      }
  
      // Can't rate your own profile
      if (profile?.id === profileData.id) {
        console.log('Failed: Cannot rate your own profile');
        setCanRate(false);
        return;
      }
  
      try {
        // Check for past transactions
        const { data: transactions } = await supabase
          .from('api_transaction')
          .select('*')
          .or(`seller_id.eq.${profile.id},buyer_id.eq.${profile.id}`)
          .or(`seller_id.eq.${profileData.id},buyer_id.eq.${profileData.id}`);
  
        console.log('Transactions:', transactions);
        setCanRate(transactions && transactions.length > 0);
      } catch (err) {
        console.error('Error checking transaction history:', err);
        setCanRate(false);
      }
    };
  
    if (user && profile && profileData && !profileLoading) {
      checkCanRate();
    }
  }, [user, profile, profileData, profileLoading]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!profileData) return <div>Profile not found</div>;

  const isOwnProfile = profile?.id === profileData.id;

  const handleRateProfile = async (newRating) => {
    try {
      const token = localStorage.getItem('access_token');
      // const response = await profileService.rateProfile(profileData.id, {
      //   rating: newRating
      // }, token);
      
      // setProfileData(prev => ({
      //   ...prev,
      //   average_rating: response.average_rating
      // }));
      
      toast.success('Rating submitted successfully!');
      setCanRate(true);
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };
  

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
            <h2>{profileData.account.user.username}</h2>
            <p>{profileData.display_name}</p>
            <p>Status: {profileData.account.status}</p>
            <p>Rating: {profileData.average_rating || 'N/A'}</p>
            <p>{profileData.description}</p>
            {!canRate && !isOwnProfile && (
            <div className="rating-container">
              <p>Rate this user:</p>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= rating ? 'filled' : ''}`}
                    onClick={() => handleRateProfile(star)}
                    onMouseEnter={() => setRating(star)}
                    onMouseLeave={() => setRating(0)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
        {isOwnProfile && (
          <button 
            className="edit-profile-btn"
            onClick={() => navigate('/profile/edit')}
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="product-listings">
        <div className="listings-header">
          <h3>Product Listings ({items.length})</h3>
          {isOwnProfile && (
            <button 
              className="add-item-btn"
              onClick={() => navigate('/items/new')}
            >
              + Add Item
            </button>
          )}
        </div>

        <div className="items-grid">
          {items.map(item => (
            <div key={item.id} className="item-card">
              <img 
                src={item.image_urls?.[0]}
                alt={item.title} 
                onClick={() => navigate(`/items/${item.id}`)}
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
              <div className="item-info">
                <h4>{item.title}</h4>
                {/* <p>{item.description}</p> */}
                <div className="item-details">
                  <p>Current Bid: ${item.highest_bid || 'No bids'}</p>
                  <p>Collection: {item.collection?.title}</p>
                  <p>Total Bids: {item.total_bids}</p>
                  <p>Deadline: {new Date(item.deadline).toLocaleDateString()}</p>
                </div>
                {isOwnProfile && (
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
    </div>
  );
};

export default Profile;