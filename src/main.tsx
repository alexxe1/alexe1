import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/fira-sans-condensed/400.css';
import '@fontsource/fira-sans-condensed/500.css';
import '@fontsource/fira-sans-condensed/600.css';
import './index.css';
import App from './App';

// Si el servidor entrega la app en /krypto/privacy (sin barra final), ir a la página estática de la política
if (/\/krypto\/privacy$/.test(window.location.pathname)) {
  window.location.replace(`${window.location.pathname}/`);
}

// Compatibilidad con el link viejo (HashRouter) de la política de privacidad de Krypto que usa Google Play
if (/^#\/krypto\/privacy/.test(window.location.hash)) {
  window.location.replace('./krypto/privacy/');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
