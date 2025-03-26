const express = require('express');
const app = express();

// Prevent termination
process.on('SIGTERM', () => {
  console.log('Received SIGTERM - keeping server alive');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT - keeping server alive');
});

// Basic route
app.get('/', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Start server
const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
}); 