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

// Function to get all registered users from Local Storage
function getUsers() {
    let users = localStorage.getItem('users');
    if (users === null) {
        return []; // Return empty array if no users exist yet
    } else {
        return JSON.parse(users);
    }
}

// Function to save a new user to Local Storage
function saveUser(newUser) {
    const users = getUsers();
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
}

// Handle Register Form Submission
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Stop the page from refreshing

    // Grab input values from the form
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;

    const allUsers = getUsers();

    // Check if the email is already taken
    const emailExists = allUsers.some(function(user) {
        return user.email === email;
    });

    if (emailExists) {
        alert('This email is already registered!');
        return;
    }

    // Create a simple user object
    const newUser = {
        id: Date.now(), // Unique ID using timestamp
        name: name,
        email: email,
        password: password
    };

    // Save and redirect to login page
    saveUser(newUser);
    alert('Registration successful! You can now login.');
    window.location.href = 'index.html';
});