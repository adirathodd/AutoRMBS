import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Header() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    axios.post('http://localhost:8000/logout', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navigation">
      <div className="navigation-wrap">
        <Link to="/" className="logo-link">AutoRMBS</Link>
        <div className="menu">
            <nav>
              <Link to="/about" className="navigation-item">About</Link>
              {token && <Link to="/upload" className="navigation-item">Work</Link>}
              <Link to="/contact" className="navigation-item">Contact</Link>
              {token && <Link to="/profile" className="navigation-item">Profile</Link>}
            </nav>
        </div>
      
          {token ? (
            <button style={{"margin": "0%"}}className="primary-button" onClick={handleLogout}>
              Log Out
            </button>
          ) : (
            <div className='menu'>
              <nav>
              <Link to="/login" className="navigation-item">Log In</Link>
              <Link to="/register" className="navigation-item">Create Account</Link>
              </nav>
            </div>
          )}
      </div>
    </nav>
  );
}

export default Header;