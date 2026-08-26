const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path'); // Added path module

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Serve static HTML/CSS/JS files from the current folder
app.use(express.static(__dirname));

// MONGODB CONNECTION STRING
const MONGO_URI = "mongodb+srv://rtcportega_db_user:aK0SGjNYNteMw5XX@cluster0.zswdcxx.mongodb.net/calculatorDB?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB Database!'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// DATABASE SCHEMA & MODEL
const HistorySchema = new mongoose.Schema({
  expression: String,
  result: String,
  date: { type: Date, default: Date.now }
});
const History = mongoose.model('History', HistorySchema);

// API ENDPOINTS
app.post('/api/calculate', async (req, res) => {
  const { expression } = req.body;
  if (!expression) return res.status(400).json({ error: 'No expression provided' });

  try {
    const sanitizedExpression = expression.replace(/[^0-9+\-*/.]/g, '');
    const calculatedResult = Function(`'use strict'; return (${sanitizedExpression})`)();

    const newHistory = new History({
      expression: expression,
      result: calculatedResult.toString()
    });
    await newHistory.save();

    res.json({ result: calculatedResult });
  } catch (error) {
    res.status(400).json({ error: 'Invalid Expression' });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const historyList = await History.find().sort({ date: -1 }).limit(10);
    res.json(historyList);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching history' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Access on Phone via: http://192.168.204.122:${PORT}`);
});