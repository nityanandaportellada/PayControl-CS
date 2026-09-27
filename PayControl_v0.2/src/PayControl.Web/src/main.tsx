// Importa as funções, componentes ou dados utilizados por este módulo.
import React from 'react';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { createRoot } from 'react-dom/client';
// Importa as funções, componentes ou dados utilizados por este módulo.
import App from './App';
// Importa as funções, componentes ou dados utilizados por este módulo.
import './styles.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode>
<App />
</React.StrictMode>);
