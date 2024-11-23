import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../api/api';
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
      const response = await authService.register(registrationData);
      
      localStorage.setItem('token', response.token);
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Sign Up</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
           {/* <label htmlFor="username">Username</label>*/}
           <div className = 'input-icon'>
           <i class='bx bx-user bx-md'></i>
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
          </div>
          <div className="form-group">
            {/*<label htmlFor="email">Email</label>*/}
            <div className = 'input-icon'>
            <i class='bx bx-envelope bx-md'></i>
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
          </div>
          <div className="form-group">
            {/*<label htmlFor="password">Password</label>*/}

            <div className = 'input-icon'>
            <i class='bx bx-lock-alt bx-md'></i>
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
          </div>
          <div className="form-group">
            {/*<label htmlFor="confirmPassword">Confirm Password</label>*/}
            <div className = 'input-icon'>
            <i class='bx bxs-lock bx-md' ></i>
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
          </div>
          <button type="submit" className="submit-button">
            Sign Up
          </button>
        </form>
        
      </div>
      <img src="https://storage.googleapis.com/blue_penguin/default/Blue_Penguin_Pablo.png" alt="BluePenguin Pable" className="login-image" />
    </div>
    
  );
};

export default Register;