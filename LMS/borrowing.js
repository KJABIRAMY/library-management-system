// borrowing.js - Manage book borrowing and returns

function getBorrowedBooks() {
    return JSON.parse(localStorage.getItem('borrowedBooks')) || [];
}

function saveBorrowedBooks(borrowedBooks) {
    localStorage.setItem('borrowedBooks', JSON.stringify(borrowedBooks));
}

function borrowBook(bookId) {
    const currentUser = userService.getCurrentUser();
    if (!currentUser) {
        return { success: false, message: "Please log in to borrow books." };
    }

    const book = bookService.getBookById(bookId);
    if (!book) {
        return { success: false, message: "Book not found." };
    }
    
    if (!book.available) {
        return { success: false, message: "This book is not available for borrowing." };
    }

    const userBorrowedBooks = getUserBorrowedBooks(currentUser.username);
    const borrowLimit = userService.getBorrowLimit(currentUser.role);

    if (userBorrowedBooks.length >= borrowLimit) {
        return { success: false, message: `Borrowing limit reached (${borrowLimit} books for ${currentUser.role} membership).` };
    }

    // Update book availability
    const updateSuccess = bookService.updateBookAvailability(bookId, false);
    if (!updateSuccess) {
        return { success: false, message: "Failed to update book availability." };
    }

    // Add to borrowed books
    const borrowedBooks = getBorrowedBooks();
    borrowedBooks.push({ 
        bookId, 
        username: currentUser.username, 
        borrowDate: new Date().toISOString(), 
        returnDate: null 
    });
    saveBorrowedBooks(borrowedBooks);

    return { success: true, message: `Successfully borrowed: ${book.title}` };
}

function returnBook(bookId) {
    const currentUser = userService.getCurrentUser();
    if (!currentUser) {
        return { success: false, message: "Please log in to return books." };
    }

    let borrowedBooks = getBorrowedBooks();
    const bookIndex = borrowedBooks.findIndex(b => 
        b.bookId === bookId && 
        b.username === currentUser.username && 
        !b.returnDate
    );

    if (bookIndex === -1) {
        return { success: false, message: "You haven't borrowed this book." };
    }

    // Update the borrowed book record
    borrowedBooks[bookIndex].returnDate = new Date().toISOString();
    saveBorrowedBooks(borrowedBooks);

    // Update book availability
    const updateSuccess = bookService.updateBookAvailability(bookId, true);
    if (!updateSuccess) {
        return { success: false, message: "Failed to update book availability." };
    }

    return { success: true, message: "Book returned successfully." };
}

function getUserBorrowedBooks(username) {
    if (!username) return [];
    return getBorrowedBooks().filter(b => b.username === username && !b.returnDate);
}

function getUserBorrowingHistory(username) {
    if (!username) return [];
    return getBorrowedBooks().filter(b => b.username === username);
}

// Export functions
window.borrowService = {
    borrowBook,
    returnBook,
    getUserBorrowedBooks,
    getUserBorrowingHistory
};