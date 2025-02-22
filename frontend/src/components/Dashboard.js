import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const authToken = localStorage.getItem('authToken');
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authToken) {
      navigate('/login');
    }
  }, [authToken, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  if (!authToken) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className={styles['dashboard-container']}>
      <header className={styles['dashboard-header']}>
        <h1 className={styles['dashboard-title']}>Bookwise</h1>
        <div className={styles['user-section']}>
          <span className={styles['user-email']}>{userEmail}</span>
          <button 
            className={styles['logout-button']}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className={styles['dashboard-content']}>
        <div className={styles['welcome-section']}>
          <h2>Welcome to Your Dashboard</h2>
          <p>Start exploring your personalized book recommendations and manage your reading list.</p>
        </div>

        <div className={styles['features-grid']}>
          <div className={styles['feature-card']}>
            <h3>Book Recommendations</h3>
            <p>Discover new books based on your interests</p>
          </div>
          <div className={styles['feature-card']}>
            <h3>Reading List</h3>
            <p>Track books you want to read</p>
          </div>
          <div className={styles['feature-card']}>
            <h3>Purchase History</h3>
            <p>View your book purchases</p>
          </div>
          <div className={styles['feature-card']}>
            <h3>Reading Progress</h3>
            <p>Monitor your reading goals</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
