import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemService } from '../../api/api';
import SearchBar from '../../components/SearchBar';
// import CategoryList from '../../components/CategoryList';
// import FeaturedItems from '../../components/FeaturedItems';
import ItemCard from '../../components/ItemCard/ItemCard';
import './Home.css';

const Home = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        setLoading(true);
        const response = await itemService.searchItems({
          ordering: '-total_bids',
          availability: 'available',
          limit: 6
        });
        setFeaturedItems(response?.results || []);
      } catch (err) {
        setError('Failed to load featured items');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  return (
    <div className="home-container">
      <section className="hero-section">
        <h1>Find Your Next Treasure</h1>
        <p>Discover unique items and bid on what matters to you</p>
        <SearchBar />
      </section>

      <section className="categories-section">
        <h2>Popular Categories</h2>
        {/* <CategoryList /> */}
      </section>

      <section className="featured-section">
        <h2>Featured Items</h2>
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}
        {!loading && !error && (
          <div className="items-grid">
            {featuredItems.length > 0 ? (
              featuredItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))
            ) : (
              <p>No items found</p>
            )}
          </div>
        )}
      </section>

      <section className="cta-section">
        <h2>Start Selling Today</h2>
        <p>Turn your items into opportunities</p>
        <Link to="/items/post" className="cta-button">
          Post an Item
        </Link>
      </section>
    </div>
  );
};

export default Home;