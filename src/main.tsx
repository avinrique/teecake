import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { TypographyProvider } from './context/TypographyContext';
import { EditModeProvider } from './context/EditModeContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EditModeProvider>
      <TypographyProvider>
        <App />
      </TypographyProvider>
    </EditModeProvider>
  </StrictMode>,
);
