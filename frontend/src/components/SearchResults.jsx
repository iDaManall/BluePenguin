import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { itemService } from '../api/api';
import ItemCard from '../components/ItemCard/ItemCard';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const query = searchParams.get('q');
        const response = await itemService.searchItems({
          search: query,
          availability: 'available'
        });
        setItems(response.results);
      } catch (err) {
        setError('Failed to load search results');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]);

  return (
    <div className="search-results-container">
      <h2>Search Results</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
      <div className="items-grid">
        {items.length > 0 ? (
          items.map(item => <ItemCard key={item.id} item={item} />)
        ) : (
          <p>No items found</p>
        )}
      </div>
    </div>
  );
};

export default SearchResults;