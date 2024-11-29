import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { itemService } from '../../api/api.js';
import './Filter.css';
import { Link } from 'react-router-dom';
import ItemCard from '../../components/ItemCard/ItemCard';

const Filter = () => {
  const { category } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(new Set([category]));

  const categories = [
    "accessories", "appliances", "automotive", "babies",
    "fashion men", "fashion women", "gadgets", "health and beauty",
    "home and living", "pets", "school supplies",
    "sports and lifestyle", "toys and collectibles"
  ];

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        // Create array of promises for each selected category
        const promises = Array.from(selectedCategories).map(cat => 
          itemService.searchItems({
            collection__title: cat,
            ordering: sortOrder === 'asc' ? 'selling_price' : '-selling_price',
            availability: 'available'
          })
        );

        // Wait for all requests to complete
        const responses = await Promise.all(promises);
        
        // Combine and deduplicate results
        const allItems = responses.flatMap(response => response.results || []);
        const uniqueItems = Array.from(new Map(allItems.map(item => [item.id, item])).values());
        
        setItems(uniqueItems);
      } catch (err) {
        setError('Failed to load items');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [selectedCategories, sortOrder]);

  const handleCategoryChange = (cat) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cat)) {
        newSet.delete(cat);
      } else {
        newSet.add(cat);
      }
      return newSet;
    });
  };

  return (
    <div className="filter-page">
      <aside className="filters-sidebar">
        <h2>Filters</h2>
        
        <div className="filter-section">
          <h3>Categories</h3>
          <div className="categories-list">
            {categories.map(cat => (
              <label key={cat} className="category-option">
                <input 
                  type="checkbox" 
                  name={cat}
                  checked={selectedCategories.has(cat)}
                  onChange={() => handleCategoryChange(cat)}
                />
                <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h3>Price Range</h3>
          <select 
            className="price-sort-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="">Sort by price</option>
            <option value="asc">Low to High ($)</option>
            <option value="desc">High to Low ($)</option>
          </select>
        </div>
      </aside>

      <main className="items-content">
        <h1 className="category-title">
          {Array.from(selectedCategories).map(cat => 
            cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
          ).join(', ')}
        </h1>
        
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}
        
        <div className="items-grid">
          {items.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Filter;