import React from 'react';

import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

import { createRoot } from 'react-dom/client';
import axios from 'axios';
import './services/mockInterceptor';

// Remove the hardcoded Render URL for local development
// axios.defaults.baseURL = 'https://ai-patients-health-management.onrender.com';


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
