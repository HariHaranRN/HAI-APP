import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles['landing-container']}>
      <div className={styles['content']}>
        <h1 className={styles['title']}>Bookwise</h1>
        <p className={styles['subtitle']}>Your Personal Book Discovery Platform</p>
        
        <div className={styles['buttons-container']}>
          <button
            className={`${styles['button']} ${styles['login-button']}`}
            onClick={() => navigate('/login')}
          >
            Log In
          </button>
          <button
            className={`${styles['button']} ${styles['signup-button']}`}
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
