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

initializeDarkMode();

function renderChartUI() {
    const barsArea = document.getElementById('chartBarsArea');
    barsArea.innerHTML = '';

    const userList = getTransactions(activeUser.email);
    const currencySymbol = localStorage.getItem('currency_' + activeUser.email) || '$';

    let totalIncome = 0;
    let totalExpense = 0;

    userList.forEach(function(t) {
        const amt = parseFloat(t.amount);
        if (t.type === 'income') totalIncome += amt;
        if (t.type === 'expense') totalExpense += amt;
    });

    const maxVal = Math.max(totalIncome, totalExpense, 100);
    const incomePercent = (totalIncome / maxVal) * 90;
    const expensePercent = (totalExpense / maxVal) * 90;

    // Income Bar with Value Label
    const incomeBar = document.createElement('div');
    incomeBar.className = 'chart-bar-wrapper';
    
    const incomeBarElement = document.createElement('div');
    incomeBarElement.className = 'analysis-bar bar-income';
    incomeBarElement.style.height = (totalIncome > 0 ? incomePercent : 5) + '%';
    
    const incomeLabel = document.createElement('div');
    incomeLabel.className = 'bar-label bar-income-label';
    incomeLabel.innerHTML = `<strong>${currencySymbol}${totalIncome.toFixed(2)}</strong><small>Income</small>`;
    
    incomeBar.appendChild(incomeBarElement);
    incomeBar.appendChild(incomeLabel);
    
    // Expense Bar with Value Label
    const expenseBar = document.createElement('div');
    expenseBar.className = 'chart-bar-wrapper';
    
    const expenseBarElement = document.createElement('div');
    expenseBarElement.className = 'analysis-bar bar-expense';
    expenseBarElement.style.height = (totalExpense > 0 ? expensePercent : 5) + '%';
    
    const expenseLabel = document.createElement('div');
    expenseLabel.className = 'bar-label bar-expense-label';
    expenseLabel.innerHTML = `<strong>${currencySymbol}${totalExpense.toFixed(2)}</strong><small>Expenses</small>`;
    
    expenseBar.appendChild(expenseBarElement);
    expenseBar.appendChild(expenseLabel);

    // Calculate Savings Percentage
    const totalFlow = totalIncome + totalExpense;
    const savingsPercent = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100) : 0;

    // Add Summary Stats
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'chart-summary';
    const summaryText = savingsPercent >= 0 
        ? `Savings Ratio: <strong class="text-success">${savingsPercent.toFixed(1)}%</strong>`
        : `Deficit: <strong class="text-danger">${Math.abs(savingsPercent).toFixed(1)}%</strong>`;
    summaryDiv.innerHTML = summaryText;

    barsArea.appendChild(incomeBar);
    barsArea.appendChild(expenseBar);
    barsArea.appendChild(summaryDiv);
}

function getTransactions(userEmail) {
    let list = localStorage.getItem('transactions');
    if (list) {
        list = JSON.parse(list);
    } else {
        list = [];
    }
    return list.filter(function(item) {
        return item.userEmail === userEmail;
    });
}

function updateFinancialCalculations(items) {
    let incomeSum = 0;
    let expenseSum = 0;

    items.forEach(function(t) {
        const amt = parseFloat(t.amount);
        if (t.type === 'income') {
            incomeSum += amt;
        } else if (t.type === 'expense') {
            expenseSum += amt;
        }
    });

    const netBalance = incomeSum - expenseSum;
    const currencySymbol = localStorage.getItem('currency_' + activeUser.email) || '$';

    document.getElementById('totalBalance').textContent = currencySymbol + netBalance.toFixed(2);
    document.getElementById('totalIncome').textContent = currencySymbol + incomeSum.toFixed(2);
    document.getElementById('totalExpense').textContent = currencySymbol + expenseSum.toFixed(2);
    document.getElementById('totalTransactionsCount').textContent = items.length;
}

