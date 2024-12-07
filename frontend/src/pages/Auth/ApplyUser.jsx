import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { accountService } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import './ApplyUser.css';

function ApplyUser() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [arithmeticQuestion, setArithmeticQuestion] = useState('');
  const [arithmeticAnswer, setArithmeticAnswer] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch the arithmetic question when component mounts
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await accountService.getArithmeticQuestion(user.access_token);
        setArithmeticQuestion(response.question);
      } catch (error) {
        console.error('Error fetching arithmetic question:', error);
      }
    };
    fetchQuestion();
  }, [user.access_token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Make sure we're sending the answer as a number
      const answer = parseInt(arithmeticAnswer, 10);
      if (isNaN(answer)) {
        throw new Error('Please enter a valid number');
      }

      const response = await accountService.applyToBeUser(
        { answer }, // Send just the answer property
        user.access_token
      );

      if (response.error) {
        console.error('Application error:', response.error);
        return;
      }

      navigate('/home');
    } catch (error) {
      console.error('Error applying to be user:', error);
    }
  };

  return (
    <div className="apply-user-container">
      <div className="apply-user-content">
        <div className="info-section">
          <h2>Currently you can:</h2>
          <ul>
            <li>Browse items</li>
            <li>Comment on item</li>
          </ul>

          <h2>As a user you can:</h2>
          <ul>
            <li>Browse items</li>
            <li>Comment on items</li>
            <li>List items</li>
            <li>Review other users</li>
            <li>Enter in Bids</li>
          </ul>
        </div>

        <div className="form-section">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              First Name <span className="required">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>
              Last Name <span className="required">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>
              {arithmeticQuestion || 'Loading question...'} <span className="required">*</span>
            </label>
            <input
              type="number"
              value={arithmeticAnswer}
              onChange={(e) => setArithmeticAnswer(e.target.value)}
              required
            />
          </div>

          <button type="submit">Apply</button>
        </form>
      </div>
     </div>
    </div>
  );
}

export default ApplyUser;