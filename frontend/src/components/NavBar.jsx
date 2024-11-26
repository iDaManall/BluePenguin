import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import './Navbar.css';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="brand">
          BLUE PENGUIN
        </Link>
        <button className="categories-button">
          <span className="menu-icon">☰</span>
          Categories
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="What would you like to find?"
          className="search-input"
        />
        <button className="search-button">
          <img src="/search-icon.png" alt="Search" className="search-icon" />
        </button>
      </div>

      <div className="navbar-right">
        <div className="account-dropdown" ref={dropdownRef}>
          <button 
            className="account-button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            My Account
          </button>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-section">
                <Link to="/profile">Profile</Link>
                <Link to="/account/settings">Account Setting</Link>
                <Link to="/payments">Payments / Address</Link>
                <Link to="/apply">Apply to Be a User</Link>
                <Link to="/requests">Requests</Link>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-section">
                <Link to="/orders/pending">Pending</Link>
                <Link to="/orders/saved">Saved</Link>
                <Link to="/orders/canceled">Canceled/processed</Link>
                <Link to="/orders/shipped">Shipped</Link>
              </div>
            </div>
          )}
        </div>
        <Link to="/cart" className="cart-icon">
          <img src="/cart-icon.png" alt="Cart" />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;