import React, { useState } from 'react';
import UploadPDF from './components/UploadPDF';
import DisplayPDFWords from './components/DisplayPDFWords';

function App() {
  const [pdfId, setPdfId] = useState(null);

  const handleUploadSuccess = (data) => {
    setPdfId(data.id); 
  };

  return (
    <div>
      <h1>Wizzle PDF Uploader & Viewer</h1>

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
