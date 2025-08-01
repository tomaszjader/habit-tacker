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
import { Plus, Moon, Sun, Languages, Bell, Lock, Unlock, Menu, X } from 'lucide-react';
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
  const [isDragLocked, setIsDragLocked] = useState(true); // Domyślnie zablokowane
  const [showMenu, setShowMenu] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Simulate loading time for better UX
        await new Promise(resolve => setTimeout(resolve, 300));
        setHabits(loadHabits());
        setStatuses(loadHabitStatuses());
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
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
    if (isDragLocked) return; // Nie pozwalaj na przemieszczanie gdy zablokowane
    
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

  const toggleDragLock = () => {
    setIsDragLocked(prev => !prev);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu) {
        const target = event.target as Element;
        if (!target.closest('.relative')) {
          setShowMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const toggleMenu = () => {
    setShowMenu(prev => !prev);
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  const handleLanguageChange = () => {
    changeLanguage(t('language') === 'pl' ? 'en' : 'pl');
    closeMenu();
  };

  const handleThemeToggle = () => {
    toggleTheme();
    closeMenu();
  };

  const handleDragLockToggle = () => {
    toggleDragLock();
    closeMenu();
  };

  const handleNotificationSettings = () => {
    setShowNotificationSettings(true);
    closeMenu();
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
          message.textContent = t('habits.allCompleted');
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

  // Show loading screen
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${theme === 'dark' ? 'border-white' : 'border-blue-500'}`}></div>
          <p className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>{t('habits.title')}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm border-b backdrop-blur-sm bg-opacity-95`}>
        <div className="max-w-md mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Logo size={36} className="w-9 h-9 sm:w-10 sm:h-10" />
              <div className="min-w-0 flex-1">
                <h1 className={`text-lg sm:text-xl font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{t('habits.title')}</h1>
                <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {completedToday} {t('habits.of')} {validHabitsToday.length} {t('habits.completed')}
                </p>
              </div>
            </div>
            
            <div className="flex gap-1 sm:gap-2">
              {/* Add Habit Button */}
              <button
                onClick={() => setShowAddForm(true)}
                className="celebration-button w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95"
                aria-label={t('habits.add')}
                title={t('habits.add')}
              >
                <Plus size={16} className="sm:w-5 sm:h-5" />
              </button>

              {/* Menu Button */}
              <div className="relative">
                <button
                  id="menu-button"
                  onClick={toggleMenu}
                  className={`celebration-button w-8 h-8 sm:w-10 sm:h-10 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-full flex items-center justify-center transition-all duration-200 active:scale-95`}
                  aria-label={t('menu.title')}
                  aria-expanded={showMenu}
                  aria-haspopup="menu"
                  title={t('menu.title')}
                >
                  {showMenu ? 
                    <X size={16} className={`sm:w-5 sm:h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} /> :
                    <Menu size={16} className={`sm:w-5 sm:h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />
                  }
                </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div 
                  className={`absolute right-0 top-12 w-56 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg z-50`}
                  role="menu"
                  aria-labelledby="menu-button"
                >
                  <div className={`p-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{t('menu.title')}</h3>
                  </div>
                  
                  <div className="py-2">
                     {/* Drag Lock */}
                     <button
                       onClick={handleDragLockToggle}
                       className={`w-full px-4 py-3 text-left flex items-center gap-3 ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-50 text-gray-700'} transition-colors`}
                       role="menuitem"
                       aria-label={`${t('menu.dragLock')} - ${isDragLocked ? t('habits.orderLocked') : t('habits.orderUnlocked')}`}
                     >
                       {isDragLocked ? 
                         <Lock size={18} className="text-red-500" /> : 
                         <Unlock size={18} className="text-green-500" />
                       }
                       <span>{t('menu.dragLock')}</span>
                       <span className={`ml-auto text-sm ${isDragLocked ? 'text-red-500' : 'text-green-500'}`}>
                         {isDragLocked ? t('habits.orderLocked') : t('habits.orderUnlocked')}
                       </span>
                     </button>

                    {/* Notifications */}
                    <button
                      onClick={handleNotificationSettings}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-50 text-gray-700'} transition-colors`}
                      role="menuitem"
                      aria-label={t('menu.notifications')}
                    >
                      <Bell size={18} className="text-yellow-500" />
                      <span>{t('menu.notifications')}</span>
                    </button>

                    {/* Theme */}
                    <button
                      onClick={handleThemeToggle}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-50 text-gray-700'} transition-colors`}
                      role="menuitem"
                      aria-label={`${t('menu.theme')} - ${theme === 'dark' ? t('theme.dark') : t('theme.light')}`}
                    >
                      {theme === 'dark' ? 
                        <Sun size={18} className="text-orange-500" /> : 
                        <Moon size={18} className="text-purple-500" />
                      }
                      <span>{t('menu.theme')}</span>
                      <span className={`ml-auto text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {theme === 'dark' ? t('theme.dark') : t('theme.light')}
                      </span>
                    </button>

                    {/* Language */}
                    <button
                      onClick={handleLanguageChange}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-50 text-gray-700'} transition-colors`}
                      role="menuitem"
                      aria-label={`${t('menu.language')} - ${t('language') === 'pl' ? 'Polski' : 'English'}`}
                    >
                      <Languages size={18} className="text-indigo-500" />
                      <span>{t('menu.language')}</span>
                      <span className={`ml-auto text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('language') === 'pl' ? 'Polski' : 'English'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <HabitList
          habits={habits}
          statuses={statuses}
          onStatusChange={handleStatusChange}
          onDeleteHabit={deleteHabit}
          onUpdateHabit={updateHabit}
          onReorderHabits={reorderHabits}
          isDragLocked={isDragLocked}
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