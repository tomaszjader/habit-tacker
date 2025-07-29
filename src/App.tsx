import React, { useState, useEffect } from 'react';
import { Habit, HabitStatus, StatusType } from './types/habit';
import { 
  loadHabits, 
  saveHabits, 
  loadHabitStatuses, 
  saveHabitStatuses,
  formatDate,
  isValidDay
} from './utils/storage';
import { updateSuccessCount, getHabitStatusForDate } from './utils/habitUtils';
import {
  loadNotificationSettings,
  scheduleNotifications,
  clearScheduledNotifications,
  registerServiceWorker,
  requestNotificationPermission
} from './utils/notifications';
import { createConfetti, playSuccessSound } from './utils/celebrationEffects';
import HabitList from './components/HabitList';
import AddHabitForm from './components/AddHabitForm';
import NotificationSettings from './components/NotificationSettings';
import Logo from './components/Logo';
import { Plus, Moon, Sun, Languages, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import './i18n/config';
import { changeLanguage } from './i18n/config';

function AppContent() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [statuses, setStatuses] = useState<HabitStatus[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data on mount
  useEffect(() => {
    setHabits(loadHabits());
    setStatuses(loadHabitStatuses());
    setIsLoaded(true);
  }, []);

  // Save data when it changes (but not on initial load)
  useEffect(() => {
    if (isLoaded) {
      saveHabits(habits);
    }
  }, [habits, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      saveHabitStatuses(statuses);
    }
  }, [statuses, isLoaded]);

  // Initialize notifications and service worker on mount
  useEffect(() => {
    const initializeNotifications = async () => {
      // Register service worker first
      await registerServiceWorker();
      
      const settings = loadNotificationSettings();
      if (settings.enabled) {
        // Request permission if not already granted
        const hasPermission = await requestNotificationPermission();
        if (hasPermission) {
          scheduleNotifications(settings, t('notifications.morningReminder'));
        }
      }
    };

    initializeNotifications();

    // Handle visibility change to reschedule notifications on mobile
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const settings = loadNotificationSettings();
        if (settings.enabled) {
          scheduleNotifications(settings, t('notifications.morningReminder'));
        }
      }
    };

    // Handle page focus to ensure notifications work on mobile
    const handleFocus = () => {
      const settings = loadNotificationSettings();
      if (settings.enabled) {
        scheduleNotifications(settings, t('notifications.morningReminder'));
      }
    };

    // Add event listeners for mobile support
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Cleanup on unmount
    return () => {
      clearScheduledNotifications();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [t]);

  const addHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'successCount' | 'bestStreak' | 'order'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      successCount: 0,
      bestStreak: 0,
      order: habits.length // Nowy nawyk na końcu listy
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const deleteHabit = (habitId: string) => {
    // Remove the habit
    setHabits(prev => prev.filter(h => h.id !== habitId));
    // Remove all statuses for this habit
    setStatuses(prev => prev.filter(s => s.habitId !== habitId));
  };

  const updateHabit = (habitId: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => 
      h.id === habitId ? { ...h, ...updates } : h
    ));
  };

  const reorderHabits = (startIndex: number, endIndex: number) => {
    setHabits(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      
      // Aktualizuj order dla wszystkich nawyków
      return result.map((habit, index) => ({
        ...habit,
        order: index
      }));
    });
  };

  const handleStatusChange = (habitId: string, date: string, newStatus: StatusType) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const oldStatus = getHabitStatusForDate(habitId, date, statuses);
    const { successCount: newSuccessCount, bestStreak: newBestStreak } = updateSuccessCount(habit, newStatus, oldStatus);

    // Update habit success count and best streak
    setHabits(prev => prev.map(h => 
      h.id === habitId ? { ...h, successCount: newSuccessCount, bestStreak: newBestStreak } : h
    ));

    // Update status
    setStatuses(prev => {
      const filtered = prev.filter(s => !(s.habitId === habitId && s.date === date));
      return [...filtered, { habitId, date, status: newStatus }];
    });
  };

  const todayStr = formatDate(new Date());
  const validHabitsToday = habits.filter(habit => isValidDay(habit, new Date()));
  const completedToday = validHabitsToday.filter(habit => {
    const status = getHabitStatusForDate(habit.id, todayStr, statuses);
    return status === 'completed';
  }).length;

  // Check for all habits completion celebration
  useEffect(() => {
    if (validHabitsToday.length > 0 && completedToday === validHabitsToday.length && completedToday > 1) {
      // All valid habits for today are completed!
      setTimeout(() => {
        playSuccessSound();
        const headerElement = document.querySelector('h1');
        if (headerElement) {
          createConfetti(headerElement);
          
          // Show completion message
          const message = document.createElement('div');
          message.textContent = '🎉 Wszystkie nawyki ukończone! Świetna robota! 🎉';
          message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 25px 35px;
            border-radius: 20px;
            font-size: 20px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 15px 40px rgba(0,0,0,0.3);
            animation: streak-celebration 4s ease-out forwards;
            text-align: center;
          `;
          
          document.body.appendChild(message);
          
          setTimeout(() => {
            if (message.parentNode) {
              message.parentNode.removeChild(message);
            }
          }, 4000);
        }
      }, 1000);
    }
  }, [completedToday, validHabitsToday.length]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm border-b backdrop-blur-sm bg-opacity-95`}>
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size={40} />
              <div>
                <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{t('habits.title')}</h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {completedToday} {t('habits.of')} {validHabitsToday.length} {t('habits.completed')}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => changeLanguage(t('language') === 'pl' ? 'en' : 'pl')}
                className={`celebration-button w-10 h-10 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-full flex items-center justify-center transition-all duration-200 active:scale-95`}
              >
                <Languages size={20} className={theme === 'dark' ? 'text-white' : 'text-gray-600'} />
              </button>
              <button
                onClick={() => setShowNotificationSettings(true)}
                className={`celebration-button w-10 h-10 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-full flex items-center justify-center transition-all duration-200 active:scale-95`}
              >
                <Bell size={20} className={theme === 'dark' ? 'text-white' : 'text-gray-600'} />
              </button>
              <button
                onClick={toggleTheme}
                className={`celebration-button w-10 h-10 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-full flex items-center justify-center transition-all duration-200 active:scale-95`}
              >
                {theme === 'dark' ? 
                  <Sun size={20} className="text-white" /> : 
                  <Moon size={20} className="text-gray-600" />
                }
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="celebration-button w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        <HabitList
          habits={habits}
          statuses={statuses}
          onStatusChange={handleStatusChange}
          onDeleteHabit={deleteHabit}
          onUpdateHabit={updateHabit}
          onReorderHabits={reorderHabits}
          className={theme === 'dark' ? 'bg-gray-800 text-white' : ''}
        />
      </div>

      {showAddForm && (
        <AddHabitForm
          onAddHabit={addHabit}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {showNotificationSettings && (
        <NotificationSettings
          onClose={() => setShowNotificationSettings(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;