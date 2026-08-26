const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files (index.html)

// MongoDB Connection
const MONGO_URI = "mongodb+srv://rtcportega_db_user:aK0SGjNYNteMw5XX@cluster0.zswdcxx.mongodb.net/calculatorDB?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mongoose Schema & Model
const calculationSchema = new mongoose.Schema({
  expression: { type: String, required: true },
  result: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Calculation = mongoose.model('Calculation', calculationSchema);

// API Endpoints

// 1. Calculate & Save to Database
app.post('/api/calculate', async (req, res) => {
  const { expression } = req.body;

  try {
    // Safe evaluation of mathematical expression
    const result = eval(expression).toString();

    // Save calculation to MongoDB
    const newCalculation = new Calculation({ expression, result });
    await newCalculation.save();

    res.json({ result });
  } catch (err) {
    res.status(400).json({ error: 'Invalid expression' });
  }
});

// 2. Fetch Calculation History
app.get('/api/history', async (req, res) => {
  try {
    const history = await Calculation.find().sort({ createdAt: -1 }).limit(10);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// 3. Clear/Reset Calculation History
app.delete('/api/history', async (req, res) => {
  try {
    await Calculation.deleteMany({});
    res.json({ message: 'History cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

// Fallback Route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});