export interface Habit {
  id: string;
  name: string;
  validDays: number[]; // 0-6 (Sunday-Saturday)
  createdAt: string;
  successCount: number;
  bestStreak: number; // Największa seria sukcesów
}

export interface HabitStatus {
  habitId: string;
  date: string; // YYYY-MM-DD format
  status: 'completed' | 'partial' | 'failed' | 'not-applicable';
}

export type StatusType = 'completed' | 'partial' | 'failed' | 'not-applicable';