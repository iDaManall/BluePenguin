import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Orders.css';
import { transactionService, itemService } from '../../api/api';
import { toast } from 'react-toastify';
import PendingBids from '../Orders/PendingBids';
import SavedItems from '../Orders/SavedItems';
import NextActions from '../Orders/NextActions';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/client';

const Orders = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const [activeFilters, setActiveFilters] = useState([]);
  const [pendingBids, setPendingBids] = useState([]);
  const [nextActions, setNextActions] = useState([]);
  const [awaitingArrivals, setAwaitingArrivals] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const { profile } = useAuth();

  const filterOptions = [
    { id: 'pending', label: 'Pending' },
    { id: 'saved', label: 'Saved' },
    { id: 'next-actions', label: 'Next Actions' },
    { id: 'awaiting', label: 'Awaiting Arrival' }
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
        if (!profile) return;

        // Fetch items where user is the seller
        if (activeFilters.length === 0 || activeFilters.includes('next-actions')) {
          const { data: sellerItems, error } = await supabase
            .from('api_item')
            .select(`
              *,
              bids:api_bid!api_bid_item_id_968cbf5a_fk_api_item_id (
                *,
                profile:profile_id (
                  *,
                  account:account_id (
                    user:user_id (*)
                  )
                )
              )
            `)
            .eq('profile_id', profile.id)
            .order('deadline');

          if (error) throw error;

          // Process items based on deadline
          const processedItems = sellerItems.map(item => {
            const now = new Date();
            const deadline = new Date(item.deadline);
            const isExpired = deadline < now;
            
            // Find highest bid
            const highestBid = item.bids.reduce((max, bid) => 
              bid.bid_price > max.bid_price ? bid : max, 
              { bid_price: 0 }
            );

            return {
              ...item,
              isExpired,
              highestBid: highestBid.bid_price > 0 ? highestBid : null
            };
          });

          setNextActions(processedItems);
        }

        // If no filters are active or if pending filter is active
        if (activeFilters.length === 0 || activeFilters.includes('pending')) {
          const pendingBidsData = await itemService.getPendingBids(token);
          setPendingBids(pendingBidsData.filter(bid => 
            bid.status === 'ACT' && bid.winner_status === 'I'
          ));
        }

        // Fetch other sections as needed
        if (activeFilters.length === 0 || activeFilters.includes('saved')) {
          const saved = await itemService.getSavedItems(token);
          setSavedItems(saved);
        }

        if (activeFilters.length === 0 || activeFilters.includes('awaiting')) {
          const awaiting = await transactionService.getAwaitingArrivals(token);
          setAwaitingArrivals(awaiting);
        }
        if (activeFilters.length === 0 || activeFilters.includes('next-actions')) {
          try {
            const token = localStorage.getItem('access_token');
            const response = await transactionService.getNextActions(token);
            
            // Process items based on deadline
            const processedItems = response.map(item => ({
              ...item,
              isExpired: new Date(item.deadline) < new Date(),
              highestBid: item.bids.length > 0 ? 
                item.bids.reduce((max, bid) => 
                  bid.bid_price > max.bid_price ? bid : max, 
                  { bid_price: 0 }
                ) : null
            }));
        
            setNextActions(processedItems);
          } catch (error) {
            console.error('Error fetching next actions:', error);
            toast.error('Failed to load next actions');
          }
        }
        
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      }
    };

    fetchOrders();
  }, [activeFilters, profile]);

  return (
    <div className="orders-page">
      <div className="filters">
        {filterOptions.map(filter => (
          <button
            key={filter.id}
            className={`filter-btn ${activeFilters.includes(filter.id) ? 'active' : ''}`}
            onClick={() => toggleFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {(activeFilters.length === 0 || activeFilters.includes('pending')) && (
        <PendingBids />
      )}

      {(activeFilters.length === 0 || activeFilters.includes('saved')) && (
        <SavedItems />
      )}

      {(activeFilters.length === 0 || activeFilters.includes('next-actions')) && (
        <NextActions items={nextActions} />
      )}

      {/* Other sections remain the same */}
    </div>
  );
};

export default Orders; 