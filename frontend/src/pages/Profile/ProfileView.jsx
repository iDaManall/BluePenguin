import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { profileService } from '../../api/api';
import './Profile.css';

const ProfileView = () => {
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const { id } = useParams();
  const token = localStorage.getItem('token'); // Assuming token is stored in localStorage

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await profileService.getProfile(id, token);
        setProfile(profileData);
        // Fetch available items for this profile
        const availableItems = await itemService.browseAvailableByProfile(id, token);
        setItems(availableItems);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [id, token]);

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <img src={profile.avatar || '/default-avatar.png'} alt="Profile" />
        </div>
        <div className="profile-info">
          <h2>{profile.username}</h2>
          <p>Joined {new Date(profile.dateJoined).toLocaleDateString()}</p>
          <p>Rating: {'⭐'.repeat(profile.rating)}</p>
          <p>{profile.description}</p>
          {profile.isOwnProfile && (
            <button onClick={() => window.location.href = `/profile/edit/${id}`}>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="profile-listings">
        <h3>Product Listings ({items.length})</h3>
        <div className="items-grid">
          {items.map(item => (
            <ItemCard key={item.id} item={item} onDelete={() => handleDeleteItem(item.id)} />
          ))}
          {profile.isOwnProfile && (
            <button className="add-item-button" onClick={() => setShowAddItemModal(true)}>
              +
            </button>
          )}
        </div>
      </div>

      <div className="profile-reviews">
        <h3>Reviews</h3>
        {profile.reviews.map(review => (
          <div key={review.id} className="review-card">
            <p>{new Date(review.date).toLocaleDateString()}</p>
            <div>{'⭐'.repeat(review.rating)}</div>
            <p>{review.comment}</p>
            <button className="report-button" onClick={() => handleReportReview(review.id)}>
              Report
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileView;