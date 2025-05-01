
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './integrations/firebase/init'; // Import Firebase initialization

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
