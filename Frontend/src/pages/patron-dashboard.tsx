import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  TextField,
  IconButton,
  Alert
} from '@mui/material';
import PatronNavbar from '../components/PatronNavbar';
import SearchIcon from '@mui/icons-material/Search';
import { returnBook } from './api/api';
interface Book {
  book_id: number;
  title: string;
  author: string;
  cover_image_url: string;
  isbn?: string;
  genre?: string;
  total_copies?: number;
  available_copies?: number;
}

const PatronDashboard: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>(); // Initialize with books
  const [searchTerm, setSearchTerm] = useState(''); // State for search term
  const [selectedBook, setSelectedBook] = useState<Book | null>(null); // State to hold selected book for details
  const [open, setOpen] = useState(false); // State to manage dialog open/close
  const [isBorrowing, setIsBorrowing] = useState<{ [key: number]: boolean }>({});
  const[isReturning,setIsReturning]=useState<{[key:number]:boolean}>({})
  const [borrowedBooks, setBorrowedBooks] = useState<number[]>([]); // State to track borrowed books by their IDs
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/books/');
        if (Array.isArray(response.data)) {
          console.log(response.data)
          setBooks(response.data);
          setFilteredBooks(response.data); // Set filteredBooks when books are fetched
        }
        else if (Array.isArray(response.data.books)) {
          setBooks(response.data.books);
          setFilteredBooks(response.data.books); // Set filteredBooks when books are fetched

        } else {
          console.error('Unexpected response structure:', response.data);
        }
      }
      catch (error) {
        console.error('Error fetching books:', error);
      }
    };
    fetchBooks();
  }, []);
  const handleSearch = (rrr) => {
    const lowercasedTerm = rrr.toLowerCase();
    if (lowercasedTerm === '') {
      setFilteredBooks(books.length > 0 ? books : [])
    } else {
      // Otherwise, filter the books
      const filtered = books.filter((book) =>
        book.title.toLowerCase().includes(lowercasedTerm) ||
        book.author.toLowerCase().includes(lowercasedTerm) ||
        (book.isbn && book.isbn.toString().toLowerCase().includes(lowercasedTerm)) ||
        (book.genre && book.genre.toLowerCase().includes(lowercasedTerm))
      );
      setFilteredBooks(filtered)// Update filteredBooks with the filtered list
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchTerm);
    }
  };
  // const handleDetailsClick = (book: Book) => {
  //   setSelectedBook(book); // Set the selected book for details
  //   setOpen(true); // Open the dialog
  // };


  const handleBorrowClick = async (bookId: number) => {
    // Prevent multiple clicks
    if (isBorrowing[bookId]) return;

    // Set the borrowing state to true
    setIsBorrowing((prev) => ({ ...prev, [bookId]: true }));
        
    try {
      // Send POST request to borrow the book 
      const response = await axios.post('http://localhost:5000/api/loans/borrow', {
        book_id: bookId,
        user_id: 1, // Replace with the actual user ID
        borrow_date: new Date().toISOString(),
        due_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(), // 7 days due date
        action:'borrow'
      });

      if (response.status === 201) {

        setBorrowedBooks((prev) => [...prev, bookId]);

        // Update available copies of the book
        setBooks((prevBooks) => {
          return prevBooks.map((book) =>
            book.book_id === bookId
              ? { ...book, available_copies: (book.available_copies || 1) - 1 }
              : book
          );
        });

        // Update filteredBooks if the borrowed book is in it
        setFilteredBooks((prevFilteredBooks) =>
          prevFilteredBooks?.map((book) =>
            book.book_id === bookId
              ? { ...book, available_copies: (book.available_copies || 1) - 1 }
              : book
          )
        );

        // Show success message
        setSnackbar({ open: true, message: 'Book borrowed successfully!', severity: 'success' });
      } else {
        console.error('Failed to borrow the book:', response);
        setSnackbar({ open: true, message: 'Failed to borrow the book.', severity: 'error' });
      }
    } catch (error) {
      console.error('Error during borrowing:', error);
      setSnackbar({ open: true, message: 'An error occurred while borrowing the book.', severity: 'error' });
    } finally {
      // Reset the borrowing state
      setIsBorrowing((prev) => ({ ...prev, [bookId]: false }));
    }
  };

  const handleReturnClick = async (loanId: number) => {
    // Prevent multiple clicks
    if (isReturning[loanId]) return;
  
    // Set the returning state to true
    setIsReturning((prev) => ({ ...prev, [loanId]: true }));
  
    try {
      // Send POST request to return the book
      const response = await axios.post('http://localhost:5000/api/loans/return', {
        loanId: loanId,
        // other parameters if needed
      });
  
      if (response.status === 200) {
        // Remove the book from borrowedBooks
        setBorrowedBooks((prev) => prev.filter(id => id !== loanId));
  
        // Reset borrowing state for the returned book
        setIsBorrowing((prev) => ({ ...prev, [loanId]: false }));
  
        // Additional logic for updating available copies, etc.
        // ...
  
        // Show success message
        setSnackbar({ open: true, message: 'Book returned successfully!', severity: 'success' });
      } else {
        console.error('Failed to return the book:', response);
        setSnackbar({ open: true, message: 'Failed to return the book.', severity: 'error' });
      }
    } catch (error) {
      console.error('Error during returning:', error);
      setSnackbar({ open: true, message: 'An error occurred while returning the book.', severity: 'error' });
    } finally {
      // Reset the returning state for that loanId
      setIsReturning((prev) => ({ ...prev, [loanId]: false }));
    }
  };
  
  




  const handleClose = () => {
    setOpen(false); // Close the dialog
    setSelectedBook(null); // Clear the selected book
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <PatronNavbar />
      <Container maxWidth="md">
        <Box mt={10}>
          <TextField
            variant="outlined"
            placeholder='Search your books '
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value); // Update search term
              handleSearch(e.target.value); // Call handleSearch to update filteredBooks
            }}
            onKeyPress={handleKeyPress}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => handleSearch(searchTerm)}>
                  <SearchIcon />
                </IconButton>
              ),
            }}
          />

          <Typography variant="h6" color='success' fontFamily={'fantasy'}>Available Books</Typography>
          <Grid container spacing={3}>
            {(filteredBooks || []).map((book) => (
              <Grid item xs={12} sm={6} md={4} key={book.book_id}>
                <Card>
                  <CardContent>
                    <Typography variant="h5">{book.title}</Typography>
                    <Typography variant="subtitle1">by {book.author}</Typography>
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    />
                    <Typography variant="body2" color="textSecondary">
                      Available Copies: {book.available_copies}
                    </Typography>
                    <Box mt={2} sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={
                          (book.available_copies ?? 0) < 1 || isBorrowing[book.book_id]
                        }
                        onClick={() => handleBorrowClick(book.book_id)}
                      >
                        {borrowedBooks.includes(book.book_id) ? 'Borrow' : 'Borrow'}

                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        disabled={
                          !borrowedBooks.includes(book.book_id) || isBorrowing[book.book_id] // Disable if not borrowed or if borrowing in progress
                        }
                        onClick={() => {

                          handleReturnClick(book.book_id) // Call return function if book is borrowed
                        }}
                      >
                        {borrowedBooks.includes(book.book_id) ? 'Return' : 'Return'}
                      </Button>

                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Dialog for displaying book details */}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{selectedBook?.title}</DialogTitle>
          <DialogContent>
            {selectedBook && (
              <Box>
                <Typography variant="h6">Author: {selectedBook.author}</Typography>
                <Typography variant="body1">ISBN: {selectedBook.isbn || 'N/A'}</Typography>
                <Typography variant="body1">Genre: {selectedBook.genre || 'N/A'}</Typography>
                <Typography variant="body1">Total Copies: {selectedBook.total_copies || 'N/A'}</Typography>
                <Typography variant="body1">Available Copies: {selectedBook.available_copies || 'Not Available'}</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">Close</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default PatronDashboard;