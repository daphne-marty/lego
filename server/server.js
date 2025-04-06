// server.js
const express = require('express');
const app = express();
const PORT = 8092;

// Basic test endpoint
app.get('/', (req, res) => {
  res.json({ ack: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
