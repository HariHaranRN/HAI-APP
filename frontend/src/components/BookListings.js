import React, { useState, useEffect } from 'react';
import styles from './BookListings.module.css';
import BookCard from './BookCard';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const BookListings = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    description: '',
    category: ''
  });

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/api/books';
      const params = new URLSearchParams();
      
      if (searchQuery) {
        params.append('q', searchQuery);
      }
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const authToken = localStorage.getItem('authToken');
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }

      const data = await response.json();
      setBooks(data.books);
      setCategories(data.categories);
    } catch (err) {
      setError('Error loading books. Please try again later.');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [searchQuery, selectedCategory]);

  const handleSearchInput = (event) => {
    setSearchInput(event.target.value);
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      setSearchQuery(searchInput);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  const groupBooksByCategory = () => {
    return books.reduce((acc, book) => {
      const category = book.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(book);
      return acc;
    }, {});
  };

  if (loading) {
    return <div className={styles.loading}>Loading books...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  const groupedBooks = groupBooksByCategory();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    window.location.href = '/login';
  };

  const userEmail = localStorage.getItem('userEmail');

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <h1 className={styles.title}>BookWise</h1>
        <div className={styles.userSection}>
          <button 
            onClick={() => setIsModalOpen(true)}
            className={styles.addBookButton}
          >
            Add Book Recommendation
          </button>
          <span className={styles.userEmail}>{userEmail}</span>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>
      <div className={styles.searchSection}>
        <input
          type="text"
          placeholder="Search books by title, author, or description... (Press Enter to search)"
          value={searchInput}
          onChange={handleSearchInput}
          onKeyPress={handleSearchKeyPress}
          className={styles.searchInput}
          data-testid="search-input"
        />
        <div className={styles.categories}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`${styles.categoryButton} ${
                selectedCategory === category ? styles.selected : ''
              }`}
              data-testid={`category-${category}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {Object.keys(groupedBooks).length === 0 ? (
        <div className={styles.noResults} data-testid="no-results">
          No books found. Try adjusting your search criteria.
        </div>
      ) : (
        Object.entries(groupedBooks).map(([category, categoryBooks]) => (
          <div key={category} className={styles.categorySection}>
            <h2 className={styles.categoryTitle}>{category}</h2>
            <div className={styles.booksGrid}>
              {categoryBooks.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          </div>
        ))
      )}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h2 className={styles.modalTitle}>Add Book Recommendation</h2>
        <form onSubmit={async (e) => {
          e.preventDefault();
          try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch('/api/books', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify(newBook)
            });

            if (!response.ok) {
              throw new Error('Failed to add book');
            }

            setIsModalOpen(false);
            setNewBook({
              title: '',
              author: '',
              description: '',
              category: ''
            });
            fetchBooks();
          } catch (err) {
            setError('Error adding book. Please try again.');
            console.error('Error:', err);
          }
        }}>
          <input
            type="text"
            placeholder="Title"
            value={newBook.title}
            onChange={(e) => setNewBook({...newBook, title: e.target.value})}
            className={styles.modalInput}
            required
          />
          <input
            type="text"
            placeholder="Author"
            value={newBook.author}
            onChange={(e) => setNewBook({...newBook, author: e.target.value})}
            className={styles.modalInput}
            required
          />
          <textarea
            placeholder="Description"
            value={newBook.description}
            onChange={(e) => setNewBook({...newBook, description: e.target.value})}
            className={styles.modalTextarea}
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={newBook.category}
            onChange={(e) => setNewBook({...newBook, category: e.target.value})}
            className={styles.modalInput}
            required
          />
          <div className={styles.modalButtons}>
            <button type="submit" className={styles.submitButton}>Add Book</button>
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
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

export default BookListings;
