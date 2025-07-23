import React, { useState, useEffect } from 'react';
import { Habit, HabitStatus, StatusType } from './types/habit';
import { 
  loadHabits, 
  saveHabits, 
  loadHabitStatuses, 
  saveHabitStatuses,
  formatDate 
} from './utils/storage';
import { updateSuccessCount, getHabitStatusForDate } from './utils/habitUtils';
import HabitList from './components/HabitList';
import AddHabitForm from './components/AddHabitForm';
import { Plus, Target } from 'lucide-react';

function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [statuses, setStatuses] = useState<HabitStatus[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Load data on mount
  useEffect(() => {
    setHabits(loadHabits());
    setStatuses(loadHabitStatuses());
  }, []);

  // Save data when it changes
  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  useEffect(() => {
    saveHabitStatuses(statuses);
  }, [statuses]);

  const addHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'successCount'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      successCount: 0
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const handleStatusChange = (habitId: string, date: string, newStatus: StatusType) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const oldStatus = getHabitStatusForDate(habitId, date, statuses);
    const newSuccessCount = updateSuccessCount(habit, newStatus, oldStatus);

    // Update habit success count
    setHabits(prev => prev.map(h => 
      h.id === habitId ? { ...h, successCount: newSuccessCount } : h
    ));

    // Update status
    setStatuses(prev => {
      const filtered = prev.filter(s => !(s.habitId === habitId && s.date === date));
      return [...filtered, { habitId, date, status: newStatus }];
    });
  };

  const todayStr = formatDate(new Date());
  const completedToday = habits.filter(habit => {
    const status = getHabitStatusForDate(habit.id, todayStr, statuses);
    return status === 'completed';
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Habit Tracker</h1>
                <p className="text-sm text-gray-500">
                  {completedToday} of {habits.length} completed today
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        <HabitList
          habits={habits}
          statuses={statuses}
          onStatusChange={handleStatusChange}
        />
      </div>

      {/* Add Habit Form */}
      {showAddForm && (
        <AddHabitForm
          onAddHabit={addHabit}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {/* Bottom padding for mobile */}
      <div className="h-20" />
    </div>
  );
}

export default App;