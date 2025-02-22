import React, { useState } from 'react';
import axios from 'axios';
import styles from './SignUpPage.module.css';

const SignUpPage = ({ onSignUpSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    // Simplified but effective email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!email) {
      return { isValid: false, error: 'Email is required' };
    }
    
    if (!emailRegex.test(email)) {
      return { 
        isValid: false, 
        error: email.includes('@') 
          ? 'Please enter a valid domain (e.g., example@domain.com)' 
          : 'Please include an @ symbol in the email address'
      };
    }

    const [localPart, domain] = email.split('@');
    
    if (localPart.length > 64) {
      return { isValid: false, error: 'The part before @ cannot exceed 64 characters' };
    }
    
    if (domain.length > 255) {
      return { isValid: false, error: 'The domain name is too long' };
    }

    if (!domain.includes('.')) {
      return { isValid: false, error: 'Please include a valid domain extension (e.g., .com, .org)' };
    }

    return { isValid: true, error: '' };
  };

  const validatePassword = (password) => {
    const hasMinLength = password.length >= 8;
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!password) {
      return { isValid: false, error: 'Password is required' };
    }

    const errors = [];
    if (!hasMinLength) errors.push('be at least 8 characters long');
    if (!hasLetter) errors.push('include letters');
    if (!hasNumber) errors.push('include numbers');
    if (!hasSpecialChar) errors.push('include special characters');

    return {
      isValid: hasMinLength && hasLetter && hasNumber && hasSpecialChar,
      error: errors.length > 0 ? `Password must ${errors.join(', ')}` : ''
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Real-time validation
    if (name === 'email') {
      const { error } = validateEmail(value);
      setErrors(prevState => ({
        ...prevState,
        email: error
      }));
    } else if (name === 'password') {
      const { error } = validatePassword(value);
      setErrors(prevState => ({
        ...prevState,
        password: error
      }));
    } else if (name === 'confirmPassword') {
      setErrors(prevState => ({
        ...prevState,
        confirmPassword: value !== formData.password ? 'Passwords do not match' : ''
      }));
    }
  };

  const validateForm = () => {
    const emailValidation = validateEmail(formData.email);
    const passwordValidation = validatePassword(formData.password);
    const confirmPasswordError = formData.password !== formData.confirmPassword
      ? 'Passwords do not match'
      : '';

    setErrors({
      email: emailValidation.error,
      password: passwordValidation.error,
      confirmPassword: confirmPasswordError
    });

    return emailValidation.isValid && 
           passwordValidation.isValid && 
           !confirmPasswordError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('/api/register', {
        email: formData.email,
        password: formData.password
      });

      // Check if registration was successful (status 201)
      if (response.status === 201) {
        onSignUpSuccess(response.data);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'An error occurred during sign up. Please try again.';
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        setErrors(prevState => ({
          ...prevState,
          email: errorMessage // Email already registered
        }));
      } else if (error.response?.status === 400) {
        // Handle validation errors
        if (errorMessage.includes('email')) {
          setErrors(prevState => ({
            ...prevState,
            email: errorMessage
          }));
        } else if (errorMessage.includes('password')) {
          setErrors(prevState => ({
            ...prevState,
            password: errorMessage
          }));
        }
      } else {
        // Generic error handling
        setErrors(prevState => ({
          ...prevState,
          email: errorMessage
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['signup-container']}>
      <div className={styles['signup-box']}>
        <h2 className={styles['signup-title']}>Create your account</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles['form-group']}>
            <label htmlFor="email" className={styles['form-label']}>Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              className={`${styles['form-input']} ${errors.email ? styles.error : ''}`}
              placeholder="Enter your email (e.g., name@example.com)"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => {
                const { error } = validateEmail(formData.email);
                setErrors(prev => ({ ...prev, email: error }));
              }}
            />
            {errors.email && (
              <p className={styles['error-message']}>{errors.email}</p>
            )}
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="password" className={styles['form-label']}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className={`${styles['form-input']} ${errors.password ? styles.error : ''}`}
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => {
                const { error } = validatePassword(formData.password);
                setErrors(prev => ({ ...prev, password: error }));
              }}
            />
            {errors.password && (
              <p className={styles['error-message']}>{errors.password}</p>
            )}
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="confirmPassword" className={styles['form-label']}>Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className={`${styles['form-input']} ${errors.confirmPassword ? styles.error : ''}`}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={() => {
                setErrors(prev => ({
                  ...prev,
                  confirmPassword: formData.password !== formData.confirmPassword
                    ? 'Passwords do not match'
                    : ''
                }));
              }}
            />
            {errors.confirmPassword && (
              <p className={styles['error-message']}>{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            className={styles['submit-button']}
            disabled={isLoading || Object.values(errors).some(error => error)}
          >
            {isLoading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
