import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './globals.css';
import { ExchangeProvider } from './lib/exchange-context';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ExchangeProvider>
      <App />
    </ExchangeProvider>
  </React.StrictMode>
);
