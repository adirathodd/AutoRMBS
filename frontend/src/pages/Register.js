import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      username,
      email,
      password,
      first_name: firstName,
      last_name: lastName
    };
    try {
      setError('');
      await axios.post('http://localhost:8000/register', payload);
      setTimeout(() => {
        navigate('/login');
      }, 500);
    } catch (err) {
      console.error(err);
      setError('Registration failed: ' + (err.response?.data.detail || 'Unknown error'));
    }
  };

  return (
    <div>
      <section className="hero">
        <h1>Create an Account</h1>
      </section>
      <section className="section">
        <div className="container">
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input 
              className="form-input"
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username" 
                required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                className="form-input"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" 
                required />
            </div>
            <div className="form-group">
              <label>First Name</label>
              <input 
                className="form-input"
                type="text" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name" />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input 
                className="form-input"
                type="text" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                className="form-input"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password" 
                required />
            </div>
            <button type="submit" className="primary-button">Submit</button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Register;