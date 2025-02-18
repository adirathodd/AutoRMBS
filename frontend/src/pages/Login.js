import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new URLSearchParams();
    data.append('username', username);
    data.append('password', password);

    try {
      setError('');
      const response = await axios.post('http://localhost:8000/login', data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (response.data && response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        navigate('/profile');
      } else {
        setError('Login failed: No token received.');
      }
    } catch (err) {
      console.error('Login error:', err.response ? err.response.data : err);
      setError('Invalid username or password.');
    }
  };

  return (
    <div>
      <section className="hero">
        <h1>Login</h1>
      </section>
      <section className="section">
        <div className="container">
          <h2>Welcome Back</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input 
                type="text" 
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username" 
                required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password" 
                required />
            </div>
            <button type="submit" className="primary-button">Log In</button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Login;