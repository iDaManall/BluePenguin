import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemService } from '../../api/api';
import './AddItem.css';

const AddItem = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itemData, setItemData] = useState({
    title: '',
    description: '',
    starting_bid: '',
    image_url: '', // You might want to add image upload functionality
    category: '',
    deadline: '', // Format: YYYY-MM-DD HH:MM:SS
  });

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

      // Convert starting_bid to number
      const formattedData = {
        ...itemData,
        starting_bid: parseFloat(itemData.starting_bid),
      };

      await itemService.postItem(formattedData, token);
      navigate('/profile'); // Redirect to profile after successful submission
    } catch (err) {
      console.error('Error posting item:', err);
      setError('Failed to post item. Please try again.');
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
          <label htmlFor="category">Category</label>
          <input
            type="text"
            id="category"
            name="category"
            value={itemData.category}
            onChange={handleChange}
            required
          />
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

        <button 
          type="submit" 
          className="submit-button" 
          disabled={loading}
        >
          {loading ? 'Creating Listing...' : 'Start Listing'}
        </button>
      </form>
    </div>
  );
};

export default AddItem;