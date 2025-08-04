import React, { useState, useRef, useMemo } from 'react';
import { Habit, HabitStatus, StatusType } from '../types/habit';
import { formatDate, isValidDay, getDateDaysAgo } from '../utils/storage';
import { getHabitStatusForDate, getStatusDisplay, getDateLabel } from '../utils/habitUtils';
import { triggerCelebration, celebrateStreak } from '../utils/celebrationEffects';
import HabitHistoryEditor from './HabitHistoryEditor';
import StatusPicker from './StatusPicker';
import { Settings, GripVertical, Calendar, MoreVertical, Zap, TrendingUp, Target, Sparkles, Crown, Award, History, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

interface HabitItemProps {
  habit: Habit;
  statuses: HabitStatus[];
  onStatusChange: (habitId: string, date: string, status: StatusType) => void;
  onDeleteHabit: (habitId: string) => void;
  onUpdateHabit: (habitId: string, updates: Partial<Habit>) => void;
  onArchiveHabit?: (habitId: string) => void;
  onUnarchiveHabit?: (habitId: string) => void;
  showArchivedView?: boolean;
}

type TabType = 'overview' | 'history' | 'settings';

const HabitItem: React.FC<HabitItemProps> = ({ 
  habit, 
  statuses, 
  onStatusChange, 
  onDeleteHabit, 
  onUpdateHabit, 
  onArchiveHabit, 
  onUnarchiveHabit, 
  showArchivedView = false 
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [showHistory, setShowHistory] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isExpanded, setIsExpanded] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const today = new Date();
  const todayStr = formatDate(today);
  const currentStatus = getHabitStatusForDate(habit.id, todayStr, statuses);
  const statusDisplay = getStatusDisplay(currentStatus, habit, today);
  const isValidToday = isValidDay(habit, today);

  const getStatusButtonStyle = (status: StatusType) => {
    if (status === 'completed') {
      return theme === 'dark' 
        ? 'bg-green-600 text-white border-green-500'
        : 'bg-green-500 text-white border-green-400';
    }
    if (status === 'partial') {
      return theme === 'dark'
        ? 'bg-yellow-600 text-white border-yellow-500'
        : 'bg-yellow-500 text-white border-yellow-400';
    }
    if (status === 'failed') {
      return theme === 'dark'
        ? 'bg-red-600 text-white border-red-500'
        : 'bg-red-500 text-white border-red-400';
    }
    return theme === 'dark'
      ? 'bg-gray-700 text-white border-gray-600'
      : 'bg-gray-200 text-gray-700 border-gray-300';
  };

  const toggleStatusPicker = () => {
    if (!isValidToday) return;
    setShowStatusPicker(!showStatusPicker);
  };

  const handleStatusChange = (newStatus: StatusType) => {
    if (!isValidToday || !buttonRef.current) return;
    
    // Trigger celebration effects
    triggerCelebration(newStatus, buttonRef.current);
    
    // Update status
    onStatusChange(habit.id, todayStr, newStatus);
    
    // Check for streak celebration (only for completed status)
    if (newStatus === 'completed') {
      setTimeout(() => {
        celebrateStreak(habit.successCount + 1, buttonRef.current!);
      }, 800);
    }
    
    // Close the status picker
    setShowStatusPicker(false);
  };

  const handleHistoryStatusChange = (date: string, status: StatusType) => {
    onStatusChange(habit.id, date, status);
  };

  // Historia nawyku - ostatnie 7 dni
  const habitHistory = useMemo(() => {
    const history: Record<string, StatusType> = {};
    statuses
      .filter(status => status.habitId === habit.id)
      .forEach(status => {
        history[status.date] = status.status;
      });
    return history;
  }, [statuses, habit.id]);

  const historyDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const daysAgo = i;
      const dateObj = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      return {
        daysAgo,
        date: getDateDaysAgo(daysAgo),
        dateObj,
        label: getDateLabel(daysAgo),
        isValid: isValidDay(habit, dateObj)
      };
    });
  }, [habit]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setActiveTab('overview');
    }
  };

  return (
    <>
      <div className={`
        habit-item habit-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8 group
        transition-all duration-700 ease-apple hover:scale-[1.02] hover:-translate-y-2 
        ${theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 border border-white/20 shadow-2xl hover:shadow-glow hover:border-white/30' 
          : 'bg-gradient-to-br from-white/98 via-gray-50/95 to-white/98 border border-black/8 shadow-tesla hover:shadow-apple-lg hover:border-black/15'
        }
        backdrop-blur-2xl before:absolute before:inset-0 before:rounded-[2rem] before:p-[1px] 
        before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-white/10
        before:-z-10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-700
      `}>
        {/* Premium floating particles */}
        <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
          <div className={`absolute top-4 right-8 w-1 h-1 rounded-full animate-particle-float ${
            theme === 'dark' ? 'bg-blue-400/40' : 'bg-blue-500/30'
          }`} style={{ animationDelay: '0s' }} />
          <div className={`absolute top-12 left-12 w-0.5 h-0.5 rounded-full animate-particle-float ${
            theme === 'dark' ? 'bg-purple-400/40' : 'bg-purple-500/30'
          }`} style={{ animationDelay: '2s' }} />
          <div className={`absolute bottom-8 right-16 w-1.5 h-1.5 rounded-full animate-particle-float ${
            theme === 'dark' ? 'bg-emerald-400/40' : 'bg-emerald-500/30'
          }`} style={{ animationDelay: '4s' }} />
        </div>

        {/* Dynamic gradient overlay */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-1000 rounded-[2rem] ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-blue-600/8 via-purple-600/6 to-emerald-600/8'
            : 'bg-gradient-to-br from-blue-50/60 via-purple-50/40 to-emerald-50/60'
        }`} />
        
        {/* Premium shimmer effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1200 rounded-[2rem] overflow-hidden">
          <div className={`absolute inset-0 ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-transparent via-white/8 to-transparent'
              : 'bg-gradient-to-r from-transparent via-blue-200/40 to-transparent'
          } transform -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-out`} />
        </div>

        {/* Ambient glow effect */}
        <div className={`absolute -inset-1 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-emerald-500/20'
            : 'bg-gradient-to-br from-blue-300/30 via-purple-300/20 to-emerald-300/30'
        } -z-10`} />

        {/* Mobile-Optimized Header */}
        <div className="space-y-4 mb-6 relative z-10">
          {/* Top Row - Drag Handle and Status */}
          <div className="flex items-center justify-between gap-3">
            {/* Simplified Drag Handle */}
            <div className={`
              p-2 rounded-xl transition-all duration-300 cursor-grab active:cursor-grabbing
              ${theme === 'dark' 
                ? 'bg-white/10 hover:bg-white/20 border border-white/20' 
                : 'bg-black/8 hover:bg-black/15 border border-black/15'
              }
            `}>
              <GripVertical size={16} className={`${
                theme === 'dark' ? 'text-white/70' : 'text-gray-600'
              }`} />
            </div>

            {/* Achievement Badge */}
            {habit.bestStreak >= 30 && (
              <div className={`
                p-1.5 rounded-xl
                ${theme === 'dark' 
                  ? 'bg-gradient-to-br from-yellow-400/20 to-orange-400/20 border border-yellow-400/30' 
                  : 'bg-gradient-to-br from-yellow-100/80 to-orange-100/80 border border-yellow-300/50'
                }
              `}>
                <Crown size={12} className={`${
                  theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                }`} />
              </div>
            )}

            {/* Status Button - Mobile Optimized */}
            <button
              ref={buttonRef}
              onClick={() => setShowStatusPicker(!showStatusPicker)}
              className={`
                px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300
                ${getStatusButtonStyle(currentStatus)}
                border hover:scale-105 active:scale-95
              `}
            >
              <div className="flex items-center gap-2">
                {/* Status indicator */}
                <div className={`w-2 h-2 rounded-full
                  ${currentStatus === 'completed' ? 'bg-emerald-400' : 
                    currentStatus === 'partial' ? 'bg-yellow-400' : 
                    currentStatus === 'failed' ? 'bg-red-400' : 
                    theme === 'dark' ? 'bg-white/40' : 'bg-gray-400'
                  }`} />
                <span className="whitespace-nowrap">{statusDisplay.text}</span>
              </div>
            </button>
          </div>

          {/* Habit Name - Full Width */}
          <div className="w-full">
            <h3 className={`
              font-bold text-lg sm:text-xl leading-tight break-words
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              {habit.name}
            </h3>
            
            {/* Emergency Habit Text - Mobile Friendly */}
            {habit.emergencyHabitText && (
              <p className={`
                mt-2 text-sm leading-relaxed break-words
                ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
              `}>
                <span className={`font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>
                  Wersja awaryjna:
                </span>{' '}
                {habit.emergencyHabitText}
              </p>
            )}
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${habit.successCount > 0 
                ? 'bg-gradient-to-r from-emerald-400 to-green-500 shadow-lg shadow-emerald-400/50' 
                : theme === 'dark' ? 'bg-white/20' : 'bg-black/20'
              }
            `} />
            
            {/* Streak indicator */}
            {habit.successCount >= 7 && (
              <div className={`
                flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                ${theme === 'dark' 
                  ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }
              `}>
                <Sparkles size={8} />
                {habit.successCount} dni
              </div>
            )}

            {/* Valid days indicator */}
            <div className={`
              text-xs px-2 py-1 rounded-full
              ${theme === 'dark' 
                ? 'bg-blue-900/50 text-blue-300 border border-blue-500/30' 
                : 'bg-blue-50 text-blue-700 border border-blue-200'
              }
            `}>
              {habit.validDays.length}/7 dni
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 relative z-10">
          {/* Current Streak Card */}
          <div className={`
            rounded-2xl p-4 transition-all duration-300
            ${theme === 'dark' 
              ? 'bg-blue-900/30 border border-blue-400/30' 
              : 'bg-blue-50/80 border border-blue-300/40'
            }
          `}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`
                p-1.5 rounded-xl
                ${theme === 'dark' ? 'bg-blue-500/30 text-blue-300' : 'bg-blue-200/80 text-blue-700'}
              `}>
                <Zap size={14} />
              </div>
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-blue-100' : 'text-blue-800'
              }`}>
                {t('habits.currentStreak')}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {habit.successCount}
                </span>
                {habit.successCount > 0 && (
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </div>
              <span className={`text-sm ${
                theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
              }`}>
                {t('habits.daysText')}
              </span>
            </div>
            
            {/* Simple Progress Bar */}
            <div className={`mt-3 h-1.5 rounded-full overflow-hidden ${
              theme === 'dark' ? 'bg-blue-900/40' : 'bg-blue-100/80'
            }`}>
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-purple-600 transition-all duration-500"
                style={{ width: `${Math.min((habit.successCount / Math.max(habit.bestStreak, 7)) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Best Streak Card */}
          <div className={`
            rounded-2xl p-4 transition-all duration-300
            ${theme === 'dark' 
              ? 'bg-emerald-900/30 border border-emerald-400/30' 
              : 'bg-emerald-50/80 border border-emerald-300/40'
            }
          `}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`
                p-1.5 rounded-xl
                ${theme === 'dark' ? 'bg-emerald-500/30 text-emerald-300' : 'bg-emerald-200/80 text-emerald-700'}
              `}>
                <TrendingUp size={14} />
              </div>
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-emerald-100' : 'text-emerald-800'
              }`}>
                {t('habits.bestStreak')}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {habit.bestStreak}
                </span>
                
                {/* Achievement Badges */}
                {habit.bestStreak >= 30 && (
                  <Crown size={12} className={`${
                    theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                  }`} />
                )}
                {habit.bestStreak >= 7 && habit.bestStreak < 30 && (
                  <Award size={10} className={`${
                    theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                  }`} />
                )}
              </div>
              <span className={`text-sm ${
                theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'
              }`}>
                {t('habits.daysText')}
              </span>
            </div>
            
            {/* Simple Progress Bar */}
            <div className={`mt-3 h-1.5 rounded-full overflow-hidden ${
              theme === 'dark' ? 'bg-emerald-900/40' : 'bg-emerald-100/80'
            }`}>
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-600 transition-all duration-500"
                style={{ width: `${Math.min((habit.bestStreak / 30) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>



        {/* Simplified Expand/Collapse Button */}
        <div className="flex justify-center">
          <button
            onClick={toggleExpanded}
            className={`
              flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-medium text-sm transition-all duration-300
              ${theme === 'dark' 
                ? 'bg-blue-600/60 text-white hover:bg-blue-600/80 border border-blue-400/40' 
                : 'bg-blue-500/90 text-white hover:bg-blue-600/95 border border-blue-400/60'
              }
            `}
          >
            <BarChart3 size={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            <span>{isExpanded ? 'Zwiń' : 'Rozwiń'}</span>
          </button>
        </div>

        {/* Simplified Expanded Content */}
        {isExpanded && (
          <div className={`
            mt-4 rounded-2xl overflow-hidden transition-all duration-300
            ${theme === 'dark' 
              ? 'bg-gray-800/60 border border-white/20' 
              : 'bg-white/80 border border-black/10'
            }
          `}>
            {/* Simplified Tab Navigation */}
            <div className={`flex border-b ${theme === 'dark' ? 'border-white/10' : 'border-black/5'}`}>
              <button
                onClick={() => setActiveTab('overview')}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-3 px-2 text-sm font-medium transition-all duration-200
                  ${activeTab === 'overview' 
                    ? theme === 'dark' 
                      ? 'bg-blue-600/30 text-blue-300 border-b-2 border-blue-400' 
                      : 'bg-blue-100/80 text-blue-700 border-b-2 border-blue-500'
                    : theme === 'dark' 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-gray-600 hover:text-gray-800'
                  }
                `}
              >
                <Target size={14} />
                <span className="hidden sm:inline">Przegląd</span>
              </button>
              
              <button
                onClick={() => setActiveTab('history')}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-3 px-2 text-sm font-medium transition-all duration-200
                  ${activeTab === 'history' 
                    ? theme === 'dark' 
                      ? 'bg-green-600/30 text-green-300 border-b-2 border-green-400' 
                      : 'bg-green-100/80 text-green-700 border-b-2 border-green-500'
                    : theme === 'dark' 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-gray-600 hover:text-gray-800'
                  }
                `}
              >
                <History size={14} />
                <span className="hidden sm:inline">Historia</span>
              </button>
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-3 px-2 text-sm font-medium transition-all duration-200
                  ${activeTab === 'settings' 
                    ? theme === 'dark' 
                      ? 'bg-purple-600/30 text-purple-300 border-b-2 border-purple-400' 
                      : 'bg-purple-100/80 text-purple-700 border-b-2 border-purple-500'
                    : theme === 'dark' 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-gray-600 hover:text-gray-800'
                  }
                `}
              >
                <Settings size={14} />
                <span className="hidden sm:inline">Status</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {activeTab === 'overview' && (
                <div className="space-y-3">
                  <h4 className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    Przegląd nawyku
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Status dzisiaj
                      </div>
                      <div className={`text-lg font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {currentStatus === 'completed' ? '✅ Ukończone' : 
                         currentStatus === 'partial' ? '🟡 Częściowo' : 
                         currentStatus === 'failed' ? '❌ Nieudane' : '⚪ Brak'}
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Aktywne dni
                      </div>
                      <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {habit.validDays.length}/7 dni
                      </div>
                    </div>
                  </div>
                  
                  {/* Emergency Habit Text in Overview */}
                  {habit.emergencyHabitText && (
                    <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-yellow-900/20 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'}`}>
                      <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                        Wersja awaryjna:
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-yellow-100' : 'text-yellow-800'}`}>
                        {habit.emergencyHabitText}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-3">
                  <h4 className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    Historia ostatnich 7 dni
                  </h4>
                  <div className="space-y-2">
                    {historyDates.map(({ date, dateObj, label, isValid }) => {
                      if (!isValid) return null;
                      
                      const status = habitHistory[date] || 'none';
                      
                      return (
                        <div
                          key={date}
                          className={`
                            flex items-center justify-between p-3 rounded-xl transition-all duration-200
                            ${theme === 'dark' 
                              ? 'bg-white/5 border border-white/10' 
                              : 'bg-black/5 border border-black/10'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`
                              w-2 h-2 rounded-full
                              ${status === 'completed' ? 'bg-green-500' : 
                                status === 'partial' ? 'bg-yellow-500' : 
                                status === 'failed' ? 'bg-red-500' : 
                                theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                              }
                            `} />
                            <div>
                              <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {label}
                              </div>
                              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {dateObj.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric' })}
                              </div>
                            </div>
                          </div>
                          
                          <StatusPicker
                            currentStatus={status}
                            onStatusChange={(newStatus) => handleHistoryStatusChange(date, newStatus)}
                            isValidDay={true}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-3">
                  <h4 className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    Ustawienia nawyku
                  </h4>
                  
                  <div className="space-y-3">
                    <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}>
                      <div className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Zmień status dzisiejszy
                      </div>
                      <StatusPicker
                        currentStatus={currentStatus}
                        onStatusChange={handleStatusChange}
                        isValidDay={isValidToday}
                      />
                    </div>
                    
                    <button
                      onClick={() => setShowHistory(true)}
                      className={`
                        w-full flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-sm font-medium transition-all duration-200
                        ${theme === 'dark' 
                          ? 'bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-400/30' 
                          : 'bg-blue-100/80 text-blue-700 hover:bg-blue-200/80 border border-blue-300/50'
                        }
                      `}
                    >
                      <Settings size={14} />
                      Zaawansowane ustawienia
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Status Picker Dropdown */}
        {showStatusPicker && (
          <div className={`
            absolute top-full left-0 right-0 mt-2 rounded-xl shadow-lg z-50
            border
            ${theme === 'dark' 
              ? 'bg-gray-900/95 border-white/20' 
              : 'bg-white/95 border-black/20'
            }
          `}>
            <div className="p-4">
              <h4 className={`
                text-base font-medium mb-3
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                {t('habits.selectStatus')}
              </h4>
              
              <StatusPicker
                currentStatus={currentStatus}
                onStatusChange={handleStatusChange}
                isValidDay={isValidToday}
              />
            </div>
          </div>
        )}
      </div>

      {showHistory && (
        <HabitHistoryEditor
          habit={habit}
          statuses={statuses}
          onStatusChange={handleHistoryStatusChange}
          onDeleteHabit={onDeleteHabit}
          onClose={() => setShowHistory(false)}
          onUpdateHabit={onUpdateHabit}
          onArchiveHabit={onArchiveHabit}
          onUnarchiveHabit={onUnarchiveHabit}
          showArchivedView={showArchivedView}
        />
      )}
    </>
  );
};

export default HabitItem;