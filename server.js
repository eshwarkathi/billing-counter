const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Production vs Local database path
const DB_PATH = process.env.NODE_ENV === 'production' && process.env.RENDER === 'true'
  ? '/app/data/db.json'
  : path.join(__dirname, 'db.json');

// Ensure data directory exists in production
//if (!fs.existsSync(path.dirname(DB_PATH))) {
 // fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
//}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

function readDB() {
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(raw);
}

//function writeDB(data) {
  //fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
//}

app.get('/api/customers', (req, res) => {
  const db = readDB();
  res.json(db.customers);
});

app.post('/api/customers', (req, res) => {
  const { name, mobile, area, refer } = req.body;
  if (!name || !mobile) {
    return res.status(400).json({ message: 'name and mobile are required' });
  }

  const db = readDB();
  let customer = db.customers.find(c => c.mobile === mobile);

  if (customer) {
    customer.name = name;
    customer.area = area || customer.area;
    customer.refer = refer || customer.refer;
    customer.updatedAt = new Date().toISOString();
  } else {
    customer = {
      id: Date.now(),
      name,
      mobile,
      area: area || '',
      refer: refer || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.customers.push(customer);
  }

  writeDB(db);
  res.json(customer);
});

app.get('/api/transactions', (req, res) => {
  const db = readDB();
  res.json(db.transactions);
});

app.post('/api/transactions', (req, res) => {
  const { customerId, amount, type, payment } = req.body;
  if (customerId == null || !amount || !type || !payment) {
    return res.status(400).json({ message: 'customerId, amount, type, payment are required' });
  }

  const db = readDB();
  const customer = db.customers.find(c => c.id === customerId);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  const transaction = {
    id: Date.now(),
    customerId,
    amount,
    type,
    payment,
    timestamp: new Date().toISOString()
  };

  db.transactions.push(transaction);
  writeDB(db);

  res.json(transaction);
});

// Serve index.html for all non-API routes (client-side routing support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
