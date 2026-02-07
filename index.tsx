
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// One-time cleanup for Cloudinary migration
const CLOUDINARY_CLEANUP_KEY = 'cloudinary_migration_v1';
if (!localStorage.getItem(CLOUDINARY_CLEANUP_KEY)) {
  // Clear all old storage to remove base64 media and free up quota
  localStorage.clear();
  sessionStorage.clear();
  // Mark cleanup as done
  localStorage.setItem(CLOUDINARY_CLEANUP_KEY, 'true');
  console.log('Cloudinary Migration: Browser storage cleaned.');
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Critical Error: Could not find root element to mount to. Ensure <div id='root'></div> exists in index.html");
  document.body.innerHTML = `<div style="color: red; padding: 20px; font-family: sans-serif;">
    <h1>Mounting Error</h1>
    <p>Could not find root element. Please check index.html for &lt;div id="root"&gt;&lt;/div&gt;</p>
  </div>`;
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
