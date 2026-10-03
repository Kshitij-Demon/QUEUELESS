/**
 * QueueLess Service Worker
 * Handles background notifications and tab focus when alerts arrive
 * even if the user has minimized the tab or switched to another window.
 */

const CACHE_NAME = 'queueless-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clean up old caches if any
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        );
      }),
    ])
  );
});

// Handle messages sent from the main window thread
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    event.waitUntil(
      self.registration.showNotification(title, {
        badge: '/favicon.ico',
        icon: '/favicon.ico',
        ...options,
      })
    );
  } else if (event.data.type === 'PING') {
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ status: 'PONG', time: Date.now() });
    }
  }
});

// Handle push events (for web push integration)
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || '🔔 QueueLess Alert';
  const options = {
    body: data.body || 'Your queue position has updated!',
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    tag: data.tag || 'queue-update',
    data: data.data || {},
    requireInteraction: data.requireInteraction || false,
    vibrate: [200, 100, 200, 100, 300],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle clicking on background notifications - focus the applet tab or open it
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If an existing open window is found, focus it
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new window to root
        if (self.clients.openWindow) {
          return self.clients.openWindow('/');
        }
      })
  );
});
