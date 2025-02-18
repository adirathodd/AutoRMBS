import React, { useState } from 'react';
import axios from 'axios';

function Upload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    // FastAPI /scrape endpoint expects the file field to be named "file"
    formData.append('file', file);
    
    try {
      const response = await axios.post('http://localhost:8000/scrape', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setResult(response.data.scrape_result);
    } catch (err) {
      console.error(err);
      setError(err.response?.data.detail || 'Error uploading file');
    }
  };

  return (
    <div>
      <section className="hero">
        <h1>Upload PDF</h1>
      </section>
      <section className="section">
        <div className="container">
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Choose PDF File</label>
              <input type="file" accept="application/pdf" onChange={handleFileChange} required />
            </div>
            <button type="submit" className="primary-button">Upload and Process</button>
          </form>
          {result && (
            <div className="card">
              <h2>Scrape Result:</h2>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Upload;