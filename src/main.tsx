import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n/config';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './utils/notifications';

// Register Service Worker for background notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerServiceWorker().catch(console.error);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
