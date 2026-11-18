import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Developer Credits in Console
console.log(
  `%c DELTA: Undercover %c Designed and developed by DHRUV ITWALA `,
  'background: linear-gradient(135deg, #6366f1, #06b6d4); color: #ffffff; font-weight: 800; font-size: 13px; padding: 5px 10px; border-radius: 4px;',
  'background: #090c12; color: #a5b4fc; font-weight: 700; font-size: 13px; padding: 5px 10px; border-radius: 4px; border: 1px solid #6366f1;'
);
console.log(
  `%c🌐 Portfolio :%c https://dhruv-itwala-portfolio.onrender.com/\n` +
  `%c💻 GitHub    :%c https://github.com/Dhruv-Itwala\n` +
  `%c💼 LinkedIn  :%c https://www.linkedin.com/in/dhruv-itwala/\n` +
  `%c📸 Instagram :%c https://www.instagram.com/itwala_dhruv\n` +
  `%c💬 WhatsApp  :%c https://api.whatsapp.com/send/?phone=9104438800\n` +
  `%c▶️ YouTube   :%c https://youtube.com/@dhruvitwala`,
  'color: #06b6d4; font-weight: bold;', 'color: #94a3b8;',
  'color: #06b6d4; font-weight: bold;', 'color: #94a3b8;',
  'color: #06b6d4; font-weight: bold;', 'color: #94a3b8;',
  'color: #06b6d4; font-weight: bold;', 'color: #94a3b8;',
  'color: #06b6d4; font-weight: bold;', 'color: #94a3b8;',
  'color: #06b6d4; font-weight: bold;', 'color: #94a3b8;'
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
