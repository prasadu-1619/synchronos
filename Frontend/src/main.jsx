import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

console.log('🚀 main.jsx executing...');
console.log('Root element:', document.getElementById('root'));

try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('✅ React render initiated');
} catch (error) {
  console.error('❌ React render failed:', error);
  document.getElementById('root').innerHTML = '<div style="padding:40px;color:red;"><h1>React Render Error</h1><pre>' + error.stack + '</pre></div>';
}
