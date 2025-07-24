import React from 'react';
import { Habit, HabitStatus, StatusType } from '../types/habit';
import HabitItem from './HabitItem';
import { useTranslation } from 'react-i18next';

interface HabitListProps {
  habits: Habit[];
  statuses: HabitStatus[];
  onStatusChange: (habitId: string, date: string, status: StatusType) => void;
  onDeleteHabit: (habitId: string) => void;
}

const HabitList: React.FC<HabitListProps> = ({ habits, statuses, onStatusChange, onDeleteHabit }) => {
  const { t } = useTranslation();
  
  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-xl font-semibold text-gray-600 mb-2">{t('habits.noHabitsYet')}</h2>
        <p className="text-gray-500">{t('habits.addFirstHabit')}</p>
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
          onDeleteHabit={onDeleteHabit}
        />
      ))}
    </div>
  );
};

export default HabitList;