import React, { useState, useRef } from 'react';
import { Habit, HabitStatus, StatusType } from '../types/habit';
import { formatDate, isValidDay } from '../utils/storage';
import { getHabitStatusForDate, getStatusDisplay } from '../utils/habitUtils';
import { triggerCelebration, celebrateStreak } from '../utils/celebrationEffects';
import HabitHistoryEditor from './HabitHistoryEditor';
import StatusPicker from './StatusPicker';
import { Settings, GripVertical } from 'lucide-react';
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
      <div className={`rounded-xl shadow-sm border p-3 sm:p-4 ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div 
              className={`p-1 cursor-grab active:cursor-grabbing ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`} 
              title={t('habits.dragToReorder')}
              role="button"
              tabIndex={0}
              aria-label={t('habits.dragToReorder')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  // Focus handling for keyboard users
                }
              }}
            >
              <GripVertical size={14} className="sm:w-4 sm:h-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-base sm:text-lg leading-tight break-words ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {habit.name}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs sm:text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {t('habits.streak')}: {habit.successCount}
                  </span>
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                  }`}>
                    ({t('habits.bestStreak')}: {habit.bestStreak})
                  </span>
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4, 5, 6].map(day => (
                    <div
                      key={day}
                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                        habit.validDays.includes(day) 
                          ? 'bg-blue-400' 
                          : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                      }`}
                      title={t(`habits.days.${day}`)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowHistory(true)}
              className={`p-1.5 sm:p-2 transition-colors ${
                theme === 'dark' 
                  ? 'text-gray-400 hover:text-gray-200' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title={t('habits.editHistory')}
              aria-label={`${t('habits.editHistory')} - ${habit.name}`}
            >
              <Settings size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            
            <button
              ref={buttonRef}
              onClick={toggleStatusPicker}
              disabled={!isValidToday}
              className={`
                celebration-button w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl
                transition-all duration-200 active:scale-95
                ${isValidToday 
                  ? theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 border-2 border-gray-600'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200'
                  : theme === 'dark'
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gray-100 cursor-not-allowed'
                }
              `}
              title={isValidToday ? t('habits.clickToSelect') : t('habits.notApplicableToday')}
              aria-label={`${habit.name} - ${statusDisplay.text}${isValidToday ? ` - ${t('habits.clickToSelect')}` : ` - ${t('habits.notApplicableToday')}`}`}
              aria-expanded={showStatusPicker}
            >
              {statusDisplay.emoji}
            </button>
          </div>
        </div>
        
        {/* Status Picker Dropdown */}
        {showStatusPicker && isValidToday && (
          <div className={`mt-4 p-4 rounded-lg border ${
            theme === 'dark' 
              ? 'bg-gray-700 border-gray-600' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <h4 className={`text-sm font-medium mb-3 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>{t('habits.selectStatus')}</h4>
            <StatusPicker
              currentStatus={currentStatus}
              onStatusChange={handleStatusChange}
              isValidDay={isValidToday}
            />
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