import React, { useState } from 'react';
import UploadPDF from './components/UploadPDF';
import DisplayPDFWords from './components/DisplayPDFWords';
import './App.css';

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
    <div className={`app-container ${pdfId ? 'uploaded' : ''}`}>
      <h1 className="site-title">Wizzle PDF Uploader & Viewer</h1>
      <UploadPDF onSuccess={handleUploadSuccess} />
      {pdfId && (
        <>
          <hr />
          <DisplayPDFWords pdfId={pdfId} />
        </>
      )}
    </div>
  );
}

export default App;
