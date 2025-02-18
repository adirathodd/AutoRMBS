import React, { useState } from 'react';
import axios from 'axios';

function Upload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setError('');
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get('http://localhost:8000/download', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });
      // Create a blob URL for the downloaded file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'output.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      setError(err.response?.data.detail || 'Error downloading file');
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
              <input 
                className="form-input" 
                type="file" 
                accept="application/pdf" 
                onChange={handleFileChange} 
                required 
              />
            </div>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Processing...' : 'Upload and Process'}
            </button>
          </form>
          {loading && (
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
          )}
          {result && (
            <div className="card" style={{ marginTop: '3%' }}>
              <h2>Scrape Result:</h2>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
          {/* Excel Download Button */}
          {result && 
            <button 
            className="primary-button" 
            style={{ marginTop: '1rem' }} 
            onClick={handleDownload}
          >
            Download Excel
          </button>
          }
        </div>
      </section>
    </div>
  );
}

export default Upload;