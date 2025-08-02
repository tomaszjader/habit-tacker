import React, { useState, useRef } from 'react';
import { Habit, HabitStatus, StatusType } from '../types/habit';
import { formatDate, isValidDay } from '../utils/storage';
import { getHabitStatusForDate, getStatusDisplay } from '../utils/habitUtils';
import { triggerCelebration, celebrateStreak } from '../utils/celebrationEffects';
import HabitHistoryEditor from './HabitHistoryEditor';
import StatusPicker from './StatusPicker';
import { Settings, GripVertical, Calendar, MoreVertical, Zap, TrendingUp, Target, Sparkles, Crown, Award, History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

interface HabitItemProps {
  habit: Habit;
  statuses: HabitStatus[];
  onStatusChange: (habitId: string, date: string, status: StatusType) => void;
  onDeleteHabit: (habitId: string) => void;
  onUpdateHabit: (habitId: string, updates: Partial<Habit>) => void;
}

const HabitItem: React.FC<HabitItemProps> = ({ habit, statuses, onStatusChange, onDeleteHabit, onUpdateHabit }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [showHistory, setShowHistory] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
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

        {/* Header Row */}
        <div className="flex items-center justify-between gap-4 mb-6 relative z-10">
          {/* Premium Drag Handle */}
          <div className={`
            relative p-3 rounded-2xl transition-all duration-500 cursor-grab active:cursor-grabbing group/drag
            hover:scale-110 hover:rotate-12 active:scale-95 active:rotate-6
            ${theme === 'dark' 
              ? 'bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/20 hover:border-white/30' 
              : 'bg-gradient-to-br from-black/8 to-black/4 hover:from-black/15 hover:to-black/8 border border-black/15 hover:border-black/25'
            }
            backdrop-blur-sm shadow-lg hover:shadow-xl
          `}>
            <GripVertical size={18} className={`transition-all duration-500 group-hover/drag:scale-110 ${
              theme === 'dark' ? 'text-white/70 group-hover/drag:text-white' : 'text-gray-600 group-hover/drag:text-gray-800'
            }`} />
            
            {/* Micro glow effect */}
            <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover/drag:opacity-100 transition-opacity duration-500 ${
              theme === 'dark' ? 'bg-white/5' : 'bg-black/5'
            } blur-sm -z-10`} />
          </div>

          {/* Enhanced Habit Name with Premium Typography */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              {/* Achievement Badge */}
              {habit.bestStreak >= 30 && (
                <div className={`
                  p-1.5 rounded-xl transition-all duration-500 hover:scale-110 hover:rotate-12
                  ${theme === 'dark' 
                    ? 'bg-gradient-to-br from-yellow-400/20 to-orange-400/20 border border-yellow-400/30' 
                    : 'bg-gradient-to-br from-yellow-100/80 to-orange-100/80 border border-yellow-300/50'
                  }
                  animate-pulse shadow-lg
                `}>
                  <Crown size={14} className={`${
                    theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                  } animate-bounce`} />
                </div>
              )}
              
              <h3 className={`
                habit-title font-bold text-xl tracking-tight truncate transition-all duration-500
                hover:scale-[1.02] cursor-default relative
                ${theme === 'dark' 
                  ? 'text-transparent bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text' 
                  : 'text-transparent bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text'
                }
                hover:from-blue-400 hover:via-purple-400 hover:to-emerald-400
              `}>
                {habit.name}
                
                {/* Text glow effect */}
                <div className={`absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 blur-sm ${
                  theme === 'dark' ? 'text-blue-400/50' : 'text-blue-600/30'
                }`}>
                  {habit.name}
                </div>
              </h3>
              
              {/* Enhanced Progress Indicator */}
              <div className="flex items-center gap-2">
                <div className={`
                  w-3 h-3 rounded-full transition-all duration-500 relative
                  ${habit.successCount > 0 
                    ? 'bg-gradient-to-r from-emerald-400 to-green-500 animate-pulse shadow-lg shadow-emerald-400/50' 
                    : theme === 'dark' ? 'bg-white/20' : 'bg-black/20'
                  }
                  hover:scale-125 hover:shadow-xl
                `}>
                  {habit.successCount > 0 && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 animate-ping opacity-75" />
                  )}
                </div>
                
                {/* Streak indicator */}
                {habit.successCount >= 7 && (
                  <div className={`
                    flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold
                    ${theme === 'dark' 
                      ? 'bg-gradient-to-r from-emerald-900/50 to-green-900/50 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200'
                    }
                    animate-bounce shadow-lg
                  `}>
                    <Sparkles size={10} className="animate-spin" />
                    {habit.successCount}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Premium Status Button */}
          <button
            ref={buttonRef}
            onClick={() => setShowStatusPicker(!showStatusPicker)}
            className={`
              relative px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-500
              hover:scale-110 hover:shadow-2xl active:scale-95 group/status overflow-hidden
              ${getStatusButtonStyle(currentStatus)}
              backdrop-blur-sm border-2 hover:border-opacity-100
              transform-gpu will-change-transform
            `}
          >
            {/* Premium ripple effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                           translate-x-[-150%] group-hover/status:translate-x-[150%] transition-transform duration-1000 ease-out" />
            
            {/* Dynamic status ring */}
            <div className={`absolute inset-0 rounded-2xl border-2 transition-all duration-500
              ${currentStatus === 'completed' 
                ? 'border-emerald-400/60 animate-pulse shadow-lg shadow-emerald-400/30' 
                : currentStatus === 'partial'
                ? 'border-yellow-400/60 animate-pulse shadow-lg shadow-yellow-400/30'
                : currentStatus === 'failed'
                ? 'border-red-400/60 animate-pulse shadow-lg shadow-red-400/30'
                : 'border-transparent'
              }`} />
            
            {/* Status icon */}
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 transition-all duration-500 group-hover/status:scale-110">
              {currentStatus === 'completed' && (
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
              )}
              {currentStatus === 'partial' && (
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shadow-lg shadow-yellow-400/50" />
              )}
              {currentStatus === 'failed' && (
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse shadow-lg shadow-red-400/50" />
              )}
              {currentStatus === 'none' && (
                <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-white/40' : 'bg-gray-400'}`} />
              )}
            </div>
            
            {/* Glow effect for completed status */}
            {currentStatus === 'completed' && (
              <div className="absolute inset-0 rounded-2xl bg-emerald-400/20 animate-pulse blur-sm" />
            )}
            
            <span className="relative z-10 ml-4 tracking-wide">{statusDisplay.text}</span>
            
            {/* Hover sparkle effect */}
            <div className="absolute top-1 right-1 opacity-0 group-hover/status:opacity-100 transition-opacity duration-500">
              <Sparkles size={12} className={`${
                theme === 'dark' ? 'text-white/60' : 'text-gray-600'
              } animate-spin`} />
            </div>
          </button>
        </div>

        {/* Premium Stats Section */}
        <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
          {/* Current Streak Card */}
          <div className={`
            stats-card relative overflow-hidden rounded-3xl p-4 transition-all duration-700
            hover:scale-[1.08] hover:shadow-2xl hover:-translate-y-1 group/streak
            ${theme === 'dark' 
              ? 'bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-400/30 hover:border-blue-400/50' 
              : 'bg-gradient-to-br from-blue-50/90 via-indigo-50/80 to-purple-50/90 border border-blue-300/40 hover:border-blue-400/60'
            }
            backdrop-blur-xl shadow-lg hover:shadow-glow
          `}>
            {/* Floating particles */}
            <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-blue-400/60 animate-particle-float" />
            <div className="absolute bottom-3 left-3 w-0.5 h-0.5 rounded-full bg-purple-400/60 animate-particle-float" style={{ animationDelay: '1s' }} />
            
            <div className="flex items-center gap-3 mb-3">
              <div className={`
                p-2 rounded-2xl transition-all duration-500 group-hover/streak:scale-110 group-hover/streak:rotate-12
                ${theme === 'dark' ? 'bg-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/20' : 'bg-blue-200/80 text-blue-700 shadow-lg shadow-blue-200/40'}
                backdrop-blur-sm
              `}>
                <Zap size={16} className="group-hover/streak:animate-bounce transition-all duration-500" />
              </div>
              <span className={`text-sm font-bold tracking-wide ${
                theme === 'dark' ? 'text-blue-100' : 'text-blue-800'
              }`}>
                {t('habits.currentStreak')}
              </span>
            </div>
            
            <div className="flex items-end justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-black tracking-tight ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {habit.successCount}
                </span>
                {habit.successCount > 0 && (
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
                )}
              </div>
              <span className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
              }`}>
                {t('habits.daysText')}
              </span>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className={`relative h-2 rounded-full overflow-hidden ${
              theme === 'dark' ? 'bg-blue-900/40' : 'bg-blue-100/80'
            } shadow-inner`}>
              <div 
                className="h-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 transition-all duration-1500 ease-out relative overflow-hidden"
                style={{ width: `${Math.min((habit.successCount / Math.max(habit.bestStreak, 7)) * 100, 100)}%` }}
              >
                {/* Shimmer effect on progress bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
            
            {/* Ambient glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover/streak:opacity-100 transition-opacity duration-700 blur-xl -z-10" />
          </div>

          {/* Best Streak Card */}
          <div className={`
            stats-card relative overflow-hidden rounded-3xl p-4 transition-all duration-700
            hover:scale-[1.08] hover:shadow-2xl hover:-translate-y-1 group/best
            ${theme === 'dark' 
              ? 'bg-gradient-to-br from-emerald-900/40 via-green-900/30 to-teal-900/40 border border-emerald-400/30 hover:border-emerald-400/50' 
              : 'bg-gradient-to-br from-emerald-50/90 via-green-50/80 to-teal-50/90 border border-emerald-300/40 hover:border-emerald-400/60'
            }
            backdrop-blur-xl shadow-lg hover:shadow-glow-green
          `}>
            {/* Floating particles */}
            <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-emerald-400/60 animate-particle-float" />
            <div className="absolute bottom-3 left-3 w-0.5 h-0.5 rounded-full bg-green-400/60 animate-particle-float" style={{ animationDelay: '1.5s' }} />
            
            <div className="flex items-center gap-3 mb-3">
              <div className={`
                p-2 rounded-2xl transition-all duration-500 group-hover/best:scale-110 group-hover/best:rotate-12
                ${theme === 'dark' ? 'bg-emerald-500/30 text-emerald-300 shadow-lg shadow-emerald-500/20' : 'bg-emerald-200/80 text-emerald-700 shadow-lg shadow-emerald-200/40'}
                backdrop-blur-sm
              `}>
                <TrendingUp size={16} className="group-hover/best:animate-bounce transition-all duration-500" />
              </div>
              <span className={`text-sm font-bold tracking-wide ${
                theme === 'dark' ? 'text-emerald-100' : 'text-emerald-800'
              }`}>
                {t('habits.bestStreak')}
              </span>
            </div>
            
            <div className="flex items-end justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-black tracking-tight ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {habit.bestStreak}
                </span>
                
                {/* Enhanced Achievement Badges */}
                {habit.bestStreak >= 30 && (
                  <Crown size={14} className={`${
                    theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                  } animate-bounce shadow-lg`} />
                )}
                {habit.bestStreak >= 7 && habit.bestStreak < 30 && (
                  <Award size={12} className={`${
                    theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                  } animate-pulse`} />
                )}
              </div>
              <span className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'
              }`}>
                {t('habits.daysText')}
              </span>
            </div>
            
            {/* Achievement progress indicator */}
            <div className={`relative h-2 rounded-full overflow-hidden ${
              theme === 'dark' ? 'bg-emerald-900/40' : 'bg-emerald-100/80'
            } shadow-inner`}>
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 transition-all duration-1500 ease-out relative overflow-hidden"
                style={{ width: `${Math.min((habit.bestStreak / 30) * 100, 100)}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
            
            {/* Ambient glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 opacity-0 group-hover/best:opacity-100 transition-opacity duration-700 blur-xl -z-10" />
          </div>
        </div>

        {/* Premium Weekly Schedule */}
        <div className={`
          relative p-5 rounded-3xl transition-all duration-700 hover:scale-[1.02] hover:-translate-y-1 mb-6 group/schedule
          ${theme === 'dark' 
            ? 'bg-gradient-to-br from-gray-800/60 via-gray-700/50 to-gray-800/60 border border-white/20 hover:border-white/30' 
            : 'bg-gradient-to-br from-gray-50/90 via-white/80 to-gray-50/90 border border-gray-200/60 hover:border-gray-300/80'
          }
          backdrop-blur-xl shadow-lg hover:shadow-2xl relative z-10
        `}>
          {/* Floating particles */}
          <div className="absolute top-3 right-4 w-0.5 h-0.5 rounded-full bg-purple-400/60 animate-particle-float" />
          <div className="absolute bottom-4 left-6 w-1 h-1 rounded-full bg-blue-400/60 animate-particle-float" style={{ animationDelay: '2s' }} />
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`
                p-2 rounded-2xl transition-all duration-500 group-hover/schedule:scale-110 group-hover/schedule:rotate-12
                ${theme === 'dark' ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100/80 text-purple-700'}
                shadow-lg backdrop-blur-sm
              `}>
                <Calendar size={16} className="group-hover/schedule:animate-bounce" />
              </div>
              <span className={`text-sm font-bold tracking-wide ${
                theme === 'dark' ? 'text-white/90' : 'text-gray-800'
              }`}>
                Harmonogram
              </span>
            </div>
            
            <div className={`
              px-3 py-1.5 rounded-2xl text-sm font-bold transition-all duration-500 hover:scale-105
              ${theme === 'dark' 
                ? 'bg-gradient-to-r from-white/15 to-white/10 text-white/80 border border-white/20' 
                : 'bg-gradient-to-r from-gray-100/80 to-gray-50/80 text-gray-700 border border-gray-200/60'
              }
              backdrop-blur-sm shadow-lg
            `}>
              {habit.validDays.length}/7
            </div>
          </div>
          
          <div className="weekly-schedule flex gap-3 justify-between">
            {['N', 'P', 'W', 'Ś', 'C', 'P', 'S'].map((dayName, index) => (
              <div key={index} className="flex flex-col items-center gap-2 group/day">
                <div className={`text-xs font-bold tracking-wider ${
                  theme === 'dark' ? 'text-white/60' : 'text-gray-500'
                }`}>
                  {dayName}
                </div>
                <div
                  className={`
                    day-indicator w-8 h-8 rounded-2xl flex items-center justify-center transition-all duration-500 
                    hover:scale-125 hover:shadow-xl hover:-translate-y-1 cursor-pointer group-hover/day:rotate-12
                    ${habit.validDays.includes(index) 
                      ? theme === 'dark'
                        ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/30'
                        : 'bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/30'
                      : theme === 'dark' 
                        ? 'bg-gradient-to-br from-gray-700/60 to-gray-600/60 text-white/40 border border-white/10 hover:border-white/20' 
                        : 'bg-gradient-to-br from-gray-200/80 to-gray-100/80 text-gray-400 border border-gray-300/50 hover:border-gray-400/60'
                    }
                    backdrop-blur-sm relative overflow-hidden
                  `}
                  title={t(`habits.days.${index}`)}
                >
                  {habit.validDays.includes(index) ? (
                    <div className="relative">
                      <div className="w-3 h-3 rounded-full bg-white/95 shadow-lg" />
                      <div className="absolute inset-0 w-3 h-3 rounded-full bg-white/50 animate-ping" />
                    </div>
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${
                      theme === 'dark' ? 'bg-white/20' : 'bg-gray-400/50'
                    }`} />
                  )}
                  
                  {/* Shimmer effect for active days */}
                  {habit.validDays.includes(index) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/day:opacity-100 transition-opacity duration-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Ambient glow */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-purple-500/15 to-blue-500/15 opacity-0 group-hover/schedule:opacity-100 transition-opacity duration-700 blur-xl -z-10" />
        </div>

        {/* Premium Action Buttons */}
        <div className="action-buttons flex gap-4">
          <button
            onClick={() => setShowHistory(true)}
            className={`
              action-button group/btn flex-1 flex items-center justify-center gap-3 py-4 px-5 rounded-3xl font-bold transition-all duration-500 
              hover:scale-105 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden
              ${theme === 'dark' 
                ? 'bg-gradient-to-br from-gray-700/60 via-gray-600/50 to-gray-700/60 text-white/90 hover:from-gray-600/70 hover:to-gray-500/70 border border-white/20 hover:border-white/30' 
                : 'bg-gradient-to-br from-gray-100/90 via-white/80 to-gray-100/90 text-gray-800 hover:from-gray-200/95 hover:to-gray-50/95 border border-gray-200/60 hover:border-gray-300/80'
              }
              backdrop-blur-xl shadow-lg
            `}
          >
            <div className={`
              p-1.5 rounded-2xl transition-all duration-500 group-hover/btn:scale-110 group-hover/btn:rotate-12
              ${theme === 'dark' ? 'bg-white/10 text-white/80' : 'bg-gray-200/60 text-gray-700'}
            `}>
              <Calendar size={16} className="group-hover/btn:animate-bounce" />
            </div>
            <span className="text-sm tracking-wide">Historia</span>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 -skew-x-12" />
          </button>
          
          <button
            onClick={() => setShowStatusPicker(true)}
            className={`
              action-button group/btn flex-1 flex items-center justify-center gap-3 py-4 px-5 rounded-3xl font-bold transition-all duration-500 
              hover:scale-105 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden
              ${theme === 'dark' 
                ? 'bg-gradient-to-br from-blue-600/60 via-purple-600/50 to-indigo-600/60 text-white hover:from-blue-500/70 hover:to-purple-500/70 border border-blue-400/40 hover:border-blue-300/50' 
                : 'bg-gradient-to-br from-blue-500/90 via-purple-500/80 to-indigo-500/90 text-white hover:from-blue-600/95 hover:to-purple-600/95 border border-blue-400/60 hover:border-blue-300/70'
              }
              backdrop-blur-xl shadow-lg shadow-blue-500/20
            `}
          >
            <div className={`
              p-1.5 rounded-2xl transition-all duration-500 group-hover/btn:scale-110 group-hover/btn:rotate-12
              ${theme === 'dark' ? 'bg-white/20 text-white/90' : 'bg-white/30 text-white'}
            `}>
              <Settings size={16} className="group-hover/btn:animate-spin" />
            </div>
            <span className="text-sm tracking-wide">Status</span>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 -skew-x-12" />
            
            {/* Glow effect */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 blur-lg -z-10" />
          </button>
        </div>
        
        {/* Premium Status Picker Dropdown */}
        {showStatusPicker && (
          <div className={`
            absolute top-full left-0 right-0 mt-2 rounded-3xl shadow-2xl z-50
            backdrop-blur-xl border animate-slide-down relative overflow-hidden
            ${theme === 'dark' 
              ? 'bg-gray-900/95 border-white/30 shadow-glow' 
              : 'bg-white/95 border-black/15 shadow-tesla'
            }
          `}>
            {/* Floating particles */}
            <div className="absolute top-4 right-6 w-1 h-1 rounded-full bg-purple-400/60 animate-particle-float" />
            <div className="absolute bottom-6 left-8 w-0.5 h-0.5 rounded-full bg-blue-400/60 animate-particle-float" style={{ animationDelay: '1.5s' }} />
            
            <div className="relative p-6">
              {/* Enhanced Title */}
              <h4 className={`
                text-center font-bold text-sm mb-4 bg-gradient-to-r bg-clip-text text-transparent tracking-wide
                ${theme === 'dark' 
                  ? 'from-white via-blue-100 to-purple-100' 
                  : 'from-gray-900 via-blue-900 to-purple-900'
                }
              `}>
                {t('habits.selectStatus')}
              </h4>
              
              <StatusPicker
                currentStatus={currentStatus}
                onStatusChange={handleStatusChange}
                isValidDay={isValidToday}
              />
            </div>
            
            {/* Ambient glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-xl -z-10" />
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
        />
      )}
    </>
  );
};

export default HabitItem;