import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import './Navbar.css';

const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button 
          className="hamburger-menu"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <Link to="/" className="logo">
          Blue Penguin
        </Link>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search items..."
          className="search-bar"
        />
        <button className="search-button">
          Search
        </button>
      </div>

      <div className="navbar-right">
        <button 
          className="auth-button"
          onClick={() => setIsLoginOpen(true)}
        >
          Sign In
        </button>
        <button 
          className="auth-button"
          onClick={() => setIsRegisterOpen(true)}
        >
          Sign Up
        </button>
        <button className="cart-button">
          Cart (0)
        </button>
      </div>

      {/* Sign In Modal */}
      {isLoginOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button 
              className="modal-close"
              onClick={() => setIsLoginOpen(false)}
            >
              ×
            </button>
            <Login onClose={() => setIsLoginOpen(false)} />
          </div>
        </div>
      )}

      {/* Sign Up Modal */}
      {isRegisterOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button 
              className="modal-close"
              onClick={() => setIsRegisterOpen(false)}
            >
              ×
            </button>
            <Register onClose={() => setIsRegisterOpen(false)} />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;