import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountService } from '../../api/api';
import './AccountSettings.css';

const AccountSettings = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

//   useEffect(() => {
//     // Fetch current user data
//     const fetchUserData = async () => {
//       try {
//         const token = localStorage.getItem('access_token');
//         const userId = localStorage.getItem('user_id');
//         if (!token || !userId) {
//           navigate('/login');
//           return;
//         }

//         const response = await accountService.getSettings(userId, token);
//         setFormData({
//           first_name: response.first_name || '',
//           last_name: response.last_name || '',
//           email: response.email || '',
//           username: response.username || '',
//           password: ''
//         });
//       } catch (err) {
//         setError('Failed to load user data');
//       }
//     };

//     fetchUserData();
//   }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('access_token');
    //   const userId = localStorage.getItem('user_id');

      if (!token) {
        navigate('/login');
        return;
      }

      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }

      await accountService.updateSettings(userId, updateData, token);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to update settings');
    }
  };

  return (
    <div className="account-settings-container">
      <h1>Account Setting</h1>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Settings updated successfully!</div>}
      
      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <label>First name:</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Last Name:</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Leave blank to keep current password"
          />
        </div>

        <div className="button-group">
          <button type="button" className="cancel-button" onClick={() => navigate('/')}>
            Cancel
          </button>
          <button type="submit" className="save-button">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountSettings;