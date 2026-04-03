// Billing Counter System - JavaScript
// Global variables for data storage
let customers = [];
let transactions = [];

// API Base URL - Auto-detect for local or online
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : window.location.origin;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateCustomerDropdown();
    updateDatalists();
    updateCustomerTable();
    updateBillingTable();
    updateDashboard();
});

// Load data from backend API
async function loadData() {
    try {
        const [customersRes, transactionsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/customers`),
            fetch(`${API_BASE_URL}/api/transactions`)
        ]);

        if (!customersRes.ok || !transactionsRes.ok) {
            throw new Error('Unable to load data from backend');
        }

        customers = await customersRes.json();
        transactions = await transactionsRes.json();
    } catch (error) {
        console.error(error);
        // fallback to localStorage if backend not reachable
        const savedCustomers = localStorage.getItem('billingCustomers');
        const savedTransactions = localStorage.getItem('billingTransactions');

        if (savedCustomers) {
            customers = JSON.parse(savedCustomers);
        }
        if (savedTransactions) {
            transactions = JSON.parse(savedTransactions);
        }
    }
}

// Save data to localStorage fallback
function saveData() {
    try {
        localStorage.setItem('billingCustomers', JSON.stringify(customers));
        localStorage.setItem('billingTransactions', JSON.stringify(transactions));
    } catch (err) {
        console.warn('localStorage unavailable', err);
    }
}

// Add Customer Function with validation
function addCustomer() {
    const name = document.getElementById("name").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const area = document.getElementById("area").value.trim();
    const refer = document.getElementById("refer").value.trim();

    // Validation
    if (!name || !mobile) {
        alert("Please enter at least name and mobile number");
        return;
    }

    if (!/^\d{10}$/.test(mobile)) {
        alert("Please enter a valid 10-digit mobile number");
        return;
    }

    let customer = {
        id: Date.now(), // Unique ID
        name: name,
        mobile: mobile,
        area: area,
        refer: refer,
        createdAt: new Date().toISOString()
    };

    customers.push(customer);
    saveData();
    updateCustomerTable();
    updateCustomerDropdown();
    updateDatalists();

    // Clear form
    document.getElementById("name").value = "";
    document.getElementById("mobile").value = "";
    document.getElementById("area").value = "";
    document.getElementById("refer").value = "";

    alert("Customer Added Successfully!");
}

// Unified function to add customer and transaction in one click
async function addCustomerAndTransaction() {
    // Get customer information
    const name = document.getElementById("name").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const area = document.getElementById("area").value.trim();
    const refer = document.getElementById("refer").value.trim();

    // Get transaction information
    const amount = parseFloat(document.getElementById("amount").value);
    const type = document.getElementById("type").value;
    const payment = document.getElementById("payment").value;

    // Validation for customer
    if (!name || !mobile) {
        alert("Please enter customer name and mobile number");
        return;
    }

    if (!/^\d{10}$/.test(mobile)) {
        alert("Please enter a valid 10-digit mobile number");
        return;
    }

    // Validation for transaction
    if (!amount || amount <= 0) {
        alert("Please enter a valid amount greater than 0");
        return;
    }

    // Check if customer already exists
    const existingCustomer = customers.find(c => c.mobile === mobile);
    let customerIndex;

    if (existingCustomer) {
        // Use existing customer
        customerIndex = customers.indexOf(existingCustomer);
        // Optionally update customer info if different
        if (existingCustomer.name !== name || existingCustomer.area !== area || existingCustomer.refer !== refer) {
            existingCustomer.name = name;
            existingCustomer.area = area;
            existingCustomer.refer = refer;
        }
        // Send updated customer to backend
        await fetch(`${API_BASE_URL}/api/customers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(existingCustomer)
        });
    } else {
        // Add new customer (backend persists)
        let newCustomer = {
            name: name,
            mobile: mobile,
            area: area,
            refer: refer
        };

        const customerResp = await fetch(`${API_BASE_URL}/api/customers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCustomer)
        });

        if (!customerResp.ok) {
            throw new Error('Unable to save customer to server');
        }

        const savedCustomer = await customerResp.json();

        customers.push(savedCustomer);
        customerIndex = customers.length - 1;
    }

    // Add transaction for the customer
    let transaction = {
        amount: amount,
        type: type,
        payment: payment,
        timestamp: new Date().toISOString()
    };

    try {
        const transactionResp = await fetch(`${API_BASE_URL}/api/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerId: customers[customerIndex].id,
                amount: amount,
                type: type,
                payment: payment
            })
        });

        if (!transactionResp.ok) {
            throw new Error('Unable to save transaction to server');
        }

        const savedTransaction = await transactionResp.json();
        transactions.push(savedTransaction);
        saveData();

        // Update UI
        updateCustomerTable();
        updateCustomerDropdown();
        updateDatalists();
        updateBillingTable();
        updateDashboard();

        // Clear form
        document.getElementById("name").value = "";
        document.getElementById("mobile").value = "";
        document.getElementById("area").value = "";
        document.getElementById("refer").value = "";
        document.getElementById("amount").value = "";

        alert("Customer and Transaction Added Successfully!");
    } catch (error) {
        console.error(error);
        alert('Failed to save transaction. Using local fallback.');
        transactions.push({
            id: Date.now() + 1,
            customerId: customers[customerIndex].id,
            ...transaction
        });
        saveData();
        updateBillingTable();
        updateDashboard();
    }
}

