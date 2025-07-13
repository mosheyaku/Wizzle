import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from 'react-router-dom';
import UploadPDF from './components/UploadPDF';
import DisplayPDFWords from './components/DisplayPDFWords';
import Signup from './components/auth/Signup';
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

function Layout({ children, user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <>
      <header className="top-nav">
        <h1 className="site-title">Wizzle PDF Viewer</h1>
        <nav>
          <Link to="/" className="nav-link">Home</Link>
          {!user && <Link to="/signup" className="nav-link">Sign Up</Link>}
          {user && (
            <>
              <span className="nav-user">{user.first_name}</span>
              <button
                className="nav-link logout-btn"
                onClick={handleLogout}
                type="button"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </header>
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
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
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
              <MainPage pdfId={pdfId} onUploadSuccess={handleUploadSuccess} user={user} />
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
      </Routes>
    </Router>
  );
}

export default App;
