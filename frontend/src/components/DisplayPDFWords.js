import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function DisplayPDFWords({ pdfId }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchText = async () => {
      try {
        const res = await axios.get(`${apiBaseUrl}/api/pdf/${pdfId}/extract/`);
        setPages(res.data.pages);
      } catch (err) {
        console.error('Failed to fetch extracted text:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchText();
  }, [pdfId, apiBaseUrl]);

  if (loading) return <p>Loading text...</p>;

  return (
    <div>
      {pages.map((words, pageIndex) => (
        <div key={pageIndex}>
          <h3>Page {pageIndex + 1}</h3>
          <p>
            {words.map((w, i) => (
              <span
                key={i}
                style={{ marginRight: '5px', cursor: 'pointer' }}
                onClick={() => alert(`You clicked: ${w.word}`)}
              >
                {w.word}
              </span>
            ))}
          </p>
        </div>
      ))}
    </div>
  );
}
