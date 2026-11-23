import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Extensible route mapping for future phases */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
