import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { GameSocketProvider } from './context/GameSocketContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameSocketProvider>
      <App />
    </GameSocketProvider>
  </React.StrictMode>
);
