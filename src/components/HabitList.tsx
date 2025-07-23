import React from 'react';
import { Habit, HabitStatus, StatusType } from '../types/habit';
import HabitItem from './HabitItem';

interface HabitListProps {
  habits: Habit[];
  statuses: HabitStatus[];
  onStatusChange: (habitId: string, date: string, status: StatusType) => void;
}

const HabitList: React.FC<HabitListProps> = ({ habits, statuses, onStatusChange }) => {
  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-xl font-semibold text-gray-600 mb-2">No habits yet</h2>
        <p className="text-gray-500">Add your first habit to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {habits.map(habit => (
        <HabitItem
          key={habit.id}
          habit={habit}
          statuses={statuses}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
};

export default HabitList;