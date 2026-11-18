import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Hidden Developer Credits in Console
console.log(
  `%c DELTA: Undercover %c Developed with precision by Dhruv `,
  'background: linear-gradient(135deg, #6366f1, #06b6d4); color: #ffffff; font-weight: 800; font-size: 12px; padding: 4px 8px; border-radius: 4px;',
  'background: #090c12; color: #a5b4fc; font-weight: 600; font-size: 12px; padding: 4px 8px; border-radius: 4px; border: 1px solid #6366f1;'
);
console.log(
  `%c[DELTA PROTOCOL]%c System initialized • Architect: Dhruv • Build: v2.4.0-production`,
  'color: #06b6d4; font-weight: bold;',
  'color: #94a3b8;'
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
