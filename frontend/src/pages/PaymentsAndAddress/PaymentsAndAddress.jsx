import React, { useState, useEffect } from 'react';
import { accountService } from '../../api/api';
import './PaymentsAndAddress.css';

const PaymentsAndAddress = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [address, setAddress] = useState({
    street_address: '',
    address_line_2: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const id = localStorage.getItem('user_id');

        if (!token || !id) {
            setError('No authentication credentials found');
            setLoading(false);
            return;
        }

        const balanceData = await accountService.viewBalance(id);
        setBalance(balanceData.balance);
        
        // Use existing viewTransactions endpoint
        const transactionsData = await accountService.viewTransactions(token);
        setTransactions(transactionsData);

        const addressResponse = await accountService.getShippingAddress(token);
        setAddress(addressResponse);
        } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load account information');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddMoney = async () => {
    try {
      const token = localStorage.getItem('access_token');
      // You would typically integrate with Zelle/PayPal here
      // For now, we'll just show a placeholder
      alert('Redirect to payment provider');
    } catch (err) {
      setError('Failed to process payment');
      console.error(err);
    }
  };

  const handleChangeAddress = async () => {
    try {
        // Debug log - initial state
      console.log('Starting handleChangeAddress');
      console.log('Current address state:', address);

      // Validate required fields
      const requiredFields = ['street_address', 'city', 'zip', 'country'];
      const missingFields = requiredFields.filter(field => !address[field]);
      
      if (missingFields.length > 0) {
        const errorMsg = `Please fill in all required fields: ${missingFields.join(', ')}`;
        console.error(errorMsg);
        setError(errorMsg);
        // Keep the modal open when validation fails
        return false;
      }

      const token = localStorage.getItem('access_token');
      // Format the address data according to backend expectations
      const addressData = {
        street_address: address.street_address,
        address_line_2: address.address_line_2 || '',
        city: address.city,
        state: address.state || '',
        zip: address.zip,
        country: address.country
     };
      
     console.log('About to send address data:', addressData);
     await accountService.setShippingAddress(addressData, token);

      setIsEditing(false); // Close modal after success

      // Refresh the address data after successful update
      const updatedAddress = await accountService.getShippingAddress(token);
      setAddress(updatedAddress);

      alert('Address updated successfully');
      return true; // Add return true for successful submission
    } catch (err) {
      console.error('Full error object:', err);
      setError(err.message || 'Failed to update address');

      // Prevent the component from unmounting on error
      return false;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="payments-container">
      {/* Available Balance Section */}
      <div className="balance-section">
        <h2>Available Balance</h2>
        <div className="balance-amount">
          <span>$ {balance.toFixed(2)}</span>
        </div>
        <div className="balance-actions">
          <button onClick={handleAddMoney}>Add Money</button>
          <div className="payment-methods">Zelle | PayPal</div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="transactions-section">
        <h2>Transactions</h2>
        <div className="transactions-list">
          {transactions.map((transaction, index) => (
            <div key={index} className="transaction-item">
              <div className="transaction-details">
                <span>#{transaction.account}</span>
                <span>{transaction.date}</span>
              </div>
              <div className="transaction-amount">
                $ {transaction.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address Section */}
        <div className="address-section">
        <h2>Shipping Address</h2>
        <div className="address-display">
            <p>{address.street_address}</p>
            {address.address_line_2 && <p>{address.address_line_2}</p>}
            <p>{`${address.city}, ${address.state} ${address.zip}`}</p>
            <p>{address.country}</p>
        </div>
        <button 
            className="change-address-btn"
            onClick={() => setIsEditing(true)}
        >
            Change Address
        </button>
        </div>

        {/* Address Edit Modal */}
        {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Edit Shipping Address</h3>
            <div className="address-form">
                <div className="form-group">
                <label>Street Address</label>
                <input
                    type="text"
                    value={address.street_address}
                    onChange={(e) => setAddress({...address, street_address: e.target.value})}
                />
                </div>
                <div className="form-group">
                <label>Street Address</label>
                <input
                    type="text"
                    value={address.address_line_2}
                    onChange={(e) => setAddress({...address, address_line_2: e.target.value})}
                />
                </div>
                <div className="form-group">
                <label>City</label>
                <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({...address, city: e.target.value})}
                />
                </div>
                <div className="form-group">
                <label>State</label>
                <input
                    type="text"
                    value={address.state}
                    onChange={(e) => setAddress({...address, state: e.target.value})}
                />
                </div>
                <div className="form-group">
                <label>ZIP Code</label>
                <input
                    type="text"
                    value={address.zip}
                    onChange={(e) => setAddress({...address, zip: e.target.value})}
                />
                </div>
                <div className="form-group">
                <label>Country</label>
                <input
                    type="text"
                    value={address.country}
                    onChange={(e) => setAddress({...address, country: e.target.value})}
                />
                </div>
                <div className="address-form-buttons">
                <button onClick={handleChangeAddress}>Save</button>
                <button onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
            </div>
            </div>
        </div>
        )}
    </div>
  );
};

export default PaymentsAndAddress;