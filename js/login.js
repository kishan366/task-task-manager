// Initialize dark mode
function initializeDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

initializeDarkMode();

// Function to verify if user credentials match our data
function loginUser(email, password) {
    let users = localStorage.getItem('users');
    if (users) {
        users = JSON.parse(users);
    } else {
        users = [];
    }

    // Look for a matching user account
    const matchedUser = users.find(function(user) {
        return user.email === email && user.password === password;
    });

    if (matchedUser) {
        // Create session data for the logged-in user
        const currentUser = {
            name: matchedUser.name,
            email: matchedUser.email
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        return true;
    }
    
    return false;
}

// Handle Login Form Submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Check login details
    if (loginUser(email, password)) {
        alert('Login successful!');
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid email or password. Please try again.');
    }
});