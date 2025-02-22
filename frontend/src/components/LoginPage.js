import React, { useState } from 'react';
import axios from 'axios';
import styles from './LoginPage.module.css';

const LoginPage = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    form: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    if (!email) {
      return 'Email is required';
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) ? '' : 'Please enter a valid email address';
  };

  const validatePassword = (password) => {
    return password ? '' : 'Password is required';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear form error when user starts typing
    setErrors(prev => ({
      ...prev,
      form: '',
      [name]: ''
    }));
  };

  const validateForm = () => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    setErrors({
      email: emailError,
      password: passwordError,
      form: ''
    });

    return !emailError && !passwordError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({ email: '', password: '', form: '' });

    try {
      const response = await axios.post('/api/login', {
        email: formData.email,
        password: formData.password
      });

      if (response.data.token) {
        onLoginSuccess({
          email: response.data.email,
          token: response.data.token
        });
      } else {
        setErrors(prev => ({
          ...prev,
          form: 'Invalid response from server'
        }));
      }
    } catch (error) {

      if (error.response) {
        // Server responded with an error
        const errorMessage = error.response.data?.error || 'An error occurred during login';
        
        if (error.response.status === 401) {
          setErrors(prev => ({
            ...prev,
            form: 'Invalid email or password'
          }));
        } else if (error.response.status === 400) {
          setErrors(prev => ({
            ...prev,
            form: errorMessage
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            form: errorMessage
          }));
        }
      } else if (error.request) {
        // Request was made but no response
        setErrors(prev => ({
          ...prev,
          form: 'Unable to connect to the server. Please check your connection.'
        }));
      } else {
        // Something else went wrong
        setErrors(prev => ({
          ...prev,
          form: 'An unexpected error occurred. Please try again.'
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['login-container']}>
      <div className={styles['login-box']}>
        <h2 className={styles['login-title']}>Log in to your account</h2>
        <form onSubmit={handleSubmit} noValidate>
          {errors.form && (
            <p className={styles['error-message']} role="alert">
              {errors.form}
            </p>
          )}
          
          <div className={styles['form-group']}>
            <label htmlFor="email" className={styles['form-label']}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`${styles['form-input']} ${errors.email ? styles.error : ''}`}
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => {
                const emailError = validateEmail(formData.email);
                setErrors(prev => ({ ...prev, email: emailError }));
              }}
              required
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p className={styles['error-message']} id="email-error" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="password" className={styles['form-label']}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={`${styles['form-input']} ${errors.password ? styles.error : ''}`}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => {
                const passwordError = validatePassword(formData.password);
                setErrors(prev => ({ ...prev, password: passwordError }));
              }}
              required
              aria-required="true"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && (
              <p className={styles['error-message']} id="password-error" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            className={styles['submit-button']}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
