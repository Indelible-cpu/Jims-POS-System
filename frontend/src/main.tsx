import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './context/ThemeProvider'



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent massive refetch spikes on focus
      staleTime: 60000, // 1 minute stale time
      retry: 2
    }
  }
})

// Initialize font size
const savedFontSize = localStorage.getItem('fontSize') || 'medium';
document.documentElement.setAttribute('data-font-size', savedFontSize);

// Aggressively wake up the Render server in the background as soon as the app loads
try {
  const backendUrl = import.meta.env.VITE_API_URL || 'https://msikapos.onrender.com';
  // Remove trailing /api if it exists, then append /ping
  let base = backendUrl.endsWith('/api') ? backendUrl.slice(0, -4) : backendUrl;
  if (base.endsWith('/')) base = base.slice(0, -1);
  fetch(base + '/ping', { method: 'GET', mode: 'no-cors' }).catch(() => {});
} catch (e) {
  // ignore
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)

