import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemService } from '../../api/api';
import { supabase } from '../../utils/client';
import './AddItem.css';

const AddItem = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [itemData, setItemData] = useState({
    title: '',
    description: '',
    starting_bid: '',
    image_url: '',
    category: '',
    deadline: '', // Format: YYYY-MM-DD HH:MM:SS
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('api_collection')
          .select('id, title');
        if (error) throw error;
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories.');
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItemData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Ensure image_url is not empty
    if (!itemData.image_url) {
      setError('Image URL is required');
      return;
    }

      // Format data to match backend expectations
      const formattedData = {
        title: itemData.title,
        description: itemData.description,
        selling_price: parseFloat(itemData.starting_bid), 
        maximum_bid: parseFloat(itemData.maximum_bid),
        minimum_bid: parseFloat(itemData.minimum_bid),
        deadline: new Date(itemData.deadline).toISOString(),
        collection: parseInt(itemData.category), // Convert to integer
        image_urls: itemData.image_url ? [itemData.image_url] : [] // Ensure it's a non-null array
      };
    
      console.log('Submitting data:', formattedData); // Debug log

      const response = await itemService.postItem(formattedData, token);
      console.log('Response:', response); // Debug log

      navigate('/profile'); // Redirect to profile after successful submission
    } catch (err) {
      // More detailed error logging
    console.error('Error details:', {
      message: err.message,
      response: err.response,
      data: err.response?.data
    });
      setError(err.message || 'Failed to post item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-item-container">
      <h2>Add New Listing</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="add-item-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={itemData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={itemData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="starting_bid">Starting Bid ($)</label>
          <input
            type="number"
            id="starting_bid"
            name="starting_bid"
            value={itemData.starting_bid}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="minimum_bid">Minimum Bid ($)</label>
          <input
            type="number"
            id="minimum_bid"
            name="minimum_bid"
            value={itemData.minimum_bid}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label htmlFor="maximum_bid">Maximum Bid ($)</label>
          <input
            type="number"
            id="maximum_bid"
            name="maximum_bid"
            value={itemData.maximum_bid}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={itemData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="image_url">Image URL</label>
          <input
            type="url"
            id="image_url"
            name="image_url"
            value={itemData.image_url}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="deadline">Auction Deadline</label>
          <input
            type="datetime-local"
            id="deadline"
            name="deadline"
            value={itemData.deadline}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading} >
          {loading ? 'Creating Listing...' : 'Start Listing'}
        </button>
      </form>
    </div>
  );
};

export default AddItem;