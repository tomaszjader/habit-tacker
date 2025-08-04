// Enhanced Service Worker for PWA on Android with splash screen support
const CACHE_NAME = 'habit-tracker-v6'; // Zwiększam wersję cache
const NOTIFICATION_SETTINGS_KEY = 'habit-tracker-notifications';
const DB_NAME = 'HabitTrackerDB';
const DB_VERSION = 2;

// Assets to cache for offline support including splash screen assets
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-192x192-192.png',
  '/icon-512x512-512.png'
];

// Store notification settings and scheduled alarms
let notificationSettings = {
  enabled: false,
  morningTime: '08:00',
  eveningTime: '20:00'
};

let scheduledAlarms = new Map();

// IndexedDB helper functions
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (db.objectStoreNames.contains('settings')) {
        db.deleteObjectStore('settings');
      }
      db.createObjectStore('settings');
    };
  });
}

async function saveSettingsToDB(settings) {
  try {
    const db = await openDB();
    const transaction = db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    
    return new Promise((resolve, reject) => {
      const request = store.put({ value: settings }, 'notifications');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error saving settings to IndexedDB:', error);
    throw error;
  }
}

async function loadSettingsFromDB() {
  try {
    const db = await openDB();
    const transaction = db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    
    return new Promise((resolve, reject) => {
      const request = store.get('notifications');
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : notificationSettings);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error loading settings from IndexedDB:', error);
    return notificationSettings;
  }
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_NAME).then(cache => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Load notification settings
      loadSettingsFromDB().then(settings => {
        notificationSettings = settings;
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    Promise.all([
      // Wyczyść stary cache
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim(),
      loadSettingsFromDB().then(async settings => {
        notificationSettings = settings;
        if (settings.enabled) {
          await scheduleNotificationsWithSettings(settings);
        }
      })
    ])
  );
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

// Show notification from service worker with enhanced mobile support
function showBackgroundNotification(title, body, tag = 'habit-reminder') {
  const options = {
    body: body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: tag,
    renotify: true,
    requireInteraction: true, // Keep notification visible until user interacts
    silent: false,
    vibrate: [200, 100, 200], // Vibration pattern for mobile
    timestamp: Date.now(),
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
      timestamp: Date.now(),
      tag: tag
    },
    // Enhanced mobile support
    persistent: true,
    sticky: true
  };

  return self.registration.showNotification(title, options);
}

// Clear all scheduled alarms
function clearAllAlarms() {
  scheduledAlarms.forEach((timeoutId) => {
    clearTimeout(timeoutId);
  });
  scheduledAlarms.clear();
}

// Schedule notifications with enhanced mobile support
async function scheduleNotificationsWithSettings(settings) {
  if (!settings.enabled) {
    clearAllAlarms();
    return;
  }

  // Store settings for later use
  notificationSettings = settings;
  try {
    await saveSettingsToDB(settings);
  } catch (error) {
    console.error('Failed to save settings to IndexedDB:', error);
  }

  // Clear existing alarms
  clearAllAlarms();

  const now = new Date();
  
  // Schedule for multiple days to ensure continuity
  for (let i = 0; i < 7; i++) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + i);
    scheduleNotificationsForDate(targetDate, settings);
  }
}

// Schedule notifications for a specific date with improved reliability
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

  // Only schedule if the time is in the future and within reasonable range
  if (morningTime > now) {
    const morningDelay = morningTime.getTime() - now.getTime();
    if (morningDelay < 7 * 24 * 60 * 60 * 1000) { // Within 7 days
      const morningAlarmId = setTimeout(() => {
        showBackgroundNotification(
          'Poranne przypomnienie', 
          'Czas na poranne nawyki! 🌅',
          `morning-${date.toDateString()}`
        );
        scheduledAlarms.delete(`morning-${date.toDateString()}`);
      }, morningDelay);
      
      scheduledAlarms.set(`morning-${date.toDateString()}`, morningAlarmId);
    }
  }

  if (eveningTime > now) {
    const eveningDelay = eveningTime.getTime() - now.getTime();
    if (eveningDelay < 7 * 24 * 60 * 60 * 1000) { // Within 7 days
      const eveningAlarmId = setTimeout(() => {
        showBackgroundNotification(
          'Wieczorne przypomnienie', 
          'Czas na wieczorne nawyki! 🌙',
          `evening-${date.toDateString()}`
        );
        scheduledAlarms.delete(`evening-${date.toDateString()}`);
      }, eveningDelay);
      
      scheduledAlarms.set(`evening-${date.toDateString()}`, eveningAlarmId);
    }
  }
}

// Message handling from main thread
self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATIONS') {
    const settings = event.data.settings;
    await scheduleNotificationsWithSettings(settings);
  }
  
  if (event.data && event.data.type === 'UPDATE_SETTINGS') {
    notificationSettings = event.data.settings;
    try {
      await saveSettingsToDB(event.data.settings);
    } catch (error) {
      console.error('Failed to save settings to IndexedDB:', error);
    }
    
    if (event.data.settings.enabled) {
      await scheduleNotificationsWithSettings(event.data.settings);
    } else {
      clearAllAlarms();
    }
  }

  if (event.data && event.data.type === 'CLEAR_NOTIFICATIONS') {
    clearAllAlarms();
  }
});

// Background sync for notifications (enhanced for mobile)
self.addEventListener('sync', (event) => {
  if (event.tag === 'schedule-notifications') {
    event.waitUntil(
      loadSettingsFromDB().then(async settings => {
        if (settings.enabled) {
          await scheduleNotificationsWithSettings(settings);
        }
      })
    );
  }
});

// Periodic background sync (enhanced for mobile)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'habit-notifications') {
    event.waitUntil(
      loadSettingsFromDB().then(async settings => {
        if (settings.enabled) {
          await scheduleNotificationsWithSettings(settings);
        }
      })
    );
  }
});

// Handle visibility change to reschedule notifications
self.addEventListener('visibilitychange', (event) => {
  if (document.visibilityState === 'visible') {
    loadSettingsFromDB().then(async settings => {
      if (settings.enabled) {
        await scheduleNotificationsWithSettings(settings);
      }
    });
  }
});

// Handle page focus to ensure notifications are scheduled
self.addEventListener('focus', (event) => {
  loadSettingsFromDB().then(async settings => {
    if (settings.enabled) {
      await scheduleNotificationsWithSettings(settings);
    }
  });
});

// Handle push events (for future Web Push implementation)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      showBackgroundNotification(
        data.title || 'Habit Tracker', 
        data.body || 'Przypomnienie o nawykach',
        data.tag || 'push-notification'
      )
    );
  }
});

// Fetch handler for offline support and caching
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Return cached version if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // For navigation requests, try network first, fallback to cache
      if (event.request.mode === 'navigate') {
        return fetch(event.request).then(response => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        }).catch(() => {
          // Fallback to cached index.html for navigation
          return caches.match('/index.html') || caches.match('/');
        });
      }

      // For other requests, try network first
      return fetch(event.request).then(response => {
        // Cache successful responses for static assets
        if (response.status === 200 && 
            (event.request.url.includes('.js') || 
             event.request.url.includes('.css') || 
             event.request.url.includes('.png') || 
             event.request.url.includes('.svg') ||
             event.request.url.includes('.ico'))) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Return cached version if network fails
        return caches.match(event.request);
      });
    })
  );
});