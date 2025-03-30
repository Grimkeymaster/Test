// server.js
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'Web Codes' directory
app.use(express.static(path.join(__dirname, 'Web Codes')));

// PostgreSQL connection
const pool = new Pool({
  user: 'your_db_user', // Replace with your PostgreSQL username
  host: 'db', // Use 'db' if using Docker, or 'localhost' if running locally
  database: 'your_db_name', // Replace with your database name
  password: 'your_db_password', // Replace with your PostgreSQL password
  port: 5432,
});

// Root route
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to the Farming App!</h1>
    <p><a href="login.html">Login</a></p>
    <p><a href="index.html">Register</a></p>
  `);
});

// Endpoint to register a new user
app.post('/api/register', async (req, res) => {
  const { username, password, email, phone, address, gender } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (username, password, email, phone, address, gender) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [username, password, email, phone, address, gender]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Endpoint to get user profile
app.get('/api/user', async (req, res) => {
  const userId = req.query.userId; // Assuming userId is passed as a query parameter
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).send('User  not found');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Endpoint to update user data
app.put('/api/user', async (req, res) => {
  const { userId, username, email, phone, address, gender, photoUrl } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET username = $1, email = $2, phone = $3, address = $4, gender = $5, photo_url = $6 WHERE id = $7 RETURNING *',
      [username, email, phone, address, gender, photoUrl, userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Endpoint to get transactions for a specific user
app.get('/api/transactions', async (req, res) => {
  const userId = req.query.userId; // Assuming userId is passed as a query parameter
  try {
    const result = await pool.query('SELECT * FROM transactions WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Endpoint to add a transaction
app.post('/api/transactions', async (req, res) => {
  const { txnId, vegetableName, date, weight, earning, userId } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO transactions (txn_id, vegetable_name, date, weight, earning, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [txnId, vegetableName, date, weight, earning, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Endpoint to get cart items for a specific user
app.get('/api/cart', async (req, res) => {
  const userId = req.query.userId; // Assuming userId is passed as a query parameter
  try {
    const result = await pool.query('SELECT * FROM cart WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Endpoint to update cart items
app.put('/api/cart', async (req, res) => {
  const { userId, items } = req.body; // items is an array of cart items
  try {
    // Clear existing cart for the user
    await pool.query('DELETE FROM cart WHERE user_id = $1', [userId]);

    // Insert updated cart items
    const insertPromises = items.map(item => {
      return pool.query(
        'INSERT INTO cart (user_id, item_id, quantity) VALUES ($1, $2, $3)',
        [userId, item.id, item.quantity]
      );
    });

    await Promise.all(insertPromises);
    res.status(200).send('Cart updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Endpoint to checkout
app.post('/api/checkout', async (req, res) => {
  const { userId } = req.body; // Assuming userId is passed in the request body
  try {
    // Here you would handle the payment processing logic
    // For now, just clear the cart
    await pool.query('DELETE FROM cart WHERE user_id = $1', [userId]);
    res.status(200).send('Order placed successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});