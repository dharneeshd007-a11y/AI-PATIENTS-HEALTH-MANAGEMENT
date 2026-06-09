import React from 'react';

import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
