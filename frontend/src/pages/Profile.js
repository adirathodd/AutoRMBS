import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:8000/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch profile.');
      }
    };
    fetchProfile();
  }, [token]);

  return (
    <div>
      <section className="hero">
        <h1>User Profile</h1>
      </section>
      <section className="section">
        <div className="container">
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {profile ? (
            <div>
              <p><strong>Username:</strong> {profile.username}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>First Name:</strong> {profile.first_name}</p>
              <p><strong>Last Name:</strong> {profile.last_name}</p>
            </div>
          ) : (
            <p>Loading profile...</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default Profile;