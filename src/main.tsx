import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Limpiar filtros viejos del localStorage para demo (v2)
const FILTER_VERSION = 'v3';
if (localStorage.getItem('easyparker:filter-version') !== FILTER_VERSION) {
  localStorage.removeItem('easyparker:filtros');
  localStorage.setItem('easyparker:filter-version', FILTER_VERSION);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
