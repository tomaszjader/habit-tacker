import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Bell, BellOff, Clock, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import {
  NotificationSettings,
  loadNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  scheduleNotifications,
  clearScheduledNotifications,
  clearAllNotifications
} from '../utils/notifications';
import { showModernAlert, showModernConfirm } from '../utils/modernDialogs';

interface NotificationSettingsProps {
  onClose: () => void;
}

const NotificationSettingsComponent: React.FC<NotificationSettingsProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [settings, setSettings] = useState<NotificationSettings>(loadNotificationSettings());
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    setPermissionStatus(Notification.permission);
  }, []);

  const handleToggleNotifications = async () => {
    if (!settings.enabled) {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        await showModernAlert(t('notifications.permissionDenied'), 'error');
        return;
      }
      setPermissionStatus('granted');
    }

    const newSettings = { ...settings, enabled: !settings.enabled };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);

    if (newSettings.enabled) {
      scheduleNotifications(newSettings, t('notifications.morningReminder'));
    } else {
      clearScheduledNotifications();
    }
  };

  const handleTimeChange = (type: 'morningTime' | 'eveningTime', value: string) => {
    const newSettings = { ...settings, [type]: value };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);

    if (newSettings.enabled) {
      scheduleNotifications(newSettings, t('notifications.morningReminder'));
    }
  };

  const handleClearAllNotifications = async () => {
    const confirmed = await showModernConfirm(t('notifications.clearAllConfirm'));
    if (confirmed) {
      clearAllNotifications();
      setSettings({
        enabled: false,
        morningTime: '08:00',
        eveningTime: '20:00'
      });
      await showModernAlert(t('notifications.cleared'), 'success');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {t('notifications.settings')}
          </h2>
          <button
            onClick={onClose}
            className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Enable/Disable Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.enabled ? (
                <Bell className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
              ) : (
                <BellOff className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              )}
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {t('notifications.enable')}
              </span>
            </div>
            <button
              onClick={handleToggleNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enabled 
                  ? 'bg-blue-500' 
                  : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {settings.enabled && (
            <>
              {/* Morning Time */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Poranne przypomnienie
                  </label>
                </div>
                <input
                  type="time"
                  value={settings.morningTime}
                  onChange={(e) => handleTimeChange('morningTime', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              {/* Evening Time */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Wieczorne przypomnienie
                  </label>
                </div>
                <input
                  type="time"
                  value={settings.eveningTime}
                  onChange={(e) => handleTimeChange('eveningTime', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              {/* Notification Preview */}
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>Treść powiadomienia:</strong>
                </p>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  "{t('notifications.morningReminder')}"
                </p>
              </div>
            </>
          )}

          {permissionStatus === 'denied' && (
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>
                {t('notifications.permissionDenied')}. Aby włączyć powiadomienia, zmień ustawienia w przeglądarce.
              </p>
            </div>
          )}
        </div>

        {/* Clear All Notifications Button */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={handleClearAllNotifications}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'bg-red-900/20 hover:bg-red-900/30 text-red-300 border border-red-800' 
                : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
            }`}
          >
            <Trash2 size={16} />
            {t('notifications.clearAll')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsComponent;