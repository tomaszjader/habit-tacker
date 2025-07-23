import { Habit, HabitStatus, StatusType } from '../types/habit';
import { isValidDay } from './storage';

export const getHabitStatusForDate = (
  habitId: string,
  date: string,
  statuses: HabitStatus[]
): StatusType | null => {
  const status = statuses.find(s => s.habitId === habitId && s.date === date);
  return status?.status || null;
};

export const updateSuccessCount = (
  habit: Habit,
  newStatus: StatusType,
  oldStatus: StatusType | null
): number => {
  let newCount = habit.successCount;
  
  // Remove old status effect
  if (oldStatus === 'completed') {
    newCount = Math.max(0, newCount - 1);
  }
  
  // Apply new status effect
  if (newStatus === 'completed') {
    newCount += 1;
  } else if (newStatus === 'failed') {
    newCount = 0; // Reset counter on failure
  }
  
  return newCount;
};

export const getStatusDisplay = (status: StatusType | null, habit: Habit, date: Date): {
  emoji: string;
  color: string;
  label: string;
} => {
  if (!isValidDay(habit, date)) {
    return { emoji: '➖', color: 'text-gray-400', label: 'Not applicable' };
  }
  
  switch (status) {
    case 'completed':
      return { emoji: '✅', color: 'text-green-500', label: 'Completed' };
    case 'partial':
      return { emoji: '💛', color: 'text-yellow-500', label: 'Partial' };
    case 'failed':
      return { emoji: '❌', color: 'text-red-500', label: 'Failed' };
    case 'not-applicable':
      return { emoji: '➖', color: 'text-gray-400', label: 'Not applicable' };
    default:
      return { emoji: '⚪', color: 'text-gray-300', label: 'Not set' };
  }
};

export const getDayName = (date: Date): string => {
  return date.toLocaleDateString('en', { weekday: 'short' });
};

export const getDateLabel = (daysAgo: number): string => {
  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return 'Yesterday';
  return `${daysAgo} days ago`;
};