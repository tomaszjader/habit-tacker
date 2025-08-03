import React, { useState, useMemo } from 'react';
import { Habit, HabitStatus, StatusType } from '../types/habit';
import { getDateDaysAgo, isValidDay } from '../utils/storage';
import { getHabitStatusForDate, getDateLabel } from '../utils/habitUtils';
import StatusPicker from './StatusPicker';
import Toast from './Toast';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { Trash2, Edit3, History, Calendar, Archive, ArchiveRestore } from 'lucide-react';
import { showModernConfirm } from '../utils/modernDialogs';

interface HabitHistoryEditorProps {
  habit: Habit;
  statuses: HabitStatus[];
  onStatusChange: (date: string, status: StatusType) => void;
  onDeleteHabit: (habitId: string) => void;
  onClose: () => void;
  onUpdateHabit: (habitId: string, updates: Partial<Habit>) => void;
  onArchiveHabit?: (habitId: string) => void;
  onUnarchiveHabit?: (habitId: string) => void;
  showArchivedView?: boolean;
}

const HabitHistoryEditor: React.FC<HabitHistoryEditorProps> = ({ habit, statuses, onStatusChange, onDeleteHabit, onClose, onUpdateHabit, onArchiveHabit, onUnarchiveHabit, showArchivedView }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [emergencyHabitText, setEmergencyHabitText] = useState(habit.emergencyHabitText || '');
  const [isEditingEmergencyHabit, setIsEditingEmergencyHabit] = useState(!habit.emergencyHabitText);
  
  // New state for editing habit name and valid days
  const [isEditingHabitName, setIsEditingHabitName] = useState(false);
  const [habitName, setHabitName] = useState(habit.name);
  const [isEditingValidDays, setIsEditingValidDays] = useState(false);
  const [validDays, setValidDays] = useState(habit.validDays);

  // Construct history from statuses
  const habitHistory = useMemo(() => {
    const history: Record<string, StatusType> = {};
    statuses
      .filter(status => status.habitId === habit.id)
      .forEach(status => {
        history[status.date] = status.status;
      });
    return history;
  }, [statuses, habit.id]);

  // Function to update status
  const updateStatus = (date: string, newStatus: StatusType) => {
    onStatusChange(date, newStatus);
  };
  
  const dates = [0, 1, 2, 3].map(daysAgo => ({
    daysAgo,
    date: getDateDaysAgo(daysAgo),
    dateObj: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
    label: getDateLabel(daysAgo)
  }));

  const handleDeleteHabit = async () => {
    const confirmed = await showModernConfirm(t('habits.deleteConfirm'), 'Usuń', 'Anuluj');
    if (confirmed) {
      onDeleteHabit(habit.id);
      setToastMessage(t('habits.deleted'));
      setShowToast(true);
      // Zamknij modal po krótkim opóźnieniu, aby użytkownik zobaczył toast
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  const handleArchiveHabit = async () => {
    if (showArchivedView && onUnarchiveHabit) {
      const confirmed = await showModernConfirm('Czy chcesz przywrócić ten nawyk?', 'Przywróć', 'Anuluj');
      if (confirmed) {
        onUnarchiveHabit(habit.id);
        setToastMessage('Nawyk został przywrócony');
        setShowToast(true);
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } else if (!showArchivedView && onArchiveHabit) {
      const confirmed = await showModernConfirm('Czy chcesz przenieść ten nawyk do historii?', 'Archiwizuj', 'Anuluj');
      if (confirmed) {
        onArchiveHabit(habit.id);
        setToastMessage('Nawyk został przeniesiony do historii');
        setShowToast(true);
        setTimeout(() => {
          onClose();
        }, 500);
      }
    }
  };

  const handleEmergencyHabitSave = () => {
    const updates = { emergencyHabitText: emergencyHabitText.trim() || undefined };
    onUpdateHabit(habit.id, updates);
    setIsEditingEmergencyHabit(false);
    setToastMessage(t('habits.emergencyHabitSaved'));
    setShowToast(true);
  };

  const handleEditEmergencyHabit = () => {
    setIsEditingEmergencyHabit(true);
  };

  const handleHabitNameSave = () => {
    if (habitName.trim()) {
      const updates = { name: habitName.trim() };
      onUpdateHabit(habit.id, updates);
      setIsEditingHabitName(false);
      setToastMessage(t('habits.habitNameSaved'));
      setShowToast(true);
    }
  };

  const handleValidDaysSave = () => {
    if (validDays.length > 0) {
      const updates = { validDays };
      onUpdateHabit(habit.id, updates);
      setIsEditingValidDays(false);
      setToastMessage(t('habits.validDaysSaved'));
      setShowToast(true);
    }
  };

  const toggleValidDay = (day: number) => {
    setValidDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => a - b)
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className={`
        relative rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto
        ${theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-800/95 via-gray-700/90 to-gray-800/95 border border-white/20' 
          : 'bg-gradient-to-br from-white/95 via-gray-50/90 to-white/95 border border-gray-200/60'
        }
        backdrop-blur-xl shadow-2xl animate-slide-up
      `}>
        {/* Floating particles */}
        <div className="absolute top-6 right-8 w-1 h-1 rounded-full bg-purple-400/60 animate-particle-float" />
        <div className="absolute bottom-8 left-10 w-0.5 h-0.5 rounded-full bg-blue-400/60 animate-particle-float" style={{ animationDelay: '2s' }} />
        
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`
              p-3 rounded-2xl transition-all duration-500 hover:scale-110 hover:rotate-12
              ${theme === 'dark' ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100/80 text-blue-700'}
              shadow-lg backdrop-blur-sm
            `}>
              <History size={20} />
            </div>
            <h2 className={`text-2xl font-bold tracking-wide bg-gradient-to-r bg-clip-text text-transparent ${
              theme === 'dark' 
                ? 'from-white via-blue-100 to-purple-100' 
                : 'from-gray-900 via-blue-900 to-purple-900'
            }`}>
              {habit.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`
              w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 
              hover:scale-110 hover:rotate-90 group/close
              ${theme === 'dark' 
                ? 'bg-gray-700/60 text-gray-400 hover:text-white hover:bg-gray-600/80 border border-white/10' 
                : 'bg-gray-100/80 text-gray-500 hover:text-gray-700 hover:bg-gray-200/80 border border-gray-200/60'
              }
              backdrop-blur-sm shadow-lg
            `}
          >
            <span className="group-hover/close:scale-110 transition-transform duration-200">×</span>
          </button>
        </div>
        
        {/* Habit Editing Section */}
        <div className="space-y-4 mb-6">
          {/* Edit Habit Name */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {t('habits.name')}
              </label>
              {!isEditingHabitName && (
                <button
                  onClick={() => setIsEditingHabitName(true)}
                  className={`p-1 rounded transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  title={t('habits.editHabitName')}
                >
                  <Edit3 size={14} />
                </button>
              )}
            </div>
            
            {isEditingHabitName ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder={t('habits.name')}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleHabitNameSave}
                    disabled={!habitName.trim()}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    {t('habits.save')}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingHabitName(false);
                      setHabitName(habit.name);
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {t('habits.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <div className={`p-3 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}>
                {habit.name}
              </div>
            )}
          </div>

          {/* Edit Valid Days */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label className={`text-lg font-semibold flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                <Calendar size={18} className={theme === 'dark' ? 'text-blue-300' : 'text-blue-600'} />
                {t('habits.validDays')}
              </label>
              {!isEditingValidDays && (
                <button
                  onClick={() => setIsEditingValidDays(true)}
                  className={`p-1 rounded transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  title={t('habits.editValidDays')}
                >
                  <Edit3 size={14} />
                </button>
              )}
            </div>
            
            {isEditingValidDays ? (
              <div className="space-y-3">
                <div className={`
                  p-4 rounded-2xl grid grid-cols-7 gap-2 transition-all duration-300
                  ${theme === 'dark' 
                    ? 'bg-gray-700/40 border border-white/10' 
                    : 'bg-gray-50/80 border border-gray-200/60'
                  }
                  backdrop-blur-sm
                `}>
                  {[0, 1, 2, 3, 4, 5, 6].map(day => (
                    <button
                      key={day}
                      onClick={() => toggleValidDay(day)}
                      className={`
                        p-3 rounded-xl text-sm font-medium transition-all duration-300 
                        hover:scale-105 hover:shadow-lg group/day
                        ${validDays.includes(day)
                          ? theme === 'dark'
                            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                          : theme === 'dark'
                          ? 'bg-gray-600/60 text-gray-300 hover:bg-gray-500/80 border border-white/10'
                          : 'bg-white/80 text-gray-600 hover:bg-gray-100/80 border border-gray-200/60'
                        }
                        backdrop-blur-sm
                      `}
                    >
                      <span className="group-hover/day:scale-110 transition-transform duration-200">
                        {t(`habits.days.${day}`).slice(0, 3)}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleValidDaysSave}
                    disabled={validDays.length === 0}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    {t('habits.save')}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingValidDays(false);
                      setValidDays(habit.validDays);
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {t('habits.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <div className={`
                p-4 rounded-2xl flex gap-2 transition-all duration-300
                ${theme === 'dark' 
                  ? 'bg-gray-700/40 border border-white/10' 
                  : 'bg-gray-50/80 border border-gray-200/60'
                }
                backdrop-blur-sm
              `}>
                {[0, 1, 2, 3, 4, 5, 6].map(day => (
                  <div
                    key={day}
                    className={`
                      w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium
                      transition-all duration-300 hover:scale-105
                      ${habit.validDays.includes(day) 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                        : theme === 'dark' ? 'bg-gray-600/60 text-gray-400 border border-white/10' : 'bg-white/80 text-gray-500 border border-gray-200/60'
                      }
                      backdrop-blur-sm
                    `}
                    title={t(`habits.days.${day}`)}
                  >
                    {t(`habits.days.${day}`).slice(0, 1)}
                  </div>
                ))}
              </div>
            )}
          </div>

        {habit.isEmergency && (
          <div className={`
            relative p-6 rounded-2xl mb-8 transition-all duration-300 hover:scale-[1.02] group/emergency
            ${theme === 'dark' 
              ? 'bg-gradient-to-br from-red-900/30 via-red-800/20 to-red-900/30 border border-red-500/40' 
              : 'bg-gradient-to-br from-red-50/80 via-red-25/60 to-red-50/80 border border-red-200/60'
            }
            backdrop-blur-sm shadow-lg
          `}>
            {/* Emergency glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/10 via-transparent to-red-500/10 opacity-0 group-hover/emergency:opacity-100 transition-opacity duration-500" />
            
            <div className="relative flex items-center gap-3 mb-3">
              <div className={`
                p-2 rounded-xl transition-all duration-300 group-hover/emergency:scale-110 group-hover/emergency:rotate-12
                ${theme === 'dark' ? 'bg-red-500/20 text-red-300' : 'bg-red-100/80 text-red-700'}
                shadow-lg
              `}>
                ⚠️
              </div>
              <span className={`font-semibold text-lg ${
                theme === 'dark' ? 'text-red-300' : 'text-red-700'
              }`}>
                {t('habits.emergencyHabit')}
              </span>
            </div>
            <p className={`text-sm leading-relaxed ${
              theme === 'dark' ? 'text-red-200/90' : 'text-red-600/90'
            }`}>
              {t('habits.emergencyDescription')}
            </p>
          </div>
        )}

        {/* History Section */}
        <div className="mb-8">
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            <History size={18} className={theme === 'dark' ? 'text-green-300' : 'text-green-600'} />
            {t('habits.history')}
          </h3>
          <div className={`
            space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin
            ${theme === 'dark' ? 'scrollbar-thumb-gray-600 scrollbar-track-gray-800' : 'scrollbar-thumb-gray-300 scrollbar-track-gray-100'}
          `}>
            {Object.entries(habitHistory)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, status]) => {
                const dateObj = new Date(date);
                const dayOfWeek = dateObj.getDay();
                const isValidDay = habit.validDays.includes(dayOfWeek);
                
                if (!isValidDay) return null;
                
                return (
                  <div
                    key={date}
                    className={`
                      flex items-center justify-between p-4 rounded-2xl transition-all duration-300 
                      hover:scale-[1.02] hover:shadow-lg group/history
                      ${theme === 'dark' 
                        ? 'bg-gradient-to-r from-gray-700/60 via-gray-600/40 to-gray-700/60 border border-white/10' 
                        : 'bg-gradient-to-r from-white/80 via-gray-50/60 to-white/80 border border-gray-200/60'
                      }
                      backdrop-blur-sm shadow-md
                    `}
                  >
                    <div className={`text-sm font-medium ${
                       theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                     }`}>
                       {dateObj.toLocaleDateString(t('language') === 'pl' ? 'pl-PL' : 'en-US', { 
                         weekday: 'long', 
                         year: 'numeric', 
                         month: 'long', 
                         day: 'numeric' 
                       })}
                     </div>
                     <div className="group-hover/history:scale-105 transition-transform duration-200">
                       <StatusPicker
                         status={status}
                         onStatusChange={(newStatus) => updateStatus(date, newStatus)}
                         theme={theme}
                         isValidDay={true}
                       />
                     </div>
                  </div>
                );
              })}
          </div>
        </div>
        </div>
        
        <div className={`border-t mb-6 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}></div>
        
        <div className="space-y-6">
          {dates.map(({ daysAgo, date, dateObj, label }) => {
            const currentStatus = getHabitStatusForDate(habit.id, date, statuses);
            const isValid = isValidDay(habit, dateObj);
            
            return (
              <div key={date} className={`rounded-lg p-4 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex justify-between items-center mb-3">
                  <span className={`font-medium ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>{label}</span>
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {dateObj.toLocaleDateString(t('language') === 'pl' ? 'pl-PL' : 'en-US')}
                  </span>
                </div>
                
                <StatusPicker
                  currentStatus={currentStatus}
                  onStatusChange={(status) => onStatusChange(date, status)}
                  isValidDay={isValid}
                />
              </div>
            );
          })}
        </div>
        
        <div className={`mt-6 pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
          <div className="text-center mb-4">
            <span className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>{t('habits.successStreak')}: </span>
            <span className="font-bold text-lg text-green-500">{habit.successCount}</span>
          </div>
          
          {/* Emergency Habit Settings */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              {t('habits.emergencyHabit')}
            </label>
            <p className={`text-xs mb-3 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {t('habits.emergencyHabitDescription')}
            </p>
            
            {isEditingEmergencyHabit ? (
              <div className="space-y-3">
                <textarea
                  value={emergencyHabitText}
                  onChange={(e) => setEmergencyHabitText(e.target.value)}
                  placeholder={t('habits.emergencyHabitPlaceholder')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  rows={2}
                />
                <button
                  onClick={handleEmergencyHabitSave}
                  className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  {t('habits.save')}
                </button>
              </div>
            ) : habit.emergencyHabitText ? (
              <div className="space-y-3">
                <div className={`p-3 border rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-green-900/20 border-green-700 text-green-300' 
                    : 'bg-green-50 border-green-200 text-green-700'
                }`}>
                  <p className={`text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`}>
                    {t('habits.emergencyHabit')}:
                  </p>
                  <p className="text-sm">
                    {habit.emergencyHabitText}
                  </p>
                </div>
                <button
                  onClick={handleEditEmergencyHabit}
                  className={`w-full px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {t('habits.edit')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={emergencyHabitText}
                  onChange={(e) => setEmergencyHabitText(e.target.value)}
                  placeholder={t('habits.emergencyHabitPlaceholder')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  rows={2}
                />
                <button
                  onClick={handleEmergencyHabitSave}
                  className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  {t('habits.save')}
                </button>
              </div>
            )}
          </div>
          
          {/* Archive/Unarchive Button */}
          {(onArchiveHabit || onUnarchiveHabit) && (
            <button
              onClick={handleArchiveHabit}
              className={`
                relative w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-semibold mb-4
                transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group/archive overflow-hidden
                ${showArchivedView
                  ? theme === 'dark'
                    ? 'bg-gradient-to-r from-green-600 via-green-500 to-green-600 hover:from-green-500 hover:to-green-700 text-white border border-green-400/30'
                    : 'bg-gradient-to-r from-green-500 via-green-400 to-green-500 hover:from-green-400 hover:to-green-600 text-white border border-green-300/30'
                  : theme === 'dark'
                    ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white border border-orange-400/30'
                    : 'bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 hover:from-orange-400 hover:to-orange-600 text-white border border-orange-300/30'
                }
                ${showArchivedView ? 'shadow-lg shadow-green-500/25' : 'shadow-lg shadow-orange-500/25'}
              `}
            >
              {/* Ripple effect background */}
              <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover/archive:opacity-100 transition-opacity duration-500 ${
                showArchivedView 
                  ? 'from-green-400/20 via-transparent to-green-400/20'
                  : 'from-orange-400/20 via-transparent to-orange-400/20'
              }`} />
              
              <div className="relative flex items-center gap-3">
                <div className="group-hover/archive:scale-110 group-hover/archive:rotate-12 transition-transform duration-300">
                  {showArchivedView ? <ArchiveRestore size={20} /> : <Archive size={20} />}
                </div>
                <span className="group-hover/archive:scale-105 transition-transform duration-200">
                  {showArchivedView ? 'Przywróć' : 'Archiwizuj'}
                </span>
              </div>
            </button>
          )}
          
          {/* Delete Button */}
          <button
            onClick={handleDeleteHabit}
            className={`
              relative w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-semibold 
              transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group/delete overflow-hidden
              ${theme === 'dark'
                ? 'bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:to-red-700 text-white border border-red-400/30'
                : 'bg-gradient-to-r from-red-500 via-red-400 to-red-500 hover:from-red-400 hover:to-red-600 text-white border border-red-300/30'
              }
              shadow-lg shadow-red-500/25
            `}
          >
            {/* Ripple effect background */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 via-transparent to-red-400/20 opacity-0 group-hover/delete:opacity-100 transition-opacity duration-500" />
            
            <div className="relative flex items-center gap-3">
              <div className="group-hover/delete:scale-110 group-hover/delete:rotate-12 transition-transform duration-300">
                <Trash2 size={20} />
              </div>
              <span className="group-hover/delete:scale-105 transition-transform duration-200">
                {t('habits.delete')}
              </span>
            </div>
          </button>
        </div>
      </div>
      
      {/* Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default HabitHistoryEditor;