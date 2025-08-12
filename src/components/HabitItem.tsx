import React, { useState, useRef, useEffect } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const todayStr = formatDate(today);
  const currentStatus = getHabitStatusForDate(habit.id, todayStr, statuses);
  const statusDisplay = getStatusDisplay(currentStatus, habit, today);
  const isValidToday = isValidDay(habit, today);

  const toggleStatusPicker = () => {
    if (!isValidToday) return;
    setShowStatusPicker(!showStatusPicker);
  };

  // Scroll to ensure status picker is visible when opened
  useEffect(() => {
    if (showStatusPicker && containerRef.current) {
      setTimeout(() => {
        containerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }, 100);
    }
  }, [showStatusPicker]);

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
      <div 
        ref={containerRef}
        className={`rounded-xl shadow-sm border p-3 sm:p-4 transition-all duration-300 hover:shadow-md dark-mode-enhanced ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
            : 'bg-white border-gray-100 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div 
              className={`p-1 cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-110 focus-enhanced touch-target ${
                theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
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
              <GripVertical size={14} className="sm:w-4 sm:h-4 transition-transform duration-200" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`visual-hierarchy-2 text-base sm:text-lg leading-tight break-words transition-colors duration-200 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {habit.name}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                <div className="flex items-center gap-2 animate-fade-in">
                  <span className={`text-xs sm:text-sm visual-hierarchy-3 transition-colors duration-200 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {t('habits.streak')}: <span className="font-medium">{habit.successCount}</span>
                  </span>
                  <span className={`text-xs visual-hierarchy-3 transition-colors duration-200 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                  }`}>
                    ({t('habits.bestStreak')}: <span className="font-medium">{habit.bestStreak}</span>)
                  </span>
                </div>
                <div className="flex gap-1 animate-fade-in" style={{animationDelay: '0.1s'}}>
                  {[0, 1, 2, 3, 4, 5, 6].map((day, index) => (
                    <div
                      key={day}
                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-200 hover:scale-125 ${
                        habit.validDays.includes(day) 
                          ? 'bg-blue-400 animate-bounce-gentle' 
                          : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                      }`}
                      title={t(`habits.days.${day}`)}
                      style={{animationDelay: `${index * 0.05}s`}}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowHistory(true)}
              className={`p-1.5 sm:p-2 transition-all duration-200 hover:scale-110 focus-enhanced touch-target rounded-lg ${
                theme === 'dark' 
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title={t('habits.editHistory')}
              aria-label={`${t('habits.editHistory')} - ${habit.name}`}
            >
              <Settings size={16} className="sm:w-[18px] sm:h-[18px] transition-transform duration-200 hover:rotate-90" />
            </button>
            
            <button
              ref={buttonRef}
              onClick={toggleStatusPicker}
              disabled={!isValidToday}
              className={`
                celebration-button w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl
                transition-all duration-300 active:scale-95 focus-enhanced touch-target
                ${isValidToday 
                  ? theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 hover:scale-110 hover:shadow-lg'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 hover:scale-110 hover:shadow-lg'
                  : theme === 'dark'
                    ? 'bg-gray-700 cursor-not-allowed opacity-50'
                    : 'bg-gray-100 cursor-not-allowed opacity-50'
                }
                ${showStatusPicker ? 'animate-bounce-gentle' : ''}
              `}
              title={isValidToday ? t('habits.clickToSelect') : t('habits.notApplicableToday')}
              aria-label={`${habit.name} - ${statusDisplay.text}${isValidToday ? ` - ${t('habits.clickToSelect')}` : ` - ${t('habits.notApplicableToday')}`}`}
              aria-expanded={showStatusPicker}
            >
              <span className="transition-transform duration-200 hover:scale-110">
                {statusDisplay.emoji}
              </span>
            </button>
          </div>
        </div>
        
        {/* Status Picker Dropdown */}
        {showStatusPicker && isValidToday && (
          <div className={`relative mt-4 p-4 rounded-lg border shadow-lg z-50 animate-scale-in dark-mode-enhanced ${
            theme === 'dark' 
              ? 'bg-gray-700 border-gray-600' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <h4 className={`text-sm font-medium mb-3 visual-hierarchy-3 animate-fade-in ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>{t('habits.selectStatus')}</h4>
            <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
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
        />
      )}
    </>
  );
};

export default HabitItem;