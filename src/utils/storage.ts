import { Habit, HabitStatus } from '../types/habit';

const HABITS_KEY = 'habit-tracker-habits';
const STATUS_KEY = 'habit-tracker-status';

export const loadHabits = (): Habit[] => {
  try {
    const stored = localStorage.getItem(HABITS_KEY);
    if (!stored) return [];
    
    const habits = JSON.parse(stored);
    // Migracja: dodaj bestStreak i order dla istniejących nawyków
    const migratedHabits = habits.map((habit: any, index: number) => ({
      ...habit,
      bestStreak: habit.bestStreak ?? habit.successCount ?? 0,
      order: habit.order ?? index
    }));
    
    // Sortuj nawyki według kolejności
    return migratedHabits.sort((a: Habit, b: Habit) => a.order - b.order);
  } catch {
    return [];
  }
};

export const saveHabits = (habits: Habit[]): void => {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
};

export const loadHabitStatuses = (): HabitStatus[] => {
  try {
    const stored = localStorage.getItem(STATUS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveHabitStatuses = (statuses: HabitStatus[]): void => {
  localStorage.setItem(STATUS_KEY, JSON.stringify(statuses));
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getDateDaysAgo = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return formatDate(date);
};

export const isValidDay = (habit: Habit, date: Date): boolean => {
  const dayOfWeek = date.getDay();
  return habit.validDays.includes(dayOfWeek);
};

// Import/Export functions
export const clearAllData = (): void => {
  localStorage.removeItem(HABITS_KEY);
  localStorage.removeItem(STATUS_KEY);
};

export const importData = (habits: Habit[], statuses: HabitStatus[]): void => {
  // Clear existing data
  clearAllData();
  
  // Import new data
  saveHabits(habits);
  saveHabitStatuses(statuses);
};

export const exportData = () => {
  return {
    habits: loadHabits(),
    statuses: loadHabitStatuses(),
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
};