import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Scenery } from './components/Scenery.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Scenery />
    <App />
  </StrictMode>,
)
