export interface NotificationSettings {
  enabled: boolean;
  morningTime: string; // Format: "HH:MM"
  eveningTime: string; // Format: "HH:MM"
}

const NOTIFICATION_SETTINGS_KEY = 'habit-tracker-notifications';
const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  morningTime: '08:00',
  eveningTime: '20:00'
};

// Service Worker registration
let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

export const loadNotificationSettings = (): NotificationSettings => {
  try {
    const stored = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveNotificationSettings = (settings: NotificationSettings): void => {
  localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
};

// Register Service Worker for background notifications
export const registerServiceWorker = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers are not supported in this browser');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    
    serviceWorkerRegistration = registration;
    console.log('Service Worker registered successfully:', registration);
    
    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;
    
    return true;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return false;
  }
};

// Send message to Service Worker
const sendMessageToServiceWorker = (message: any): void => {
  if (serviceWorkerRegistration && serviceWorkerRegistration.active) {
    serviceWorkerRegistration.active.postMessage(message);
  } else if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    // Register service worker if not already registered
    await registerServiceWorker();
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  const granted = permission === 'granted';
  
  if (granted) {
    // Register service worker when permission is granted
    await registerServiceWorker();
    
    // Request persistent notification permission for mobile
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // Check if we can request persistent notifications
        if ('showNotification' in registration) {
          console.log('Persistent notifications supported');
        }
      } catch (error) {
        console.warn('Could not enable persistent notifications:', error);
      }
    }
  }
  
  return granted;
};

export const showNotification = (title: string, body: string): void => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'habit-reminder',
      renotify: true
    });
  }
};

export const scheduleNotifications = (settings: NotificationSettings, reminderText: string): void => {
  if (!settings.enabled || Notification.permission !== 'granted') {
    return;
  }

  // Clear existing timeouts (fallback for immediate notifications)
  clearScheduledNotifications();

  // Send settings to Service Worker for background scheduling
  sendMessageToServiceWorker({
    type: 'SCHEDULE_NOTIFICATIONS',
    settings: settings,
    reminderText: reminderText
  });

  // Also try to register background sync for better mobile support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      if ('sync' in registration) {
        return registration.sync.register('schedule-notifications');
      }
    }).catch(error => {
      console.warn('Background sync registration failed:', error);
    });
  }

  // Schedule immediate notifications as fallback (for desktop/immediate use)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Schedule morning notification
  const [morningHour, morningMinute] = settings.morningTime.split(':').map(Number);
  const morningTime = new Date(today);
  morningTime.setHours(morningHour, morningMinute, 0, 0);

  // If morning time has passed today, schedule for tomorrow
  if (morningTime <= now) {
    morningTime.setDate(morningTime.getDate() + 1);
  }

  const morningTimeout = setTimeout(() => {
    // Use Service Worker notification if available, fallback to regular notification
    if (serviceWorkerRegistration && 'showNotification' in serviceWorkerRegistration) {
      serviceWorkerRegistration.showNotification('Poranne przypomnienie', {
        body: reminderText,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'morning-reminder',
        requireInteraction: true,
        vibrate: [200, 100, 200]
      });
    } else {
      showNotification('Poranne przypomnienie', reminderText);
    }
    // Reschedule for next day
    scheduleNotifications(settings, reminderText);
  }, morningTime.getTime() - now.getTime());

  // Schedule evening notification
  const [eveningHour, eveningMinute] = settings.eveningTime.split(':').map(Number);
  const eveningTime = new Date(today);
  eveningTime.setHours(eveningHour, eveningMinute, 0, 0);

  // If evening time has passed today, schedule for tomorrow
  if (eveningTime <= now) {
    eveningTime.setDate(eveningTime.getDate() + 1);
  }

  const eveningTimeout = setTimeout(() => {
    // Use Service Worker notification if available, fallback to regular notification
    if (serviceWorkerRegistration && 'showNotification' in serviceWorkerRegistration) {
      serviceWorkerRegistration.showNotification('Wieczorne przypomnienie', {
        body: reminderText,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'evening-reminder',
        requireInteraction: true,
        vibrate: [200, 100, 200]
      });
    } else {
      showNotification('Wieczorne przypomnienie', reminderText);
    }
  }, eveningTime.getTime() - now.getTime());

  // Store timeout IDs for cleanup
  (window as any).habitNotificationTimeouts = {
    morning: morningTimeout,
    evening: eveningTimeout
  };
};

export const clearScheduledNotifications = (): void => {
  const timeouts = (window as any).habitNotificationTimeouts;
  if (timeouts) {
    if (timeouts.morning) clearTimeout(timeouts.morning);
    if (timeouts.evening) clearTimeout(timeouts.evening);
    delete (window as any).habitNotificationTimeouts;
  }
};

export const clearAllNotifications = (): void => {
  // Clear scheduled notifications
  clearScheduledNotifications();
  
  // Send message to Service Worker to clear background notifications
  sendMessageToServiceWorker({
    type: 'CLEAR_NOTIFICATIONS'
  });
  
  // Clear notification settings
  const clearedSettings: NotificationSettings = {
    enabled: false,
    morningTime: '08:00',
    eveningTime: '20:00'
  };
  saveNotificationSettings(clearedSettings);
};