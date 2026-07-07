function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert('Access Denied. Please login first!');
        window.location.href = 'index.html';
        return null;
    }
    return JSON.parse(currentUser);
}

function initializeDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    const toggle = document.getElementById('darkModeToggle');
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        if (toggle) {
            toggle.classList.add('active');
        }
    } else {
        document.body.classList.remove('dark-mode');
        if (toggle) {
            toggle.classList.remove('active');
        }
    }
}

function toggleDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    const newDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', newDarkMode);
    initializeDarkMode();
}

function saveProfileSettings(e) {
    e.preventDefault();

    const updatedName = document.getElementById('settingsName').value.trim();
    const updatedCurrency = document.getElementById('settingsCurrency').value;

    if (!updatedName) {
        alert('Name field cannot be left blank.');
        return;
    }

    activeUser.name = updatedName;
    localStorage.setItem('currentUser', JSON.stringify(activeUser));
    localStorage.setItem('currency_' + activeUser.email, updatedCurrency);

    let usersList = localStorage.getItem('users');
    if (usersList) {
        usersList = JSON.parse(usersList);
        usersList = usersList.map(function(user) {
            if (user.email === activeUser.email) {
                user.name = updatedName;
            }
            return user;
        });
        localStorage.setItem('users', JSON.stringify(usersList));
    }

    document.getElementById('userDisplay').textContent = updatedName;
    alert('Changes saved successfully!');
    
    setTimeout(function() {
        window.location.href = 'dashboard.html';
    }, 500);
}

function executeSignOut() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currency_' + (activeUser ? activeUser.email : ''));
    setTimeout(function() {
        window.location.href = '/';
    }, 100);
}

window.executeSignOut = executeSignOut;
window.toggleDarkMode = toggleDarkMode;

const activeUser = checkAuth();

initializeDarkMode();

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        executeSignOut();
    });
}

const darkModeToggle = document.getElementById('darkModeToggle');
if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
}

if (activeUser) {
    document.getElementById('userDisplay').textContent = activeUser.name;
    document.getElementById('settingsName').value = activeUser.name;
    
    const savedCurrency = localStorage.getItem('currency_' + activeUser.email);
    if (savedCurrency) {
        document.getElementById('settingsCurrency').value = savedCurrency;
    }

    document.getElementById('settingsForm').addEventListener('submit', saveProfileSettings);
}