function renderDashboardUI() {
    const tbody = document.getElementById('transactionTableBody');
    tbody.innerHTML = '';
    
    let userList = getTransactions(activeUser.email);

    const searchVal = document.getElementById('searchInput').value.toLowerCase();
    const typeFilterVal = document.getElementById('typeFilter').value;

    userList = userList.filter(function(t) {
        const matchesSearch = t.desc.toLowerCase().includes(searchVal) || t.cat.toLowerCase().includes(searchVal);
        const matchesType = (typeFilterVal === 'all') || (t.type === typeFilterVal);
        return matchesSearch && matchesType;
    });

    if (userList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#999; padding:20px;">No Transactions Found</td></tr>`;
        updateFinancialCalculations([]);
        renderChartUI();
        return;
    }

    updateFinancialCalculations(userList);
    renderChartUI();
    const currencySymbol = localStorage.getItem('currency_' + activeUser.email) || '$';

    userList.forEach(function(item) {
        const tr = document.createElement('tr');
        const amtClass = item.type === 'income' ? 'text-success' : 'text-danger';
        const prefix = item.type === 'income' ? '+' : '-';

        tr.innerHTML = `
            <td>${item.date}</td>
            <td><strong>${item.desc}</strong></td>
            <td>${item.cat}</td>
            <td class="${amtClass}">${prefix}${currencySymbol}${parseFloat(item.amount).toFixed(2)}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editTransactionItem(${item.id})" title="Edit">
                    <i class="ri-edit-line"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteTransactionItem(${item.id})" title="Delete">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

const modalOverlay = document.getElementById('transactionModal');
const modalForm = document.getElementById('modalForm');
let editingId = null;

function openTransactionModal(id = null) {
    editingId = id;
    
    if (!modalForm) {
        console.error('Modal form not found');
        return;
    }
    
    if (!modalOverlay) {
        console.error('Modal overlay not found');
        return;
    }
    
    modalForm.reset();
    
    const modalHeader = document.querySelector('.modal-header h2');
    const submitBtn = document.querySelector('.save-transaction-btn');
    
    if (!modalHeader || !submitBtn) {
        console.error('Modal header or submit button not found');
        return;
    }
    
    if (id) {
        modalHeader.textContent = 'Edit Transaction';
        submitBtn.textContent = 'Update Transaction';
        
        let globalList = localStorage.getItem('transactions');
        globalList = globalList ? JSON.parse(globalList) : [];
        const transaction = globalList.find(t => t.id === id);
        
        if (transaction) {
            document.getElementById('modalType').value = transaction.type;
            document.getElementById('modalDesc').value = transaction.desc;
            document.getElementById('modalAmount').value = transaction.amount;
            document.getElementById('modalDate').value = transaction.date;
            document.getElementById('modalCat').value = transaction.cat;
        }
    } else {
        modalHeader.textContent = 'Add Transaction';
        submitBtn.textContent = 'Save Transaction';
        const today = new Date();
        const formattedDate = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        document.getElementById('modalDate').value = formattedDate;
    }
    
    modalOverlay.classList.add('show');
}

function closeTransactionModal() {
    if (modalOverlay) {
        modalOverlay.classList.remove('show');
    }
    editingId = null;
}

function saveModalTransaction(e) {
    e.preventDefault();

    const type = document.getElementById('modalType').value;
    const desc = document.getElementById('modalDesc').value.trim();
    const amount = parseFloat(document.getElementById('modalAmount').value);
    const date = document.getElementById('modalDate').value;
    const cat = document.getElementById('modalCat').value;

    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    let globalList = localStorage.getItem('transactions');
    globalList = globalList ? JSON.parse(globalList) : [];

    if (editingId) {
        globalList = globalList.map(function(t) {
            if (t.id === editingId) {
                return {
                    ...t,
                    desc: desc,
                    cat: cat,
                    amount: amount,
                    type: type,
                    date: date
                };
            }
            return t;
        });
    } else {
        const newTransaction = {
            id: Date.now(),
            userEmail: activeUser.email,
            desc: desc,
            cat: cat,
            amount: amount,
            type: type,
            date: date
        };
        globalList.push(newTransaction);
    }

    localStorage.setItem('transactions', JSON.stringify(globalList));
    
    closeTransactionModal();
    renderDashboardUI();
}

window.editTransactionItem = function(id) {
    openTransactionModal(id);
};

window.deleteTransactionItem = function(id) {
    if (confirm("Delete this transaction?")) {
        let globalList = localStorage.getItem('transactions');
        globalList = globalList ? JSON.parse(globalList) : [];
        
        globalList = globalList.filter(function(t) { return t.id !== id; });
        localStorage.setItem('transactions', JSON.stringify(globalList));
        renderDashboardUI();
    }
};

function clearAllTrackerData() {
    if (confirm("Delete all transactions? This cannot be undone.")) {
        let globalList = localStorage.getItem('transactions');
        globalList = globalList ? JSON.parse(globalList) : [];
        
        globalList = globalList.filter(function(t) { return t.userEmail !== activeUser.email; });
        localStorage.setItem('transactions', JSON.stringify(globalList));
        renderDashboardUI();
    }
}

function executeSignOut() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currency_' + (activeUser ? activeUser.email : ''));
    setTimeout(function() {
        window.location.href = '/';
    }, 100);
}

window.executeSignOut = executeSignOut;

function toggleDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    const newDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', newDarkMode);
    initializeDarkMode();
}

window.toggleDarkMode = toggleDarkMode;

const activeUser = checkAuth();

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        executeSignOut();
    });
}

if (activeUser) {
    document.getElementById('userDisplay').textContent = activeUser.name;
    
    const addTransBtnElement = document.getElementById('addTransBtn');
    if (addTransBtnElement) {
        addTransBtnElement.addEventListener('click', function(e) {
            e.preventDefault();
            openTransactionModal();
        });
    }
    
    const closeModalBtnElement = document.getElementById('closeModalBtn');
    if (closeModalBtnElement) {
        closeModalBtnElement.addEventListener('click', closeTransactionModal);
    }
    
    if (modalForm) {
        modalForm.addEventListener('submit', saveModalTransaction);
    }
    
    const resetDataBtnElement = document.getElementById('resetDataBtn');
    if (resetDataBtnElement) {
        resetDataBtnElement.addEventListener('click', clearAllTrackerData);
    }
    
    const searchInputElement = document.getElementById('searchInput');
    if (searchInputElement) {
        searchInputElement.addEventListener('input', renderDashboardUI);
    }
    
    const typeFilterElement = document.getElementById('typeFilter');
    if (typeFilterElement) {
        typeFilterElement.addEventListener('change', renderDashboardUI);
    }
    
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
    
    window.addEventListener('click', function(e) {
        if (e.target === modalOverlay) closeTransactionModal();
    });

    renderDashboardUI();
}