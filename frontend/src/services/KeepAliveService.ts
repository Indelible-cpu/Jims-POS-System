/**
 * KeepAliveService
 * Pings the backend every 10 minutes to prevent Render.com (free tier)
 * from spinning down the server due to inactivity.
 * Only runs when the browser tab is visible and the network is online.
 */

const PING_URL = (() => {
  const base = (import.meta.env.VITE_API_URL as string) || 'https://msikapos.onrender.com';
  const root = base.replace(/\/api\/?$/, ''); // Strip trailing /api if present
  return `${root}/ping`;
})();

const INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

let timer: ReturnType<typeof setInterval> | null = null;

async function ping() {
  if (!navigator.onLine || document.visibilityState === 'hidden') return;
  try {
    await fetch(PING_URL, { method: 'GET', cache: 'no-store' });
    console.debug('🏓 Keep-alive ping sent');
  } catch {
    // Silently ignore — offline or server waking up
  }
}

function start() {
  if (timer) return; // Already running
  // Fire once immediately on start to wake server ASAP
  ping();
  timer = setInterval(ping, INTERVAL_MS);

  // Pause when tab is hidden, resume when visible
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      ping(); // immediate ping when tab comes back into focus
    }
  });
}

function stop() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

export const KeepAliveService = { start, stop };
