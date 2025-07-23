import React, { useState } from 'react';
import { Habit, HabitStatus, StatusType } from '../types/habit';
import { formatDate, isValidDay } from '../utils/storage';
import { getHabitStatusForDate, getStatusDisplay } from '../utils/habitUtils';
import HabitHistoryEditor from './HabitHistoryEditor';
import { Settings } from 'lucide-react';

interface HabitItemProps {
  habit: Habit;
  statuses: HabitStatus[];
  onStatusChange: (habitId: string, date: string, status: StatusType) => void;
}

const HabitItem: React.FC<HabitItemProps> = ({ habit, statuses, onStatusChange }) => {
  const [showHistory, setShowHistory] = useState(false);
  const today = new Date();
  const todayStr = formatDate(today);
  const currentStatus = getHabitStatusForDate(habit.id, todayStr, statuses);
  const statusDisplay = getStatusDisplay(currentStatus, habit, today);
  const isValidToday = isValidDay(habit, today);

  const cycleStatus = () => {
    if (!isValidToday) return;
    
    const statusCycle: (StatusType | null)[] = [null, 'completed', 'partial', 'failed', 'not-applicable'];
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusCycle.length;
    const nextStatus = statusCycle[nextIndex];
    
    if (nextStatus) {
      onStatusChange(habit.id, todayStr, nextStatus);
    }
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
                Streak: {habit.successCount}
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
                    title={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(true)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Edit history"
            >
              <Settings size={18} />
            </button>
            
            <button
              onClick={cycleStatus}
              disabled={!isValidToday}
              className={`
                w-16 h-16 rounded-full flex items-center justify-center text-2xl
                transition-all duration-200 active:scale-95
                ${isValidToday 
                  ? 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200' 
                  : 'bg-gray-100 cursor-not-allowed'
                }
              `}
              title={isValidToday ? `Current: ${statusDisplay.label}` : 'Not applicable today'}
            >
              {statusDisplay.emoji}
            </button>
          </div>
        </div>
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