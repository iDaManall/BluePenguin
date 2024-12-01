import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ItemCard.css';

const ItemCard = ({ item }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    console.log('Navigating to item:', item.id);
    navigate(`/items/${item.id}`);
  };

  return (
    <div className="item-card" onClick={handleClick}>
      <img 
        src={item.image_urls?.[0] || '/default-item.png'} 
        alt={item.title} 
        onError={(e) => {
          e.target.src = '/default-item.png';
        }}
      />
      <div className="item-info">
        <h3>{item.title}</h3>
        <p>Current Bid: ${item.highest_bid}</p>
        <p>Time Remaining: {
          new Date(item.deadline) > new Date() 
            ? 'Active' 
            : 'Ended'
        }</p>
      </div>
    </div>
  );
};

export default ItemCard;





