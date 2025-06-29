const express = require('express');
const path = require('path');

const app = express();

const port = parseInt(process.env.PORT) || process.argv[3] || 8080;

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle all other requests by serving the React app's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
