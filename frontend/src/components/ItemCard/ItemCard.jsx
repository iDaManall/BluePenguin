import React from 'react';
import { Link } from 'react-router-dom';
import './ItemCard.css';

const ItemCard = ({ item }) => {
  return (
    <Link to={`/items/${item.id}`} className="item-card">
      <div className="item-image">
        <img src={item.image_urls[0]} alt={item.title} />
      </div>
      <div className="item-details">
        <h3>{item.title}</h3>
        <p className="price">${item.selling_price}</p>
        <p className="deadline">
          Closes: {new Date(item.deadline).toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
};

export default ItemCard;





