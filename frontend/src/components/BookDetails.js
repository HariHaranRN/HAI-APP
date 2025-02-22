import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './BookDetails.module.css';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        setError(null);
        const authToken = localStorage.getItem('authToken');
        const response = await fetch(`/api/books/${id}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Book not found');
          }
          throw new Error('Failed to fetch book details');
        }

        const data = await response.json();
        setBook(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching book:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading) {
    return <div className={styles.loading}>Loading book details...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          Go Back
        </button>
      </div>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <div className={styles.container}>
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        ← Back to Books
      </button>
      
      <div className={styles.bookDetails}>
        <h1 className={styles.title}>{book.title}</h1>
        <div className={styles.metadata}>
          <p className={styles.author}>by {book.author}</p>
          <p className={styles.category}>{book.category}</p>
          <p className={styles.price}>${book.price ? book.price.toFixed(2) : 'N/A'}</p>
        </div>
        {book.description && (
          <div className={styles.description}>
            <h2>Description</h2>
            <p>{book.description}</p>
          </div>
        )}
        
        <div className={styles.reviewSection}>
          <h2>Add a Review</h2>
          <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
            <div className={styles.ratingInput}>
              <label>Rating:</label>
              <select 
                value={rating} 
                onChange={(e) => setRating(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div className={styles.reviewInput}>
              <label>Review:</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write your review here..."
                rows={4}
              />
            </div>
            <button type="submit" className={styles.submitButton}>
              Submit Review
            </button>
          </form>
        </div>

        {book.reviews && book.reviews.length > 0 && (
          <div className={styles.reviewsList}>
            <h2>Reviews</h2>
            {book.reviews.map((review, index) => (
              <div key={index} className={styles.reviewItem}>
                <div className={styles.reviewRating}>Rating: {review.rating}/5</div>
                <p className={styles.reviewText}>{review.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`/api/books/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          rating,
          text: review
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      const updatedBook = await response.json();
      setBook(updatedBook);
      setReview('');
      setRating(5);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    }
  };

export default BookDetails;
