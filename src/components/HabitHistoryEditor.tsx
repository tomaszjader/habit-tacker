import React, { useState } from 'react';
import { Habit, HabitStatus, StatusType } from '../types/habit';
import { getDateDaysAgo, isValidDay } from '../utils/storage';
import { getHabitStatusForDate, getDateLabel } from '../utils/habitUtils';
import StatusPicker from './StatusPicker';
import Toast from './Toast';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';

interface HabitHistoryEditorProps {
  habit: Habit;
  statuses: HabitStatus[];
  onStatusChange: (date: string, status: StatusType) => void;
  onDeleteHabit: (habitId: string) => void;
  onClose: () => void;
}

const HabitHistoryEditor: React.FC<HabitHistoryEditorProps> = ({ habit, statuses, onStatusChange, onDeleteHabit, onClose }) => {
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(false);
  
  const dates = [0, 1, 2, 3].map(daysAgo => ({
    daysAgo,
    date: getDateDaysAgo(daysAgo),
    dateObj: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
    label: getDateLabel(daysAgo)
  }));

  const handleDeleteHabit = () => {
    if (window.confirm(t('habits.deleteConfirm'))) {
      onDeleteHabit(habit.id);
      setShowToast(true);
      // Zamknij modal po krótkim opóźnieniu, aby użytkownik zobaczył toast
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">{habit.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-6">
          {dates.map(({ daysAgo, date, dateObj, label }) => {
            const currentStatus = getHabitStatusForDate(habit.id, date, statuses);
            const isValid = isValidDay(habit, dateObj);
            
            return (
              <div key={date} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-gray-700">{label}</span>
                  <span className="text-sm text-gray-500">
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
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-center mb-4">
            <span className="text-sm text-gray-600">{t('habits.successStreak')}: </span>
            <span className="font-bold text-lg text-green-600">{habit.successCount}</span>
          </div>
          
          {/* Delete Button */}
          <button
            onClick={handleDeleteHabit}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg border border-red-200 transition-colors"
          >
            <Trash2 size={18} />
            {t('habits.delete')}
          </button>
        </div>
      </div>
      
      {/* Toast */}
      {showToast && (
        <Toast
          message={t('habits.deleted')}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default HabitHistoryEditor;