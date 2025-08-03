import React, { useState, useRef } from 'react';
import { Habit, HabitStatus, StatusType } from '../types/habit';
import HabitItem from './HabitItem';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

interface HabitListProps {
  habits: Habit[];
  statuses: HabitStatus[];
  onStatusChange: (habitId: string, date: string, status: StatusType) => void;
  onDeleteHabit: (habitId: string) => void;
  onUpdateHabit: (habitId: string, updates: Partial<Habit>) => void;
  onReorderHabits: (startIndex: number, endIndex: number) => void;
  isDragLocked?: boolean;
  onArchiveHabit?: (habitId: string) => void;
  onUnarchiveHabit?: (habitId: string) => void;
  showArchivedView?: boolean;
}

const HabitList: React.FC<HabitListProps> = ({ 
  habits, 
  statuses, 
  onStatusChange, 
  onDeleteHabit, 
  onUpdateHabit, 
  onReorderHabits,
  isDragLocked = false,
  onArchiveHabit,
  onUnarchiveHabit,
  showArchivedView = false
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Touch events state
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null);
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  if (habits.length === 0) {
    return (
      <div className={`text-center py-16 glass-card rounded-3xl ${
        theme === 'dark' 
          ? 'border-white/10 shadow-tesla' 
          : 'border-black/5 shadow-apple'
      }`}>
        <div className="text-8xl mb-6 animate-bounce-subtle">
          {showArchivedView ? '📦' : '🎯'}
        </div>
        <h2 className={`text-2xl font-bold mb-3 ${
          theme === 'dark' 
            ? 'text-white bg-gradient-to-r from-apple-400 to-apple-600 bg-clip-text text-transparent' 
            : 'text-tesla-800 bg-gradient-to-r from-tesla-600 to-tesla-800 bg-clip-text text-transparent'
        }`}>
          {showArchivedView ? 'Brak zarchiwizowanych nawyków' : t('habits.noHabitsYet')}
        </h2>
        <p className={`text-lg ${
          theme === 'dark' ? 'text-white/70' : 'text-tesla-600'
        }`}>
          {showArchivedView ? 'Nawyki przeniesione do historii pojawią się tutaj' : t('habits.addFirstHabit')}
        </p>
      </div>
    );
  }

  // Desktop drag & drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (isDragLocked) {
      e.preventDefault();
      return;
    }
    
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

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    if (isDragLocked) {
      return;
    }
    
    const touch = e.touches[0];
    setTouchStartY(touch.clientY);
    setTouchCurrentY(touch.clientY);
    setDraggedIndex(index);
    setIsTouchDragging(false);
    
    // Don't prevent default here - allow scrolling to work
  };

  const handleTouchMove = (e: React.TouchEvent, index: number) => {
    if (touchStartY === null || draggedIndex === null) return;
    
    const touch = e.touches[0];
    const currentY = touch.clientY;
    setTouchCurrentY(currentY);
    
    const deltaY = Math.abs(currentY - touchStartY);
    
    // Start dragging if moved more than 20px (increased threshold)
    if (deltaY > 20 && !isTouchDragging) {
      setIsTouchDragging(true);
      // Add visual feedback
      const element = e.currentTarget as HTMLElement;
      element.style.opacity = '0.5';
      element.style.transform = 'scale(0.95) rotate(2deg)';
      // Only prevent scrolling when actually dragging
      e.preventDefault();
    }
    
    if (isTouchDragging) {
      // Prevent scrolling only when dragging
      e.preventDefault();
      
      // Calculate which item we're over
      if (containerRef.current) {
        const container = containerRef.current;
        const items = Array.from(container.children) as HTMLElement[];
        
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const rect = item.getBoundingClientRect();
          
          if (currentY >= rect.top && currentY <= rect.bottom && i !== draggedIndex) {
            setDragOverIndex(i);
            break;
          }
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent, index: number) => {
    if (isTouchDragging && draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      onReorderHabits(draggedIndex, dragOverIndex);
    }
    
    // Reset visual feedback
    const element = e.currentTarget as HTMLElement;
    element.style.opacity = '1';
    element.style.transform = '';
    
    // Reset state
    setTouchStartY(null);
    setTouchCurrentY(null);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setIsTouchDragging(false);
  };

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-5">
      {habits.map((habit, index) => (
        <div
          key={habit.id}
          draggable={!isDragLocked}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          onTouchStart={(e) => handleTouchStart(e, index)}
          onTouchMove={(e) => handleTouchMove(e, index)}
          onTouchEnd={(e) => handleTouchEnd(e, index)}
          className={`
            transition-all duration-300
            ${isDragLocked ? 'cursor-default' : 'cursor-move'}
            ${draggedIndex === index ? 'opacity-60 scale-95 rotate-2 z-50' : ''}
            ${dragOverIndex === index && draggedIndex !== index 
              ? theme === 'dark'
                ? 'transform scale-105 shadow-glow border-2 border-apple-400/50' 
                : 'transform scale-105 shadow-apple border-2 border-tesla-400/50'
              : ''
            }
          `}
        >
          <HabitItem
            habit={habit}
            statuses={statuses}
            onStatusChange={onStatusChange}
            onDeleteHabit={onDeleteHabit}
            onUpdateHabit={onUpdateHabit}
            onArchiveHabit={onArchiveHabit}
            onUnarchiveHabit={onUnarchiveHabit}
            showArchivedView={showArchivedView}
          />
        </div>
      ))}
    </div>
  );
};

export default HabitList;