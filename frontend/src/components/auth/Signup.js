import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import Popup from '../Popup';

export default function Signup({ onSignupSuccess }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password2: '',
  });

  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password2) {
      return setError('Passwords do not match');
    }

    const submitData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      username: formData.email,
      password: formData.password,
      password2: formData.password2,
    };

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/register/`,
        submitData
      );

      const userData = {
        first_name: res.data.first_name || formData.first_name,
        email: res.data.email || formData.email,
      };

      if (onSignupSuccess) {
        onSignupSuccess(userData);
      }

      setShowPopup(true);
    } catch (err) {
      console.error('Signup error:', err.response);
      setError(
        err.response?.data?.detail ||
        JSON.stringify(err.response?.data) ||
        'Signup failed'
      );
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    navigate('/');
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">Create an Account</h2>
      <form onSubmit={handleSubmit} className="signup-form" noValidate autoComplete="off">
        <input
          type="text"
          name="first_name"
          placeholder="First name"
          value={formData.first_name}
          onChange={handleChange}
          required
          autoComplete="off"
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last name"
          value={formData.last_name}
          onChange={handleChange}
          required
          autoComplete="off"
        />
        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="off"
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
            style={{ WebkitTextSecurity: showPassword ? 'none' : 'disc' }}
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword((prev) => !prev)}
            role="button"
            tabIndex={0}
          >
            {showPassword ? 'Hide' : 'Show'}
          </span>
        </div>

        <div className="password-wrapper">
          <input
            type={showPassword2 ? 'text' : 'password'}
            name="password2"
            placeholder="Confirm password"
            value={formData.password2}
            onChange={handleChange}
            required
            autoComplete="new-password"
            style={{ WebkitTextSecurity: showPassword2 ? 'none' : 'disc' }}
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword2((prev) => !prev)}
            role="button"
            tabIndex={0}
          >
            {showPassword2 ? 'Hide' : 'Show'}
          </span>
        </div>

        {error && <p className="signup-error">{error}</p>}

        <button className="signup-button" type="submit">
          Sign Up
        </button>
      </form>

      {showPopup && (
        <Popup
          message="🎉 Account created successfully!"
          onClose={handlePopupClose}
        />
      )}
    </div>
  );
}