function updateCustomerTable() {
    let table = document.getElementById("customerTable");
    table.innerHTML = "";

    customers.forEach((c, index) => {
        table.innerHTML += `
            <tr>
                <td>${c.name}</td>
                <td>${c.mobile}</td>
                <td>${c.area}</td>
                <td>${c.refer}</td>
                <td><button onclick="deleteCustomer(${index})" class="delete-btn">Delete</button></td>
            </tr>
        `;
    });
}

function deleteCustomer(index) {
    if (confirm("Are you sure you want to delete this customer?")) {
        customers.splice(index, 1);
        saveData();
        updateCustomerTable();
        updateCustomerDropdown();
        updateDatalists();
        updateBillingTable();
        updateDashboard();
    }
}

function updateCustomerDropdown() {
    // Support both old transaction datalist and & in case of unified form.
    let transactionCustomerDatalist = document.getElementById("transactionCustomerNames");
    if (transactionCustomerDatalist) {
        transactionCustomerDatalist.innerHTML = "";

        customers.forEach((c, index) => {
            transactionCustomerDatalist.innerHTML += `<option value="${c.name} (${c.mobile})">`;
        });
    }

    // If an old select existed, keep it safe
    let customerSelect = document.getElementById("customerSelect");
    if (customerSelect) {
        customerSelect.innerHTML = '<option value="">Select Customer</option>';
        customers.forEach((c, index) => {
            customerSelect.innerHTML += `<option value="${index}">${c.name} (${c.mobile})</option>`;
        });
    }
}

function updateDatalists() {
    // Update customer names datalist
    let customerNamesDatalist = document.getElementById("customerNames");
    customerNamesDatalist.innerHTML = "";

    // Update refer names datalist
    let referNamesDatalist = document.getElementById("referNames");
    referNamesDatalist.innerHTML = "";

    // Get unique names for both datalists
    let uniqueNames = [...new Set(customers.map(c => c.name))];
    let uniqueReferNames = [...new Set(customers.map(c => c.refer).filter(name => name.trim() !== ""))];

    // Populate customer names datalist
    uniqueNames.forEach(name => {
        customerNamesDatalist.innerHTML += `<option value="${name}">`;
    });

    // Populate refer names datalist
    uniqueReferNames.forEach(name => {
        referNamesDatalist.innerHTML += `<option value="${name}">`;
    });
}

function updateDashboard() {
    let cashIn = 0;
    let cashOut = 0;
    let onlinePayments = 0;
    let offlinePayments = 0;

    transactions.forEach(t => {
        if (t.type === "DEPOSIT") {
            cashIn += t.amount;
            if (t.payment === "ONLINE") onlinePayments += t.amount;
            else offlinePayments += t.amount;
        } else {
            cashOut += t.amount;
        }
    });

    document.getElementById("cashIn").innerText = cashIn.toFixed(2);
    document.getElementById("cashOut").innerText = cashOut.toFixed(2);
    document.getElementById("balance").innerText = (cashIn - cashOut).toFixed(2);
    document.getElementById("onlinePayments").innerText = onlinePayments.toFixed(2);
    document.getElementById("offlinePayments").innerText = offlinePayments.toFixed(2);
    document.getElementById("totalTransactions").innerText = transactions.length;
}

function updateBillingTable() {
    let table = document.getElementById("billingTable");
    table.innerHTML = "";

    transactions.forEach((t, index) => {
        let customer = customers[t.customerIndex];
        const date = new Date(t.timestamp).toLocaleString();
        table.innerHTML += `
            <tr>
                <td>${customer ? customer.name : 'Unknown'}</td>
                <td>₹${t.amount}</td>
                <td>${t.type}</td>
                <td>${t.payment}</td>
                <td>${date}</td>
                <td><button onclick="deleteTransaction(${index})" class="delete-btn">Delete</button></td>
            </tr>
        `;
    });
}

function deleteTransaction(index) {
    if (confirm("Are you sure you want to delete this transaction?")) {
        transactions.splice(index, 1);
        saveData();
        updateBillingTable();
        updateDashboard();
    }
}