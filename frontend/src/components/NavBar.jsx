import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const dropdownRef = useRef(null);
  const categoryRef = useRef(null);

  // console logs if debugging needed
  // console.log('Current user:', user);
  // console.log('User status:', user?.status);
  // console.log('Should show apply button:', user && user.status === 'V');
  
  // Check if user is a visitor
  const isVisitor = user?.status === 'V';

  // Categories data structure
  const categories = [
    "accessories",
    "appliances",
    "automotive",
    "babies",
    "fashion men",
    "fashion women",
    "gadgets",
    "health and beauty",
    "home and living",
    "pets",
    "school supplies",
    "sports and lifestyle",
    "toys and collectibles"
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
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
        <div className="categories-dropdown" ref={categoryRef}>
          <button 
            className="categories-button"
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          >
            <span className="menu-icon">☰</span>
            Categories
          </button>
          {isCategoryOpen && (
            <div className="categories-menu">
              {categories.map((category) => (
                <Link
                  key={category}
                  to={`/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                  className="category-item"
                  onClick={() => setIsCategoryOpen(false)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Link>
              ))}
            </div>
          )}
        </div>
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

                {/* Only show Apply User button if user is logged in and is a visitor */}
                {user && isVisitor && (
                  <Link 
                    to="/apply-user"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Apply to be User
                  </Link>
                )}

                <Link to="/requests">Requests</Link>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-section">
                <Link to="/orders/pending">Pending</Link>
                <Link to="/orders/saved">Saved</Link>
                <Link to="/orders/Awaiting Arrival">Awaiting Arrival</Link>
                <Link to="/orders/shipped">Shipped</Link>
              </div>
            </div>
          )}
        </div>
        <Link to="/orders" className="cart-icon">
          <img src="/cart-icon.png" alt="Cart" />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;