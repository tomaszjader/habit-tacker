// Service Worker for background notifications
const CACHE_NAME = 'habit-tracker-v1';
const NOTIFICATION_SETTINGS_KEY = 'habit-tracker-notifications';

// Store notification settings in IndexedDB for service worker access
let notificationSettings = {
  enabled: false,
  morningTime: '08:00',
  eveningTime: '20:00'
};

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Handle action clicks
  if (event.action === 'dismiss') {
    return;
  }
  
  // Focus or open the app
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Check if app is already open
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if app is not open
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Show notification from service worker
function showBackgroundNotification(title, body) {
  const options = {
    body: body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'habit-reminder',
    renotify: true,
    requireInteraction: false,
    silent: false,
    actions: [
      {
        action: 'open',
        title: 'Otwórz aplikację',
        icon: '/favicon.svg'
      },
      {
        action: 'dismiss',
        title: 'Zamknij'
      }
    ],
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  return self.registration.showNotification(title, options);
}

// Schedule notifications with specific settings
function scheduleNotificationsWithSettings(settings) {
  if (!settings.enabled) {
    return;
  }

  // Store settings for later use
  notificationSettings = settings;

  const now = new Date();
  
  // Schedule for today and tomorrow
  scheduleNotificationsForDate(new Date(now), settings);
  
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  scheduleNotificationsForDate(tomorrow, settings);
}

// Schedule notifications for a specific date
function scheduleNotificationsForDate(date, settings) {
  const now = new Date();
  
  // Schedule morning notification
  const [morningHour, morningMinute] = settings.morningTime.split(':').map(Number);
  const morningTime = new Date(date);
  morningTime.setHours(morningHour, morningMinute, 0, 0);

  // Schedule evening notification
  const [eveningHour, eveningMinute] = settings.eveningTime.split(':').map(Number);
  const eveningTime = new Date(date);
  eveningTime.setHours(eveningHour, eveningMinute, 0, 0);

  // Only schedule if the time is in the future
  if (morningTime > now) {
    const morningDelay = morningTime.getTime() - now.getTime();
    if (morningDelay < 24 * 60 * 60 * 1000) { // Within 24 hours
      setTimeout(() => {
        showBackgroundNotification('Poranne przypomnienie', 'Czas na poranne nawyki! 🌅');
      }, morningDelay);
    }
  }

  if (eveningTime > now) {
    const eveningDelay = eveningTime.getTime() - now.getTime();
    if (eveningDelay < 24 * 60 * 60 * 1000) { // Within 24 hours
      setTimeout(() => {
        showBackgroundNotification('Wieczorne przypomnienie', 'Czas na wieczorne nawyki! 🌙');
      }, eveningDelay);
    }
  }
}

// Message handling from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATIONS') {
    const settings = event.data.settings;
    scheduleNotificationsWithSettings(settings);
  }
  
  if (event.data && event.data.type === 'UPDATE_SETTINGS') {
    notificationSettings = event.data.settings;
  }
});

// Background sync for notifications (if supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'schedule-notifications') {
    event.waitUntil(scheduleNotificationsWithSettings(notificationSettings));
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'habit-notifications') {
    event.waitUntil(scheduleNotificationsWithSettings(notificationSettings));
  }
});

// Handle push events (for future Web Push implementation)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      showBackgroundNotification(data.title || 'Habit Tracker', data.body || 'Przypomnienie o nawykach')
    );
  }
});