import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import { App } from '@/app/App'

// Точка входа приложения: монтируем React-дерево в DOM.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
