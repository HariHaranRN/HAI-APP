import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import Dashboard from './components/Dashboard';
import BookListings from './components/BookListings';
import BookDetails from './components/BookDetails';

function App() {
  const handleAuthSuccess = (userData, navigate) => {
    // Store auth data
    localStorage.setItem('authToken', userData.token);
    localStorage.setItem('userEmail', userData.email);
    
    // Use navigate for programmatic navigation
    navigate('/books');
  };

  // Protected Route wrapper
  const ProtectedRoute = ({ children }) => {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };

  // Wrap components that need navigation
  const LoginWithNav = () => {
    const navigate = useNavigate();
    return (
      <LoginPage 
        onLoginSuccess={(userData) => handleAuthSuccess(userData, navigate)} 
      />
    );
  };

  const SignUpWithNav = () => {
    const navigate = useNavigate();
    return (
      <SignUpPage 
        onSignUpSuccess={(userData) => handleAuthSuccess(userData, navigate)} 
      />
    );
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginWithNav />} />
        <Route path="/signup" element={<SignUpWithNav />} />

        {/* Protected routes */}
        <Route
          path="/books"
          element={
            <ProtectedRoute>
              <BookListings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book/:id"
          element={
            <ProtectedRoute>
              <BookDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={<Navigate to="/books" replace />}
        />

        {/* Catch all unmatched routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
