import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    return (
        <form className="search-container" onSubmit={handleSearch}>
            <input
                type="text"
                placeholder="What would you like to find?"
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-button">
                <img src="/search-icon.png" alt="Search" className="search-icon" />
            </button>
        </form>
    );
};

export default SearchBar;