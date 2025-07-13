import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Popup from '../Popup';

export default function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/token/`,
        {
          username: formData.email,
          password: formData.password,
        }
      );

      localStorage.setItem('accessToken', res.data.access);
      localStorage.setItem('refreshToken', res.data.refresh);

      const userRes = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/me/`,
        {
          headers: {
            Authorization: `Bearer ${res.data.access}`,
          },
        }
      );

      const userData = userRes.data;

      onLoginSuccess(userData);

      setShowPopup(true);
    } catch (err) {
      console.error('Login error:', err.response);

      if (err.response?.status === 401) {
        setError('Invalid email or password.');
      } else {
        setError(
          err.response?.data?.detail ||
            JSON.stringify(err.response?.data) ||
            'Login failed. Please try again.'
        );
      }
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    navigate('/');
  };

  return (
    <div>
      <h2>Login to Your Account</h2>
      <form onSubmit={handleSubmit} noValidate autoComplete="off">
        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="new-password" 
        />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit">Login</button>
      </form>

      {showPopup && (
        <Popup
          message="🎉 Successfully logged in!"
          onClose={handlePopupClose}
        />
      )}
    </div>
  );
}
