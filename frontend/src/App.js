import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UploadPDF from './components/UploadPDF';
import DisplayPDFWords from './components/DisplayPDFWords';
import Signup from './components/auth/Signup';
import './App.css';

function MainPage({ pdfId, onUploadSuccess }) {
  return (
    <div className={`app-container ${pdfId ? 'uploaded' : ''}`}>
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

function App() {
  const [hasUploadedThisSession, setHasUploadedThisSession] = useState(() => {
    return sessionStorage.getItem('hasUploaded') === 'true';
  });

  const [pdfId, setPdfId] = useState(() => {
    if (sessionStorage.getItem('hasUploaded') === 'true') {
      return localStorage.getItem('pdfId') || null;
    }
    return null;
  });

  const handleUploadSuccess = (data) => {
    setPdfId(data.id);
    localStorage.setItem('pdfId', data.id);
    sessionStorage.setItem('hasUploaded', 'true');
    setHasUploadedThisSession(true);
  };

  return (
    <Router>
      <header className="top-nav">
        <h1 className="site-title">Wizzle PDF Viewer</h1>
        <nav>
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/signup" className="nav-link">Sign Up</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<MainPage pdfId={pdfId} onUploadSuccess={handleUploadSuccess} />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
