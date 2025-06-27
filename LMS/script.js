// script.js - Main application script

// Check for login status on every page
document.addEventListener('DOMContentLoaded', function() {
    // Update UI based on login status
    updateLoginDisplay();
    
    // Initialize page-specific functions
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'index.html':
        case '':
            initHomePage();
            break;
        case 'search.html':
            initSearchPage();
            break;
        case 'borrow.html':
            initBorrowPage();
            break;
        case 'history.html':
            initHistoryPage();
            break;
        case 'admin.html':
            initAdminPage();
            break;
    }
});

function updateLoginDisplay() {
    const currentUser = userService.getCurrentUser();
    const userInfoElement = document.getElementById('user-info');
    
    if (userInfoElement) {
        if (currentUser) {
            userInfoElement.innerHTML = `
                Logged in as <strong>${currentUser.username}</strong> (${currentUser.role})
                <button onclick="logoutUser()" class="btn-logout">Logout</button>
            `;
            
            // Show/hide login form
            const loginSection = document.getElementById('login-section');
            if (loginSection) {
                loginSection.style.display = 'none';
            }
            
            // Show/hide register form
            const registerSection = document.getElementById('register-section');
            if (registerSection) {
                registerSection.style.display = 'none';
            }
        } else {
            userInfoElement.innerHTML = 'Not logged in';
            
            // Show login form
            const loginSection = document.getElementById('login-section');
            if (loginSection) {
                loginSection.style.display = 'block';
            }
            
            // Show register form
            const registerSection = document.getElementById('register-section');
            if (registerSection) {
                registerSection.style.display = 'block';
            }
        }
    }
    
    // Update navigation based on user role
    updateNavigation(currentUser);
}

function updateNavigation(user) {
    const adminNavItem = document.querySelector('nav a[href="admin.html"]');
    
    if (adminNavItem) {
        const parentLi = adminNavItem.parentElement;
        if (user && user.role === 'librarian') {
            parentLi.style.display = 'inline';
        } else {
            parentLi.style.display = 'none';
        }
    }
}

// Login functions
function loginUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginMessage = document.getElementById('login-message');
    
    if (!username || !password) {
        loginMessage.textContent = "Username and password are required.";
        loginMessage.style.color = "red";
        return;
    }
    
    const user = userService.authenticateUser(username, password);
    
    if (user) {
        loginMessage.textContent = "Login successful!";
        loginMessage.style.color = "green";
        updateLoginDisplay();
        
        // Clear login form
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    } else {
        loginMessage.textContent = "Invalid username or password.";
        loginMessage.style.color = "red";
    }
}

function logoutUser() {
    userService.logoutUser();
    updateLoginDisplay();
    
    // Redirect to home if on a restricted page
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'admin.html') {
        window.location.href = 'index.html';
    }
}

// Register new user
function registerUser() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const role = document.getElementById('reg-role').value;
    const registerMessage = document.getElementById('register-message');
    
    if (!username || !password) {
        registerMessage.textContent = "Username and password are required.";
        registerMessage.style.color = "red";
        return;
    }
    
    if (password !== confirmPassword) {
        registerMessage.textContent = "Passwords do not match.";
        registerMessage.style.color = "red";
        return;
    }
    
    const success = userService.addUser(username, password, role);
    
    if (success) {
        registerMessage.textContent = "Registration successful! You can now log in.";
        registerMessage.style.color = "green";
        
        // Clear form
        document.getElementById('reg-username').value = '';
        document.getElementById('reg-password').value = '';
        document.getElementById('reg-confirm-password').value = '';
    } else {
        registerMessage.textContent = "Username already exists.";
        registerMessage.style.color = "red";
    }
}

// Home page
function initHomePage() {
    // Nothing specific needed for home page
}

// Search page
function initSearchPage() {
    // Show all books initially
    displaySearchResults(bookService.getBooks());
    
    // Set up search handler
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', function() {
            const query = searchBar.value;
            const results = bookService.searchBooks(query);
            displaySearchResults(results);
        });
    }
}

function displaySearchResults(books) {
    const bookList = document.getElementById('book-list');
    if (!bookList) return;
    
    if (books.length === 0) {
        bookList.innerHTML = '<p>No books found.</p>';
        return;
    }
    
    const currentUser = userService.getCurrentUser();
    let userBorrowedBooks = [];
    
    if (currentUser) {
        userBorrowedBooks = borrowService.getUserBorrowedBooks(currentUser.username)
            .map(b => b.bookId);
    }
    
    bookList.innerHTML = '';
    
    books.forEach(book => {
        const bookElement = document.createElement('div');
        bookElement.className = 'book-item';
        
        const bookStatus = book.available ? 
            '<span class="status-available">Available</span>' : 
            '<span class="status-borrowed">Borrowed</span>';
        
        bookElement.innerHTML = `
            <h3>${book.title}</h3>
            <p>by ${book.author}</p>
            <p>Status: ${bookStatus}</p>
        `;
        
        // Add borrow button if book is available and user is logged in
        if (book.available && currentUser) {
            const borrowButton = document.createElement('button');
            borrowButton.textContent = 'Borrow';
            borrowButton.className = 'borrow-button';
            borrowButton.onclick = function() {
                const result = borrowService.borrowBook(book.id);
                alert(result.message);
                if (result.success) {
                    // Refresh the book list after borrowing
                    displaySearchResults(bookService.searchBooks(document.getElementById('search-bar').value));
                }
            };
            bookElement.appendChild(borrowButton);
        }
        
        // Add return button if user has borrowed this book
        if (currentUser && userBorrowedBooks.includes(book.id)) {
            const returnButton = document.createElement('button');
            returnButton.textContent = 'Return';
            returnButton.className = 'return-button';
            returnButton.onclick = function() {
                const result = borrowService.returnBook(book.id);
                alert(result.message);
                if (result.success) {
                    // Refresh the book list after returning
                    displaySearchResults(bookService.searchBooks(document.getElementById('search-bar').value));
                }
            };
            bookElement.appendChild(returnButton);
        }
        
        bookList.appendChild(bookElement);
    });
}

