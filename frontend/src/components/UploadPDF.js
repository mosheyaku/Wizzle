import React, { useState } from 'react';
import axios from 'axios';

export default function UploadPDF({ onSuccess }) {
  const [file, setFile] = useState(null);
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {

      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
      
      const res = await axios.post(`${apiBaseUrl}/api/pdf/upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Upload success:', res.data);
      onSuccess?.(res.data);
      alert("PDF uploaded successfully!");
    } catch (err) {
      console.error('Upload error:', err);
      alert("Failed to upload PDF");
    }
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload PDF</button>
    </div>
  );
}
