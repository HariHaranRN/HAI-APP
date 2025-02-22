import React, { useState } from 'react';
import styles from './BookCard.module.css';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const BookCard = ({ book }) => {
  const navigate = useNavigate();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [error, setError] = useState(null);

  const handleClick = (e) => {
    if (!e.target.closest(`.${styles.reviewButton}`)) {
      navigate(`/book/${book._id}`);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`/api/books/${book._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          text: reviewText,
          rating: parseInt(rating)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      setIsReviewModalOpen(false);
      setReviewText('');
      setRating(5);
      // Refresh the page to show the new review
      window.location.reload();
    } catch (err) {
      setError('Error submitting review. Please try again.');
      console.error('Error:', err);
    }
  };

  return (
    <div className={styles.card} onClick={handleClick} data-testid="book-card">
      <h3 className={styles.title}>{book.title}</h3>
      <p className={styles.author}>by {book.author}</p>
      <p className={styles.category}>{book.category}</p>
      <button 
        className={styles.reviewButton}
        onClick={(e) => {
          e.stopPropagation();
          setIsReviewModalOpen(true);
        }}
      >
        Add Review
      </button>

      <Modal
        isOpen={isReviewModalOpen}
        onRequestClose={() => setIsReviewModalOpen(false)}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h2 className={styles.modalTitle}>Add Review for {book.title}</h2>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmitReview}>
          <div className={styles.ratingContainer}>
            <label>Rating:</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className={styles.ratingSelect}
            >
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Very Good</option>
              <option value="3">3 - Good</option>
              <option value="2">2 - Fair</option>
              <option value="1">1 - Poor</option>
            </select>
          </div>
          <textarea
            placeholder="Write your review here..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className={styles.reviewTextarea}
            required
          />
          <div className={styles.modalButtons}>
            <button type="submit" className={styles.submitButton}>
              Submit Review
            </button>
            <button 
              type="button" 
              onClick={() => setIsReviewModalOpen(false)}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BookCard;