// Borrow/Return page
function initBorrowPage() {
    const currentUser = userService.getCurrentUser();
    const borrowSection = document.getElementById('borrow-section');
    
    if (!borrowSection) return;
    
    if (!currentUser) {
        borrowSection.innerHTML = `
            <p>Please <a href="index.html">log in</a> to borrow or return books.</p>
        `;
        return;
    }
    
    // Call the display functions if they exist
    if (typeof displayAvailableBooks === 'function') {
        displayAvailableBooks();
    }
    if (typeof displayBorrowedBooks === 'function') {
        displayBorrowedBooks();
    }
}
function borrowBookAndRefresh(bookId) {
    const result = borrowService.borrowBook(bookId);
    alert(result.message);
    if (result.success) {
        displayAvailableBooks();
        displayBorrowedBooks();
    }
}

function returnBookAndRefresh(bookId) {
    const result = borrowService.returnBook(bookId);
    alert(result.message);
    if (result.success) {
        displayAvailableBooks();
        displayBorrowedBooks();
    }
}

// History page
function initHistoryPage() {
    const currentUser = userService.getCurrentUser();
    const historySection = document.getElementById('history-section');
    
    if (!historySection) return;
    
    if (!currentUser) {
        historySection.innerHTML = `
            <p>Please <a href="index.html">log in</a> to view your borrowing history.</p>
        `;
        return;
    }
}

// Admin page
function initAdminPage() {
    const currentUser = userService.getCurrentUser();
    const adminSection = document.getElementById('admin-section');
    
    if (!adminSection) return;
    
    // Check if user is librarian
    if (!currentUser || currentUser.role !== 'librarian') {
        alert('Access denied. Only librarians can view this page.');
        window.location.href = 'index.html';
        return;
    }
}

function addBookAndRefresh() {
    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value;
    const adminMessage = document.getElementById('admin-message');
    
    if (!title || !author) {
        adminMessage.textContent = "Title and author are required.";
        adminMessage.style.color = "red";
        return;
    }
    
    const result = bookService.addBook(title, author);
    
    if (result) {
        adminMessage.textContent = `Book "${title}" added successfully.`;
        adminMessage.style.color = "green";
        
        // Clear form
        document.getElementById('book-title').value = '';
        document.getElementById('book-author').value = '';
        
        // Refresh book list
        displayAdminBookList();
    } else {
        adminMessage.textContent = "Failed to add book. It may already exist.";
        adminMessage.style.color = "red";
    }
}

function removeBookAndRefresh(title) {
    if (confirm(`Are you sure you want to remove "${title}"?`)) {
        const result = bookService.removeBook(title);
        const adminMessage = document.getElementById('admin-message');
        
        if (result) {
            adminMessage.textContent = `Book "${title}" removed successfully.`;
            adminMessage.style.color = "green";
            
            // Refresh book list
            displayAdminBookList();
        } else {
            adminMessage.textContent = "Failed to remove book.";
            adminMessage.style.color = "red";
        }
    }
}

function displayAdminBookList() {
    const adminBookList = document.getElementById('admin-book-list');
    if (!adminBookList) return;
    
    const allBooks = bookService.getBooks();
    
    adminBookList.innerHTML = '';
    
    allBooks.forEach(book => {
        const status = book.available ? 
            '<span class="status-available">Available</span>' : 
            '<span class="status-borrowed">Borrowed</span>';
        
        const bookItem = document.createElement('li');
        bookItem.innerHTML = `
            <strong>${book.title}</strong> by ${book.author} - ${status}
            <button onclick="removeBookAndRefresh('${book.title}')">Remove</button>
        `;
        
        adminBookList.appendChild(bookItem);
    });
}

function displayUserList() {
    const userList = document.getElementById('user-list');
    if (!userList) return;
    
    const allUsers = userService.getUsers();
    
    userList.innerHTML = '';
    
    allUsers.forEach(user => {
        const userItem = document.createElement('li');
        userItem.innerHTML = `
            <strong>${user.username}</strong> - ${user.role}
            ${user.role === 'librarian' ? '' : `<button onclick="removeUserAndRefresh('${user.username}')">Remove</button>`}
        `;
        
        userList.appendChild(userItem);
    });
}

function removeUserAndRefresh(username) {
    if (confirm(`Are you sure you want to remove user "${username}"?`)) {
        const result = userService.removeUser(username);
        const adminMessage = document.getElementById('admin-message');
        
        if (result) {
            adminMessage.textContent = `User "${username}" removed successfully.`;
            adminMessage.style.color = "green";
            
            // Refresh user list
            displayUserList();
        } else {
            adminMessage.textContent = "Failed to remove user.";
            adminMessage.style.color = "red";
        }
    }
}

// Make functions globally available
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.registerUser = registerUser;
window.addBookAndRefresh = addBookAndRefresh;
window.removeBookAndRefresh = removeBookAndRefresh;
window.borrowBookAndRefresh = borrowBookAndRefresh;
window.returnBookAndRefresh = returnBookAndRefresh;
window.removeUserAndRefresh = removeUserAndRefresh;