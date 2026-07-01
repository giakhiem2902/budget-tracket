import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Default to dark mode; only override if user explicitly chose light
const saved = localStorage.getItem('theme')
if (saved !== 'light') {
  document.documentElement.classList.add('dark')
  if (!saved) localStorage.setItem('theme', 'dark')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
