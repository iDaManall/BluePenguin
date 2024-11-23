import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const { confirmPassword, ...registrationData } = formData;
      const { data } = await signUp(registrationData.email, registrationData.password);

      if (data?.user) {
        localStorage.setItem('access_token', data.session.access_token);
        localStorage.setItem('refresh_token', data.session.refresh_token);
      }

      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to register');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Sign Up</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="submit-button">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;