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
      const registrationData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.username, // Default to username if not provided
          last_name: formData.username   // Default to username if not provided
      };
      
      console.log('Sending registration data:', registrationData); // Debug log

      await signUp(
          registrationData.email,
          registrationData.password,
          registrationData.username,
          registrationData.first_name,
          registrationData.last_name
      );

      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register');
    }
  };

  return (
    <div>
    <nav className = "nav-bar">
    <div className = "logo">
      <a href="#">BLUEPENGUIN</a>
    </div>
    <ul>
      <li> <a href = "#" ><i className='bx hover-action bx-menu' ></i> Catergories</a></li>
    </ul>
    <div className = 'search-bar'>
      <input type ='text' placeholder= "Search..." id = "search-input"></input>
      <button type = 'submit' className ="search-btn"><i className='bx bxs-search-alt-2' ></i></button>
    </div>
    <ul><li> <a href = "#" className = "Account-Login">My Account</a></li></ul>
    
    <ul><li> <a href = '#' className = 'cart'><i className='bx  hover-action bxs-cart bx-md'></i></a></li></ul>
   
</nav>

    <div className="signup-container">
      <div className="signup-box">
        <h2>Sign Up</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
           {/* <label htmlFor="username">Username</label>*/}
           <div className = 'input-icon'>
           <i className='bx bx-user bx-md'></i>
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
            <i className='bx bx-envelope bx-md'></i>
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
            <i className='bx bx-lock-alt bx-md'></i>
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
            <i className='bx bxs-lock bx-md' ></i>
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
    </div>
  );
};

export default Register;