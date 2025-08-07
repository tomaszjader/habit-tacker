import React, { useState } from 'react';
import { Habit } from '../types/habit';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

interface AddHabitFormProps {
  onAddHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'successCount'>) => void;
  onClose: () => void;
}

const AddHabitForm: React.FC<AddHabitFormProps> = ({ onAddHabit, onClose }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [validDays, setValidDays] = useState<number[]>([1, 2, 3, 4, 5]); // Weekdays by default

  const dayNames = [0, 1, 2, 3, 4, 5, 6].map(day => t(`habits.days.${day}`));

  const toggleDay = (day: number) => {
    setValidDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const validateHabitName = (habitName: string): boolean => {
    const trimmed = habitName.trim();
    
    // Check if name is empty
    if (!trimmed) return false;
    
    // Check minimum length
    if (trimmed.length < 2) return false;
    
    // Check maximum length
    if (trimmed.length > 100) return false;
    
    // Check for suspicious patterns that might be error messages or system text
    const suspiciousPatterns = [
      /serwer/i,
      /server/i,
      /port/i,
      /localhost/i,
      /http/i,
      /error/i,
      /błąd/i,
      /status/i,
      /sprawdz/i,
      /check/i,
      /uruchom/i,
      /start/i,
      /podgląd/i,
      /preview/i
    ];
    
    return !suspiciousPatterns.some(pattern => pattern.test(trimmed));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    
    if (validateHabitName(trimmedName) && validDays.length > 0) {
      onAddHabit({ name: trimmedName, validDays });
      setName('');
      setValidDays([1, 2, 3, 4, 5]);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-habit-title"
    >
      <div className={`rounded-xl p-6 w-full max-w-md ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h2 
            id="add-habit-title"
            className={`text-xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}
          >
            {t('habits.add')}
          </h2>
          <button
            onClick={onClose}
            className={`${
              theme === 'dark' 
                ? 'text-gray-400 hover:text-gray-200' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            aria-label={t('habits.cancel')}
            title={t('habits.cancel')}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="habitName" className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              {t('habits.name')}
            </label>
            <input
              id="habitName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('habits.name')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              autoFocus
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-3 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              {t('habits.validDays')}
            </label>
            <div className="grid grid-cols-7 gap-2" role="group" aria-label={t('habits.validDays')}>
              {dayNames.map((day, index) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(index)}
                  className={`
                    py-2 px-1 text-sm font-medium rounded-lg transition-all duration-200 truncate
                    ${validDays.includes(index)
                      ? 'bg-blue-500 text-white shadow-md'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                  title={day}
                  aria-label={`${day} - ${validDays.includes(index) ? t('habits.selected') : t('habits.notSelected')}`}
                  aria-pressed={validDays.includes(index)}
                >
                  {day}
                </button>
              ))}
            </div>
            <p className={`text-xs mt-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {t('habits.selectDays')}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 px-4 border rounded-lg font-medium ${
                theme === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t('habits.cancel')}
            </button>
            <button
              type="submit"
              disabled={!validateHabitName(name) || validDays.length === 0}
              className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              {t('habits.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHabitForm;