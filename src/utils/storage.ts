import { Habit, HabitStatus } from '../types/habit';

const HABITS_KEY = 'habit-tracker-habits';
const STATUS_KEY = 'habit-tracker-status';

export const loadHabits = (): Habit[] => {
  try {
    const stored = localStorage.getItem(HABITS_KEY);
    if (!stored) return [];
    
    const habits = JSON.parse(stored);
    // Migracja: dodaj bestStreak dla istniejących nawyków
    return habits.map((habit: any) => ({
      ...habit,
      bestStreak: habit.bestStreak ?? habit.successCount ?? 0
    }));
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