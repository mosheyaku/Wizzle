import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Vocabulary.css';

export default function Vocabulary({ accessToken }) {
  const [words, setWords] = useState([]);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/learnwords/mywords/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setWords(res.data);
      } catch (err) {
        console.error('Failed to fetch saved words:', err);
      }
    };

    if (accessToken) {
      fetchWords();
    }
  }, [accessToken]);

  return (
    <div className="vocab-container">
      <h2>Your Saved Words</h2>
      <div className="card-grid">
        {words.map((wordObj) => (
          <div key={wordObj.id} className="flip-card">
            <div className="flip-card-inner">
              <div className="flip-card-front">
                {wordObj.word}
              </div>
              <div className="flip-card-back">
                {wordObj.translation || 'No translation'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
