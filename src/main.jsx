// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'


// Handle initial load for GitHub Pages
if (window.location.hostname.includes('github.io') && window.location.pathname !== '/client2/') {
  const path = window.location.pathname.replace('/client2', '');
  window.history.replaceState(null, '', '/client2/#' + path);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)