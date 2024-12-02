import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Orders.css';
import { transactionService, itemService } from '../../api/api';

const Orders = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const [activeFilters, setActiveFilters] = useState([]);
  const [pendingBids, setPendingBids] = useState([]);
  const [nextActions, setNextActions] = useState([]);
  const [awaitingArrivals, setAwaitingArrivals] = useState([]);
  const [savedItems, setSavedItems] = useState([]);

  const filterOptions = [
    { id: 'pending', label: 'Pending' },
    { id: 'saved', label: 'Saved' },
    { id: 'awaiting', label: 'Awaiting Arrival' },
    { id: 'shipped', label: 'Shipped' }
  ];

  const toggleFilter = (filterId) => {
    setActiveFilters(prev => {
      if (prev.includes(filterId)) {
        return prev.filter(f => f !== filterId);
      }
      return [...prev, filterId];
    });
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        // If no filters are active, show all sections
        if (activeFilters.length === 0) {
          const [bids, nextActionItems, awaitingItems, saved] = await Promise.all([
            itemService.getItemBids(token),
            transactionService.getNextActions(token),
            transactionService.getAwaitingArrivals(token),
            itemService.getSavedItems(token)
          ]);
          setPendingBids(bids);
          setNextActions(nextActionItems);
          setAwaitingArrivals(awaitingItems);
          setSavedItems(saved);
          return;
        }

        // Reset all states first
        setPendingBids([]);
        setNextActions([]);
        setAwaitingArrivals([]);
        setSavedItems([]);

        // Fetch only selected sections
        const promises = [];
        if (activeFilters.includes('pending')) {
          const bids = await itemService.getItemBids(token);
          setPendingBids(bids);
        }
        if (activeFilters.includes('saved')) {
          const saved = await itemService.getSavedItems(token);
          setSavedItems(saved);
        }
        if (activeFilters.includes('awaiting')) {
          const awaiting = await transactionService.getAwaitingArrivals(token);
          setAwaitingArrivals(awaiting);
        }
        // Add other filter conditions as needed
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [activeFilters]);

  return (
    <div className="orders-page">
      <div className="filters-section">
        <div className="filters-header">
          <span>Filters</span>
          <span className="icon">≡</span>
        </div>
        <div className="filter-buttons">
          {filterOptions.map(option => (
            <button
              key={option.id}
              className={`filter-btn ${activeFilters.includes(option.id) ? 'active' : ''}`}
              onClick={() => toggleFilter(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Render sections based on filters */}
      {/* Rest of your component sections */}
    </div>
  );
};

export default Orders; 