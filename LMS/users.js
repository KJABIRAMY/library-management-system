// users.js - User management and authentication

// Default users
const defaultUsers = [
    { username: "admin", role: "librarian", password: "admin123" },
    { username: "user1", role: "regular", password: "user123" },
    { username: "premium1", role: "premium", password: "premium123" }
];

// Borrowing limits by role
const borrowLimits = {
    regular: 2,
    premium: 5,
    librarian: 10
};

function getUsers() {
    const storedUsers = localStorage.getItem('users');
    if (!storedUsers) {
        localStorage.setItem('users', JSON.stringify(defaultUsers));
        return defaultUsers;
    }
    return JSON.parse(storedUsers);
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function authenticateUser(username, password) {
    if (!username || !password) return null;
    
    const users = getUsers();
    const user = users.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && 
        u.password === password
    );
    
    if (user) {
        // Create a safe user object without password
        const safeUser = {
            username: user.username,
            role: user.role
        };
        localStorage.setItem('currentUser', JSON.stringify(safeUser));
        return safeUser;
    }
    return null;
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function logoutUser() {
    localStorage.removeItem('currentUser');
}

function addUser(username, password, role = 'regular') {
    if (!username || !password) return false;
    
    const users = getUsers();
    
    // Check if username already exists
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        return false;
    }
    
    users.push({ username, password, role });
    saveUsers(users);
    return true;
}

function removeUser(username) {
    if (!username) return false;
    
    let users = getUsers();
    const initialLength = users.length;
    users = users.filter(u => u.username.toLowerCase() !== username.toLowerCase());
    saveUsers(users);
    return initialLength !== users.length;
}

function getBorrowLimit(userRole) {
    return borrowLimits[userRole] || borrowLimits.regular;
}

// Ensure users exist in local storage
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(defaultUsers));
}

// Export as global object
window.userService = {
    getUsers,
    authenticateUser,
    getCurrentUser,
    logoutUser,
    addUser,
    removeUser,
    getBorrowLimit
};