import React, { useState } from 'react';
import { Habit } from '../types/habit';
import { X } from 'lucide-react';

interface AddHabitFormProps {
  onAddHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'successCount'>) => void;
  onClose: () => void;
}

const AddHabitForm: React.FC<AddHabitFormProps> = ({ onAddHabit, onClose }) => {
  const [name, setName] = useState('');
  const [validDays, setValidDays] = useState<number[]>([1, 2, 3, 4, 5]); // Weekdays by default

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (day: number) => {
    setValidDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && validDays.length > 0) {
      onAddHabit({ name: name.trim(), validDays });
      setName('');
      setValidDays([1, 2, 3, 4, 5]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Add New Habit</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="habitName" className="block text-sm font-medium text-gray-700 mb-2">
              Habit Name
            </label>
            <input
              id="habitName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Exercise"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Active Days
            </label>
            <div className="grid grid-cols-7 gap-2">
              {dayNames.map((day, index) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(index)}
                  className={`
                    py-2 px-1 text-sm font-medium rounded-lg transition-all duration-200
                    ${validDays.includes(index)
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {day}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Select the days when this habit applies
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || validDays.length === 0}
              className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              Add Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHabitForm;