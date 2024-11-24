import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../api/api';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await authService.signin(credentials);
      localStorage.setItem('token', response.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div>
      <nav class = "nav-bar">
          <div class = "logo">
            <a href="#">BLUEPENGUIN</a>
          </div>
          <ul>
            <li> <a href = "#" ><i class='bx hover-action bx-menu' ></i> Catergories</a></li>
          </ul>
          <div class = 'search-bar'>
            <input type ='text' placeholder= "Search..." id = "search-input"></input>
            <button type = 'submit' class ="search-btn"><i class='bx bxs-search-alt-2' ></i></button>
          </div>
          <ul><li> <a href = "#" class = "Account-Login">My Account</a></li></ul>
          
          <ul><li> <a href = '#' class = 'cart'><i class='bx  hover-action bxs-cart bx-md'></i></a></li></ul>
         
      </nav>


    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
           {/*  <label htmlFor="username">Username</label>*/}
            <div className= "input-icon">
            <i className='bx bx-user-pin bx-md'></i>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="Username"
              value={credentials.username}
              onChange={handleChange}
              required
            />
            </div>
          </div>
          <div className="form-group">
            
            {/*<label htmlFor="password">Password</label>*/}
            <div className= "input-icon">
            <i class='bx bx-lock-alt bx-md'></i>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
            </div>
          </div>
          <button type="submit" className="submit-button">
            Login
          </button>
        </form>
      </div>
      

      <img src="https://storage.googleapis.com/blue_penguin/default/Blue_Penguin_Pablo.png" alt="BluePenguin Pable" className="login-image" />
    </div>
    </div>
  );
};

export default Login;