import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileService } from '../../api/api';

const EditProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [formData, setFormData] = useState({
    displayName: '',
    description: '',
    avatar: null
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await profileService.getProfile(id, token);
        setFormData({
          displayName: profile.displayName,
          description: profile.description,
          avatar: profile.avatar
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await profileService.editProfile(id, formData, token);
      navigate(`/profile/${id}`);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Display Name</label>
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            maxLength={50}
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength={140}
          />
        </div>

        <div className="form-group">
          <label>Profile Picture</label>
          <button type="button" className="change-picture-btn">
            Change Picture
          </button>
        </div>

        <button type="submit" className="save-changes-btn">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;