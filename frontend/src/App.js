import React, { useState } from 'react';
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

function MainPage({ pdfId, onUploadSuccess, user }) {
  return (
    <div className={`app-container ${pdfId ? 'uploaded' : ''}`}>
      {user && <p className="welcome-message">👋 Hello, {user.first_name}!</p>}
      <UploadPDF onSuccess={onUploadSuccess} />
      {pdfId && (
        <>
          <hr />
          <DisplayPDFWords pdfId={pdfId} />
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
    localStorage.removeItem('user');
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

  const handleUploadSuccess = (data) => {
    setPdfId(data.id);
    localStorage.setItem('pdfId', data.id);
    sessionStorage.setItem('hasUploaded', 'true');
    setHasUploadedThisSession(true);
  };

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
              />
            </Layout>
          }
        />
        <Route
          path="/signup"
          element={
            <Layout user={user} setUser={setUser}>
              <Signup
                onSignupSuccess={(userData) => {
                  setUser(userData);
                  localStorage.setItem('user', JSON.stringify(userData));
                }}
              />
            </Layout>
          }
        />
        <Route
          path="/login"
          element={
            <Layout user={user} setUser={setUser}>
              <Login
                onLoginSuccess={(userData) => {
                  setUser(userData);
                  localStorage.setItem('user', JSON.stringify(userData));
                }}
              />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
