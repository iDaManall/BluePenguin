import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { accountService } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import './ApplyUser.css';

function ApplyUser() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [arithmeticAnswer, setArithmeticAnswer] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await accountService.applyToBeUser(user.access_token);
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
                Random Arithmetic Problem <span className="required">*</span>
              </label>
              <input
                type="text"
                value={arithmeticAnswer}
                onChange={(e) => setArithmeticAnswer(e.target.value)}
                required
              />
            </div>

            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ApplyUser;