import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // You might need to create this later if you have global styles
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
