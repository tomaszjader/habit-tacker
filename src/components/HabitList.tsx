import React, { useState } from 'react';
import { Habit, HabitStatus, StatusType } from '../types/habit';
import HabitItem from './HabitItem';
import { useTranslation } from 'react-i18next';

interface HabitListProps {
  habits: Habit[];
  statuses: HabitStatus[];
  onStatusChange: (habitId: string, date: string, status: StatusType) => void;
  onDeleteHabit: (habitId: string) => void;
  onUpdateHabit: (habitId: string, updates: Partial<Habit>) => void;
  onReorderHabits: (startIndex: number, endIndex: number) => void;
}

const HabitList: React.FC<HabitListProps> = ({ 
  habits, 
  statuses, 
  onStatusChange, 
  onDeleteHabit, 
  onUpdateHabit, 
  onReorderHabits 
}) => {
  const { t } = useTranslation();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-xl font-semibold text-gray-600 mb-2">{t('habits.noHabitsYet')}</h2>
        <p className="text-gray-500">{t('habits.addFirstHabit')}</p>
      </div>
    );
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
    
    // Dodaj wizualny feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Sprawdź czy opuszczamy element, a nie jego dziecko
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorderHabits(draggedIndex, dropIndex);
    }
    
    // Przywróć opacity
    if (e.currentTarget instanceof HTMLElement) {
      const draggedElement = e.currentTarget.parentElement?.children[draggedIndex || 0] as HTMLElement;
      if (draggedElement) {
        draggedElement.style.opacity = '1';
      }
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Przywróć opacity
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-3">
      {habits.map((habit, index) => (
        <div
          key={habit.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`
            transition-all duration-200 cursor-move
            ${draggedIndex === index ? 'opacity-50 scale-95 rotate-2' : ''}
            ${dragOverIndex === index && draggedIndex !== index ? 'transform scale-105 shadow-lg border-2 border-blue-400' : ''}
          `}
        >
          <HabitItem
            habit={habit}
            statuses={statuses}
            onStatusChange={onStatusChange}
            onDeleteHabit={onDeleteHabit}
            onUpdateHabit={onUpdateHabit}
          />
        </div>
      ))}
    </div>
  );
};

export default HabitList;