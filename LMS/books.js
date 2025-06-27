// books.js - Book management and search functionality

// Default books
const defaultBooks = [
    { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", available: true },
    { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", available: true },
    { id: 3, title: "1984", author: "George Orwell", available: true },
    { id: 4, title: "Pride and Prejudice", author: "Jane Austen", available: true },
    { id: 5, title: "The Catcher in the Rye", author: "J.D. Salinger", available: true }
];

function getBooks() {
    const storedBooks = localStorage.getItem('books');
    if (!storedBooks) {
        localStorage.setItem('books', JSON.stringify(defaultBooks));
        return defaultBooks;
    }
    return JSON.parse(storedBooks);
}

function saveBooks(books) {
    localStorage.setItem('books', JSON.stringify(books));
}

function getBookById(id) {
    return getBooks().find(book => book.id === id);
}

function searchBooks(query) {
    if (!query) return getBooks();
    
    query = query.toLowerCase();
    return getBooks().filter(book => 
        book.title.toLowerCase().includes(query) || 
        book.author.toLowerCase().includes(query)
    );
}

function addBook(title, author) {
    if (!title || !author) return false;
    
    const books = getBooks();
    
    // Check if book already exists
    if (books.some(book => book.title.toLowerCase() === title.toLowerCase() && 
                           book.author.toLowerCase() === author.toLowerCase())) {
        return false;
    }
    
    // Generate a new id
    const newId = books.length > 0 ? Math.max(...books.map(book => book.id)) + 1 : 1;
    
    books.push({
        id: newId,
        title: title,
        author: author,
        available: true
    });
    
    saveBooks(books);
    return true;
}

function removeBook(title) {
    if (!title) return false;
    
    const books = getBooks();
    const initialLength = books.length;
    
    const filteredBooks = books.filter(book => book.title !== title);
    
    if (initialLength !== filteredBooks.length) {
        saveBooks(filteredBooks);
        return true;
    }
    
    return false;
}

function updateBookAvailability(bookId, isAvailable) {
    const books = getBooks();
    const book = books.find(b => b.id === bookId);
    
    if (!book) return false;
    
    book.available = isAvailable;
    saveBooks(books);
    return true;
}

// Ensure books exist in local storage
if (!localStorage.getItem('books')) {
    localStorage.setItem('books', JSON.stringify(defaultBooks));
}

// Export as global object
window.bookService = {
    getBooks,
    getBookById,
    searchBooks,
    addBook,
    removeBook,
    updateBookAvailability
};
