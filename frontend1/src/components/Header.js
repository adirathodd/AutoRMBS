import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
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
              <Link to="/upload" className="navigation-item">Work</Link>
              <Link to="/contact" className="navigation-item">Contact</Link>
              {token && <Link to="/profile" className="navigation-item">Profile</Link>}
            </nav>
            </div>
          {token ? (
            <button className="primary-button" onClick={handleLogout}>
              Log Out
            </button>
          ) : (
            <>
              <Link to="/login" className="primary-button">Log In</Link>
              <Link to="/register" className="primary-button">Create Account</Link>
            </>
          )}
        
      </div>
    </nav>
  );
}

export default Header;