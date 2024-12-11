import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { accountService, profileService, permissionsService } from '../../api/api';
import './Requests.css';

const Requests = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [isSuspended, setIsSuspended] = useState(false);
  const [activeOption, setActiveOption] = useState('complaint');
  const [formData, setFormData] = useState({
    username: '',
    offenderUsername: '',
    description: '',
    password: '',
    reason: '',
    otherReason: ''
  });

  useEffect(() => {
    const checkSuspensionStatus = async () => {
      try {
        if (!profile) return;
        const { data, error } = await permissionsService.checkSuspensionStatus(localStorage.getItem('user_id'));
        if (error) throw error;
        setIsSuspended(data.is_suspended);
      } catch (error) {
        console.error('Error checking suspension status:', error);
        toast.error('Failed to check suspension status');
      }
    };

    checkSuspensionStatus();
  }, [profile]);

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    try {
      await profileService.reportUser({
        offender_username: formData.offenderUsername,
        description: formData.description
      });
      toast.success('Complaint submitted successfully');
      setFormData({ ...formData, offenderUsername: '', description: '' });
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error('Failed to submit complaint');
    }
  };

  const handleQuitSubmit = async (e) => {
    e.preventDefault();
    try {
      const reason = formData.reason === 'other' ? formData.otherReason : formData.reason;
      await accountService.requestQuit({
        username: formData.username,
        password: formData.password,
        reason: reason
      });
      toast.success('Quit request submitted successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error submitting quit request:', error);
      toast.error('Failed to submit quit request');
    }
  };

  const handlePaySuspensionFine = async () => {
    try {
      await accountService.paySuspensionFine();
      setIsSuspended(false);
      toast.success('Suspension fine paid successfully');
    } catch (error) {
      console.error('Error paying suspension fine:', error);
      toast.error('Failed to pay suspension fine');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleOptionClick = async (option) => {
    setActiveOption(option);
    const token = localStorage.getItem('access_token');
    
    try {
      switch(option) {
        case 'quit':
          await accountService.requestQuit({ token });
          toast.success('Quit request submitted');
          navigate('/login');
          break;
        case 'suspension':
          if (isSuspended) {
            await accountService.paySuspensionFine({ token });
            setIsSuspended(false);
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="requests-page">
      <h1>Requests</h1>
      <div className="requests-container">
        <div className="request-options">
          <button 
            className={`request-option ${activeOption === 'complaint' ? 'active' : ''}`}
            onClick={() => setActiveOption('complaint')}
          >
            File Compliant against User
          </button>
          <button 
            className={`request-option ${activeOption === 'quit' ? 'active' : ''}`}
            onClick={() => handleOptionClick('quit')}
          >
            Quit as User
          </button>
          {isSuspended && (
            <button 
              className={`request-option ${activeOption === 'suspension' ? 'active' : ''}`}
              onClick={() => handleOptionClick('suspension')}
            >
              Pay Suspension fine
            </button>
          )}
        </div>

        {activeOption === 'complaint' && (
          <form className="complaint-form" onSubmit={handleSubmitComplaint}>
            <div className="form-group">
              <label>Your Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Username of offender</label>
              <input
                type="text"
                name="offenderUsername"
                value={formData.offenderUsername}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                maxLength="140"
                required
              />
              <span className="char-count">140 char max*</span>
            </div>

            <button type="submit" className="submit-btn">Submit Compliant</button>
          </form>
        )}

        {activeOption === 'quit' && (
          <form className="quit-form" onSubmit={handleQuitSubmit}>
            <div className="form-group">
              <label>Your Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Reason</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="reason"
                    value="I no longer wish to use this service"
                    onChange={handleChange}
                  />
                  "I no longer wish to use this service"
                </label>
                <label>
                  <input
                    type="radio"
                    name="reason"
                    value="I received too many email notifications"
                    onChange={handleChange}
                  />
                  "I received too many email notifications"
                </label>
                <label>
                  <input
                    type="radio"
                    name="reason"
                    value="I found a better alternative."
                    onChange={handleChange}
                  />
                  "I found a better alternative."
                </label>
                <label>
                  <input
                    type="radio"
                    name="reason"
                    value="This platform is difficult to use."
                    onChange={handleChange}
                  />
                  "This platform is difficult to use."
                </label>
                <label>
                  <input
                    type="radio"
                    name="reason"
                    value="I created a duplicate account."
                    onChange={handleChange}
                  />
                  "I created a duplicate account."
                </label>
                <label className="other-reason">
                  <input
                    type="radio"
                    name="reason"
                    value="other"
                    onChange={handleChange}
                  />
                  Other
                  {formData.reason === 'other' && (
                    <input
                      type="text"
                      name="otherReason"
                      placeholder="please specify"
                      value={formData.otherReason}
                      onChange={handleChange}
                      className="other-input"
                    />
                  )}
                </label>
              </div>
            </div>

            <button type="submit" className="submit-btn">Submit</button>
          </form>
        )}

        {activeOption === 'suspension' && (
          <div className="suspension-info">
            <h2>{isSuspended ? 'Pay Suspension Fine' : 'No Suspension Fine Due'}</h2>
            <p>
              {isSuspended 
                ? 'You currently have an outstanding suspension fine. Please pay to restore your account.'
                : 'Your account is in good standing. No suspension fines are due.'}
            </p>
            {isSuspended && (
              <button 
                className="submit-btn"
                onClick={() => handleOptionClick('suspension')}
              >
                Pay Fine
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;