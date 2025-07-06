const express = require('express');
const path = require('path');

const app = express();

const port = parseInt(process.env.PORT) || process.argv[3] || 8080;
const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  // Development mode: serve from src directory
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
} else {
  // Production mode: serve from build directory
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
