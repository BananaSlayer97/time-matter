import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { GlobalTickProvider } from './context/GlobalTickContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalTickProvider>
      <App />
    </GlobalTickProvider>
  </StrictMode>,
)
