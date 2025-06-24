require('dotenv').config();
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Config
const AUTH_DB = path.join(__dirname, 'auth.json');
const LOG_FILE = path.join(__dirname, 'login.log');
const API_KEY = process.env.API_KEY;

if (!API_KEY) throw new Error('API_KEY not set in environment variables!');

// Middleware
app.use(helmet());
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100 // limit request
}));

// API Key Validation
const validateKey = (req, res, next) => {
  const clientKey = req.query.apikey || req.headers['x-api-key'];
  if (clientKey !== API_KEY) {
    return res.status(403).json({ 
      status: 'error',
      message: 'Invalid API Key' 
    });
  }
  next();
};

// Routes
app.get('/logs', validateKey, async (req, res) => {
  try {
    const logs = await fs.readFile(LOG_FILE, 'utf8');
    res.type('text/plain').send(logs);
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to read logs' 
    });
  }
});

app.route('/auth')
  .get(validateKey, async (req, res) => {
    try {
      const data = await fs.readFile(AUTH_DB, 'utf8');
      res.json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to read auth DB' 
      });
    }
  })
  .post(validateKey, async (req, res) => {
    try {
      await fs.writeFile(AUTH_DB, JSON.stringify(req.body, null, 2));
      res.json({ 
        status: 'success',
        message: 'Database updated' 
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to update DB' 
      });
    }
  });

// Clear logs endpoint
app.delete('/logs', validateKey, async (req, res) => {
  try {
    await fs.writeFile(LOG_FILE, '');
    res.json({ 
      status: 'success',
      message: 'Logs cleared' 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to clear logs' 
    });
  }
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
