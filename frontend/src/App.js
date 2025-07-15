import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import UploadPDF from './components/UploadPDF';
import DisplayPDFWords from './components/DisplayPDFWords';
import Signup from './components/auth/Signup';
import Login from './components/auth/Login';
import './App.css';
import axios from 'axios';

function MainPage({ pdfId, onUploadSuccess, user, accessToken }) {
  return (
    <div className={`app-container ${pdfId ? 'uploaded' : ''}`}>
      {user && <p className="welcome-message">👋 Hello, {user.first_name}!</p>}
      <UploadPDF onSuccess={onUploadSuccess} />
      {pdfId && (
        <>
          <hr />
          <DisplayPDFWords pdfId={pdfId} accessToken={accessToken} />
        </>
      )}
    </div>
  );
}

function ConfirmLogoutPopup({ onConfirm, onCancel }) {
  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <p>Are you sure you want to log out?</p>
        <div className="popup-actions">
          <button onClick={onConfirm} className="btn confirm">Yes, Logout</button>
          <button onClick={onCancel} className="btn cancel">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function Layout({ children, user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const confirmLogout = () => {
    localStorage.clear();
    setUser(null);
    setShowLogoutPopup(false);
    navigate('/');
  };

  return (
    <>
      <header className="top-nav">
        <h1 className="site-title">Wizzle PDF Viewer</h1>
        <nav>
          <Link to="/" className="nav-link">Home</Link>
          {!user && location.pathname !== '/login' && (
            <Link to="/login" className="nav-link">Login</Link>
          )}
          {!user && location.pathname !== '/signup' && (
            <Link to="/signup" className="nav-link">Sign Up</Link>
          )}
          {user && (
            <>
              <span className="nav-user">{user.first_name}</span>
              <button
                className="nav-link logout-btn"
                onClick={() => setShowLogoutPopup(true)}
                type="button"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </header>

      {showLogoutPopup && (
        <ConfirmLogoutPopup
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutPopup(false)}
        />
      )}

      <main>{children}</main>
    </>
  );
}

function App() {
  const [hasUploadedThisSession, setHasUploadedThisSession] = useState(() =>
    sessionStorage.getItem('hasUploaded') === 'true'
  );

  const [pdfId, setPdfId] = useState(() => {
    if (sessionStorage.getItem('hasUploaded') === 'true') {
      return localStorage.getItem('pdfId') || null;
    }
    return null;
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (!parsed || !parsed.first_name) {
        localStorage.removeItem('user');
        return null;
      }
      return parsed;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken') || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken') || null);

  const handleUploadSuccess = (data) => {
    setPdfId(data.id);
    localStorage.setItem('pdfId', data.id);
    sessionStorage.setItem('hasUploaded', 'true');
    setHasUploadedThisSession(true);
  };

  const handleLoginSignupSuccess = (userData, tokens) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (tokens) {
      setAccessToken(tokens.access);
      setRefreshToken(tokens.refresh);
      localStorage.setItem('accessToken', tokens.access);
      localStorage.setItem('refreshToken', tokens.refresh);
    }
  };

  useEffect(() => {
    const storedAccess = localStorage.getItem('accessToken');
    const storedRefresh = localStorage.getItem('refreshToken');

    if (
      user &&
      (!storedAccess || storedAccess !== accessToken || !storedRefresh || storedRefresh !== refreshToken)
    ) {
      console.warn('Tokens mismatched or missing. Logging out user.');
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.clear();
    }
  }, []);

  useEffect(() => {
    const validateToken = async () => {
      try {
        await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/users/me/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch (err) {
        console.warn('Token invalid. Logging out.');
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.clear();
      }
    };

    if (user && accessToken) {
      validateToken();
    }
  }, [user, accessToken]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (refreshToken) {
        try {
          const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/token/refresh/`, {
            refresh: refreshToken,
          });
          setAccessToken(res.data.access);
          localStorage.setItem('accessToken', res.data.access);
          console.log('🔁 Access token refreshed.');
        } catch (err) {
          console.warn('⚠️ Token refresh failed. Logging out.');
          setUser(null);
          setAccessToken(null);
          setRefreshToken(null);
          localStorage.clear();
        }
      }
    }, 12 * 60 * 1000); 

    return () => clearInterval(interval);
  }, [refreshToken]);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout user={user} setUser={setUser}>
              <MainPage
                pdfId={pdfId}
                onUploadSuccess={handleUploadSuccess}
                user={user}
                accessToken={accessToken}
              />
            </Layout>
          }
        />
        <Route
          path="/signup"
          element={
            <Layout user={user} setUser={setUser}>
              <Signup
                onSignupSuccess={(userData) =>
                  handleLoginSignupSuccess(userData)
                }
              />
            </Layout>
          }
        />
        <Route
          path="/login"
          element={
            <Layout user={user} setUser={setUser}>
              <Login
                onLoginSuccess={(userData, tokens) =>
                  handleLoginSignupSuccess(userData, tokens)
                }
              />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
