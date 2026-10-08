import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Si copiaste tus carpetas de estilos CSS a src/assets o public:
// import './assets/estilo/registrostyle.css'
// import './assets/estilo/bas.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)