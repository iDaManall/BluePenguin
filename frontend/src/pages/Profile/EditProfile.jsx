import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../../api/api';
import './EditProfile.css';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    display_name: '',
    description: '',
    profile_image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profile_image: file
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      
      // Create FormData object to handle file upload
      const submitData = new FormData();
      submitData.append('display_name', formData.display_name);
      submitData.append('description', formData.description);
      if (formData.profile_image) {
        submitData.append('profile_image', formData.profile_image);
      }

      await profileService.editProfile(submitData, token);
      navigate('/profile'); // Navigate back to profile page
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-content">
        <div className="profile-image-section">
          <div className="profile-image-container">
            {imagePreview ? (
              <img src={imagePreview} alt="Profile preview" className="profile-image" />
            ) : (
              <div className="profile-image-placeholder">
                <span className="placeholder-text">Profile Image</span>
              </div>
            )}
          </div>
          <button 
            className="change-picture-btn"
            onClick={() => document.getElementById('profile-image-input').click()}
          >
            Change Picture
          </button>
          <input
            type="file"
            id="profile-image-input"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-group">
            <label>Display Name</label>
            <input
              type="text"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="save-changes-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;