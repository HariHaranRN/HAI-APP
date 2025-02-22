import React, { useState } from 'react';
import styles from './SignInPage.module.css';

const SignInPage = ({ onSignInSuccess }) => {
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
    // Using HTML5 email validation pattern
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
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
    
    // Note: This is a placeholder for future backend integration
    // In this stage, we're just simulating the form submission
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just call onSignInSuccess with the email
      onSignInSuccess({ email: formData.email });
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        form: 'An error occurred during sign in. Please try again.'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['signin-container']}>
      <div className={styles['signin-box']}>
        <h2 className={styles['signin-title']}>Sign in to your account</h2>
        <form onSubmit={handleSubmit}>
          {errors.form && (
            <p className={styles['error-message']}>{errors.form}</p>
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
            />
            {errors.email && (
              <p className={styles['error-message']}>{errors.email}</p>
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
            />
            {errors.password && (
              <p className={styles['error-message']}>{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className={styles['submit-button']}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;
