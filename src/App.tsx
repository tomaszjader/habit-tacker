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
import { Plus, Moon, Sun, Languages, Bell, Lock, Unlock, Menu, X, Archive, ArchiveRestore } from 'lucide-react';
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
  const [showArchivedHabits, setShowArchivedHabits] = useState(false);

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

  const archiveHabit = (habitId: string) => {
    setHabits(prev => prev.map(h => 
      h.id === habitId ? { 
        ...h, 
        archived: true, 
        archivedAt: new Date().toISOString() 
      } : h
    ));
  };

  const unarchiveHabit = (habitId: string) => {
    setHabits(prev => prev.map(h => 
      h.id === habitId ? { 
        ...h, 
        archived: false, 
        archivedAt: undefined 
      } : h
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

  const handleToggleArchivedView = () => {
    setShowArchivedHabits(prev => !prev);
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
  
  // Filter habits based on current view (active or archived)
  const filteredHabits = habits.filter(habit => 
    showArchivedHabits ? habit.archived : !habit.archived
  );
  
  const validHabitsToday = filteredHabits.filter(habit => isValidDay(habit, new Date()));
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
          
          // Show completion message with modern glass morphism design
          const message = document.createElement('div');
          message.innerHTML = `
            <div style="text-align: center;">
              <div style="font-size: 36px; margin-bottom: 16px; filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.8));">🎉</div>
              <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1.2;">${t('habits.allCompleted').replace(/🎉/g, '').trim()}</div>
              <div style="font-size: 16px; opacity: 0.9; font-weight: 500;">Kontynuuj tak dalej! 💪</div>
            </div>
          `;
          message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(24px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            padding: 32px 40px;
            border-radius: 24px;
            font-size: 20px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
            animation: streak-celebration-enhanced 4s ease-out forwards;
            text-align: center;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            max-width: 90vw;
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
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' 
        ? 'bg-gradient-to-br from-tesla-900 via-gray-900 to-tesla-800' 
        : 'bg-gradient-to-br from-apple-50 via-white to-apple-100'
      }`}>
        <div className="text-center glass-card p-8 rounded-4xl">
          <div className="relative">
            <div className={`animate-spin rounded-full h-16 w-16 border-4 border-transparent mx-auto mb-6 ${
              theme === 'dark' 
                ? 'border-t-apple-400 border-r-apple-500' 
                : 'border-t-apple-600 border-r-apple-700'
            }`}></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-apple-400 to-apple-600 opacity-20 animate-pulse"></div>
          </div>
          <p className={`text-xl font-semibold tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-tesla-800'
          }`}>
            {t('habits.title')}
          </p>
          <div className="mt-2 h-1 w-24 mx-auto bg-gradient-to-r from-apple-400 to-apple-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' 
      ? 'bg-gradient-to-br from-tesla-900 via-gray-900 to-tesla-800' 
      : 'bg-gradient-to-br from-apple-50 via-white to-apple-100'
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 glass-card ${
        theme === 'dark' 
          ? 'border-white/10' 
          : 'border-black/5'
      } border-b backdrop-blur-xl`}>
        <div className="w-full max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative">
                <Logo size={40} className="w-10 h-10 drop-shadow-lg" />
                <div className="absolute inset-0 bg-gradient-to-r from-apple-400 to-apple-600 rounded-full opacity-20 animate-pulse"></div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className={`text-lg font-bold tracking-tight break-words leading-tight bg-gradient-to-r ${
                  theme === 'dark' 
                    ? 'from-white to-apple-200 text-transparent bg-clip-text' 
                    : 'from-tesla-800 to-tesla-600 text-transparent bg-clip-text'
                }`}>
                  {showArchivedHabits ? 'Historia nawyków' : t('habits.title')}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`h-2 w-2 rounded-full ${
                    completedToday === validHabitsToday.length && validHabitsToday.length > 0
                      ? 'bg-green-400 animate-pulse' 
                      : 'bg-apple-400'
                  }`}></div>
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-apple-200' : 'text-tesla-600'
                  }`}>
                    {showArchivedHabits 
                      ? `${filteredHabits.length} zarchiwizowanych nawyków`
                      : `${completedToday} ${t('habits.of')} ${validHabitsToday.length} ${t('habits.completed')}`
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              {/* Add Habit Button */}
              <button
                onClick={() => setShowAddForm(true)}
                className="celebration-button btn-premium w-11 h-11 rounded-2xl flex items-center justify-center shadow-apple group"
                aria-label={t('habits.add')}
                title={t('habits.add')}
              >
                <Plus size={20} className="transition-transform group-hover:rotate-90 duration-300" />
              </button>

              {/* Menu Button */}
              <div className="relative">
                <button
                  id="menu-button"
                  onClick={toggleMenu}
                  className={`celebration-button w-11 h-11 rounded-2xl flex items-center justify-center shadow-apple transition-all duration-300 group ${
                    theme === 'dark' 
                      ? 'bg-white/10 hover:bg-white/20 border border-white/20' 
                      : 'bg-black/5 hover:bg-black/10 border border-black/10'
                  }`}
                  aria-label={t('menu.title')}
                  aria-expanded={showMenu}
                  aria-haspopup="menu"
                  title={t('menu.title')}
                >
                  <div className="relative">
                    {showMenu ? 
                      <X size={20} className={`transition-all duration-300 ${
                        theme === 'dark' ? 'text-white' : 'text-tesla-800'
                      } group-hover:rotate-90`} /> :
                      <Menu size={20} className={`transition-all duration-300 ${
                        theme === 'dark' ? 'text-white' : 'text-tesla-800'
                      } group-hover:scale-110`} />
                    }
                  </div>
                </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div 
                  className={`absolute right-0 top-14 w-64 rounded-3xl shadow-tesla z-50 animate-slide-down ${
                    theme === 'dark' 
                      ? 'bg-gray-900/95 backdrop-blur-xl border border-white/20' 
                      : 'bg-white/95 backdrop-blur-xl border border-black/10'
                  } overflow-hidden`}
                  role="menu"
                  aria-labelledby="menu-button"
                >
                  <div className={`p-4 border-b ${
                    theme === 'dark' ? 'border-white/10' : 'border-black/5'
                  }`}>
                    <h3 className={`font-bold text-lg tracking-tight ${
                      theme === 'dark' ? 'text-white' : 'text-tesla-800'
                    }`}>
                      {t('menu.title')}
                    </h3>
                    <div className="mt-1 h-0.5 w-8 bg-gradient-to-r from-apple-400 to-apple-600 rounded-full"></div>
                  </div>
                  
                  <div className="p-2">
                     {/* Archive Toggle */}
                     <button
                       onClick={handleToggleArchivedView}
                       className={`w-full px-4 py-4 text-left flex items-center gap-4 rounded-2xl transition-all duration-300 group ${
                         theme === 'dark' 
                           ? 'hover:bg-white/10 text-white' 
                           : 'hover:bg-black/5 text-tesla-800'
                       }`}
                       role="menuitem"
                       aria-label={showArchivedHabits ? t('menu.showActive') : t('menu.showArchived')}
                     >
                       <div className={`p-2 rounded-xl ${
                         showArchivedHabits 
                           ? 'bg-green-500/20 text-green-400' 
                           : 'bg-gray-500/20 text-gray-400'
                       }`}>
                         {showArchivedHabits ? 
                           <ArchiveRestore size={18} className="transition-transform group-hover:scale-110" /> : 
                           <Archive size={18} className="transition-transform group-hover:scale-110" />
                         }
                       </div>
                       <div className="flex-1">
                         <span className="font-medium">
                           {showArchivedHabits ? 'Aktywne nawyki' : 'Historia nawyków'}
                         </span>
                         <div className={`text-sm mt-0.5 ${
                           showArchivedHabits ? 'text-green-400' : 'text-gray-400'
                         }`}>
                           {showArchivedHabits ? 'Pokaż aktywne nawyki' : 'Pokaż zarchiwizowane nawyki'}
                         </div>
                       </div>
                     </button>

                     {/* Drag Lock */}
                     <button
                       onClick={handleDragLockToggle}
                       className={`w-full px-4 py-4 text-left flex items-center gap-4 rounded-2xl transition-all duration-300 group ${
                         theme === 'dark' 
                           ? 'hover:bg-white/10 text-white' 
                           : 'hover:bg-black/5 text-tesla-800'
                       }`}
                       role="menuitem"
                       aria-label={`${t('menu.dragLock')} - ${isDragLocked ? t('habits.orderLocked') : t('habits.orderUnlocked')}`}
                     >
                       <div className={`p-2 rounded-xl ${
                         isDragLocked 
                           ? 'bg-red-500/20 text-red-400' 
                           : 'bg-green-500/20 text-green-400'
                       }`}>
                         {isDragLocked ? 
                           <Lock size={18} className="transition-transform group-hover:scale-110" /> : 
                           <Unlock size={18} className="transition-transform group-hover:scale-110" />
                         }
                       </div>
                       <div className="flex-1">
                         <span className="font-medium">{t('menu.dragLock')}</span>
                         <div className={`text-sm mt-0.5 ${
                           isDragLocked ? 'text-red-400' : 'text-green-400'
                         }`}>
                           {isDragLocked ? t('habits.orderLocked') : t('habits.orderUnlocked')}
                         </div>
                       </div>
                     </button>

                    {/* Notifications */}
                    <button
                      onClick={handleNotificationSettings}
                      className={`w-full px-4 py-4 text-left flex items-center gap-4 rounded-2xl transition-all duration-300 group ${
                        theme === 'dark' 
                          ? 'hover:bg-white/10 text-white' 
                          : 'hover:bg-black/5 text-tesla-800'
                      }`}
                      role="menuitem"
                      aria-label={t('menu.notifications')}
                    >
                      <div className="p-2 rounded-xl bg-yellow-500/20 text-yellow-400">
                        <Bell size={18} className="transition-transform group-hover:scale-110" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">{t('menu.notifications')}</span>
                      </div>
                    </button>

                    {/* Theme */}
                    <button
                      onClick={handleThemeToggle}
                      className={`w-full px-4 py-4 text-left flex items-center gap-4 rounded-2xl transition-all duration-300 group ${
                        theme === 'dark' 
                          ? 'hover:bg-white/10 text-white' 
                          : 'hover:bg-black/5 text-tesla-800'
                      }`}
                      role="menuitem"
                      aria-label={`${t('menu.theme')} - ${theme === 'dark' ? t('theme.dark') : t('theme.light')}`}
                    >
                      <div className={`p-2 rounded-xl ${
                        theme === 'dark' 
                          ? 'bg-orange-500/20 text-orange-400' 
                          : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {theme === 'dark' ? 
                          <Sun size={18} className="transition-transform group-hover:scale-110" /> : 
                          <Moon size={18} className="transition-transform group-hover:scale-110" />
                        }
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">{t('menu.theme')}</span>
                        <div className={`text-sm mt-0.5 ${
                          theme === 'dark' ? 'text-orange-400' : 'text-purple-400'
                        }`}>
                          {theme === 'dark' ? t('theme.dark') : t('theme.light')}
                        </div>
                      </div>
                    </button>

                    {/* Language */}
                    <button
                      onClick={handleLanguageChange}
                      className={`w-full px-4 py-4 text-left flex items-center gap-4 rounded-2xl transition-all duration-300 group ${
                        theme === 'dark' 
                          ? 'hover:bg-white/10 text-white' 
                          : 'hover:bg-black/5 text-tesla-800'
                      }`}
                      role="menuitem"
                      aria-label={`${t('menu.language')} - ${t('language') === 'pl' ? 'Polski' : 'English'}`}
                    >
                      <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                        <Languages size={18} className="transition-transform group-hover:scale-110" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">{t('menu.language')}</span>
                        <div className="text-sm mt-0.5 text-indigo-400">
                          {t('language') === 'pl' ? 'Polski' : 'English'}
                        </div>
                      </div>
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
      <div className="w-full max-w-md mx-auto px-4 py-3 min-h-0 flex-1 overflow-y-auto overscroll-contain mobile-scroll">
        <HabitList
          habits={filteredHabits}
          statuses={statuses}
          onStatusChange={handleStatusChange}
          onDeleteHabit={deleteHabit}
          onUpdateHabit={updateHabit}
          onReorderHabits={reorderHabits}
          isDragLocked={isDragLocked}
          className={theme === 'dark' ? 'bg-gray-800 text-white' : ''}
          onArchiveHabit={archiveHabit}
          onUnarchiveHabit={unarchiveHabit}
          showArchivedView={showArchivedHabits}
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