import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './DisplayPDFWords.css';

export default function DisplayPDFWords({ pdfId }) {
  const [pages, setPages] = useState([]);
  const [paginatedPages, setPaginatedPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem(`currentPage_${pdfId}`);
    return savedPage ? parseInt(savedPage, 10) : 0;
  });
  const [showPopup, setShowPopup] = useState(false);
  const [translatedWord, setTranslatedWord] = useState('');
  const [originalWord, setOriginalWord] = useState('');
  const [loading, setLoading] = useState(true);

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const measureRef = useRef(null);
  const [allWords, setAllWords] = useState([]);

  useEffect(() => {
    const fetchText = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiBaseUrl}/api/pdf/${pdfId}/extract/`);
        setPages(res.data.pages);
        setCurrentPage(() => {
          const savedPage = localStorage.getItem(`currentPage_${pdfId}`);
          return savedPage ? parseInt(savedPage, 10) : 0;
        });
      } catch (err) {
        console.error('Failed to fetch extracted text:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchText();
  }, [pdfId, apiBaseUrl]);

  useEffect(() => {
    const flattened = pages.flat();
    setAllWords(flattened);
  }, [pages]);

  useEffect(() => {
    if (!allWords.length) {
      setPaginatedPages([]);
      return;
    }

    const container = measureRef.current;
    if (!container) return;

    let chunks = [];
    let tempWords = [];

    container.innerHTML = '';
    const maxHeight = container.clientHeight;

    for (let i = 0; i < allWords.length; i++) {
      const wordObj = allWords[i];
      const span = document.createElement('span');
      span.textContent = wordObj.word + ' ';
      span.className = 'measure-word';
      container.appendChild(span);

      tempWords.push(wordObj);

      if (container.scrollHeight > maxHeight) {
        tempWords.pop();
        container.removeChild(span);

        chunks.push(tempWords);
        tempWords = [wordObj];

        container.innerHTML = '';
        const newSpan = document.createElement('span');
        newSpan.textContent = wordObj.word + ' ';
        newSpan.className = 'measure-word';
        container.appendChild(newSpan);
      }
    }
    if (tempWords.length > 0) {
      chunks.push(tempWords);
    }

    setPaginatedPages(chunks);
  }, [allWords]);

  const handleTranslate = async (word) => {
    try {
      const res = await axios.post(`${apiBaseUrl}/api/pdf/translate/`, { word });
      setOriginalWord(word);
      setTranslatedWord(res.data.translated);
      setShowPopup(true);
    } catch (err) {
      console.error('Translation failed:', err);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setTranslatedWord('');
    setOriginalWord('');
  };

  const prevPage = () => {
    setCurrentPage((p) => {
      const newPage = p > 0 ? p - 1 : 0;
      localStorage.setItem(`currentPage_${pdfId}`, newPage);
      return newPage;
    });
  };

  const nextPage = () => {
    setCurrentPage((p) => {
      const newPage = p < paginatedPages.length - 1 ? p + 1 : p;
      localStorage.setItem(`currentPage_${pdfId}`, newPage);
      return newPage;
    });
  };

  if (loading)
    return <p className="book-loading">Loading PDF content...</p>;

  return (
    <>
      <div className="book-container">
        <div className="book-frame">
          <div className="book-page">
            {paginatedPages[currentPage] && (
              <div className="book-text">
                {paginatedPages[currentPage].map((w, i) => (
                  <span
                    key={i}
                    onClick={() => handleTranslate(w.word)}
                    title="Click to translate"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleTranslate(w.word);
                      }
                    }}
                  >
                    {w.word}{' '}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="pagination-buttons">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              aria-label="Previous page"
            >
              ⬅ Previous
            </button>
            <span aria-live="polite" aria-atomic="true">
              Page {currentPage + 1} of {paginatedPages.length || 1}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === paginatedPages.length - 1}
              aria-label="Next page"
            >
              Next ➡
            </button>
          </div>
        </div>
      </div>

      <div
        className="measure-container"
        ref={measureRef}
        aria-hidden="true"
      />

      {showPopup && (
        <div
          className="popup-overlay"
          role="dialog"
          aria-modal="true"
          onClick={closePopup}
          tabIndex={-1}
        >
          <div
            className="popup-card"
            onClick={(e) => e.stopPropagation()}
            tabIndex={0}
          >
            <h2>Translated</h2>
            <p className="original-word">{originalWord}</p>
            <p className="translated-word">{translatedWord}</p>
            <button onClick={closePopup} aria-label="Close translation popup">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
