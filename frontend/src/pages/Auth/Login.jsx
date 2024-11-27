import React, { useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { signIn } = useAuth();  // Get signIn from AuthContext

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);  // Clear any previous errors
    
    try {
      const { data } = await signIn(credentials.email, credentials.password);

      // Optional: Store any additional data you need
      if (data?.session) {
        localStorage.setItem('access_token', data.session.access_token);
        localStorage.setItem('refresh_token', data.session.refresh_token);
      }

      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in');
    }
  };

  return (
    <div>
      {/* <nav className = "nav-bar">
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
         
      </nav> */}


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
              id="email"
              type="email"
              name="email"
              placeholder="Email"
              value={credentials.email}
              onChange={handleChange}
              required
            />
            </div>
          </div>
          <div className="form-group">
            
            {/*<label htmlFor="password">Password</label>*/}
            <div className= "input-icon">
            <i className='bx bx-lock-alt bx-md'></i>
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
          <div className="register-link">
            First time? <Link to="/register">Register here!</Link>
          </div>
        </form>
      </div>
      

      <img src="https://storage.googleapis.com/blue_penguin/default/Blue_Penguin_Pablo.png" alt="BluePenguin Pable" className="login-image" />
    </div>
    </div>
  );
};

export default Login;