import React, { useState, useRef } from 'react';
import { Habit, HabitStatus, StatusType } from '../types/habit';
import { formatDate, isValidDay } from '../utils/storage';
import { getHabitStatusForDate, getStatusDisplay } from '../utils/habitUtils';
import { triggerCelebration, celebrateStreak } from '../utils/celebrationEffects';
import HabitHistoryEditor from './HabitHistoryEditor';
import StatusPicker from './StatusPicker';
import { Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HabitItemProps {
  habit: Habit;
  statuses: HabitStatus[];
  onStatusChange: (habitId: string, date: string, status: StatusType) => void;
}

const HabitItem: React.FC<HabitItemProps> = ({ habit, statuses, onStatusChange }) => {
  const { t } = useTranslation();
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-lg truncate">
              {habit.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500">
                {t('habits.streak')}: {habit.successCount}
              </span>
              <span className="text-xs text-gray-400">
                ({t('habits.bestStreak')}: {habit.bestStreak})
              </span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4, 5, 6].map(day => (
                  <div
                    key={day}
                    className={`w-2 h-2 rounded-full ${
                      habit.validDays.includes(day) 
                        ? 'bg-blue-400' 
                        : 'bg-gray-200'
                    }`}
                    title={t(`habits.days.${day}`)}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(true)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title={t('habits.editHistory')}
            >
              <Settings size={18} />
            </button>
            
            <button
              ref={buttonRef}
              onClick={toggleStatusPicker}
              disabled={!isValidToday}
              className={`
                celebration-button w-16 h-16 rounded-full flex items-center justify-center text-2xl
                transition-all duration-200 active:scale-95
                ${isValidToday 
                  ? 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200' 
                  : 'bg-gray-100 cursor-not-allowed'
                }
              `}
              title={isValidToday ? t('habits.clickToSelect') : t('habits.notApplicableToday')}
            >
              {statusDisplay.emoji}
            </button>
          </div>
        </div>
        
        {/* Status Picker Dropdown */}
        {showStatusPicker && isValidToday && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <h4 className="text-sm font-medium text-gray-700 mb-3">{t('habits.selectStatus')}</h4>
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
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  );
};

export default HabitItem;