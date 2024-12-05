import React, { useState, useEffect } from 'react';
import { accountService } from '../../api/api';
import './PaymentsAndAddress.css';

const PaymentsAndAddress = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      const token = localStorage.getItem('access_token');
      await accountService.setShippingAddress(address, token);
      alert('Address updated successfully');
    } catch (err) {
      setError('Failed to update address');
      console.error(err);
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
          <p>{address.street}</p>
          <p>{`${address.city}, ${address.state} ${address.zipCode}`}</p>
        </div>
        <button 
          className="change-address-btn"
          onClick={handleChangeAddress}
        >
          Change Address
        </button>
      </div>
    </div>
  );
};

export default PaymentsAndAddress;