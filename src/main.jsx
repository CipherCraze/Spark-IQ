import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from "@vercel/analytics/react"
import { app } from './firebase/firebaseConfig'

const root = document.getElementById('root');

// Check if Firebase is initialized
if (!app) {
  root.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: system-ui, -apple-system, sans-serif;">
      <h1 style="color: #EF4444;">Error Loading Application</h1>
      <p style="color: #6B7280;">Unable to initialize Firebase. Please check your configuration and try again.</p>
    </div>
  `;
} else {
  // Render the app only if Firebase is initialized
  createRoot(root).render(
    <StrictMode>
      <App />
      <SpeedInsights />
      <Analytics />
    </StrictMode>,
  )
}
