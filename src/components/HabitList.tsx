import React, { useState, useRef } from 'react';
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
  isDragLocked?: boolean;
}

const HabitList: React.FC<HabitListProps> = ({ 
  habits, 
  statuses, 
  onStatusChange, 
  onDeleteHabit, 
  onUpdateHabit, 
  onReorderHabits,
  isDragLocked = false
}) => {
  const { t } = useTranslation();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Touch events state
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null);
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  if (habits.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="text-6xl mb-4 animate-bounce-gentle">🎯</div>
        <h2 className="text-xl font-semibold text-gray-600 mb-2 visual-hierarchy-2 animate-fade-in" style={{animationDelay: '0.2s'}}>{t('habits.noHabitsYet')}</h2>
        <p className="text-gray-500 visual-hierarchy-3 animate-fade-in" style={{animationDelay: '0.4s'}}>{t('habits.addFirstHabit')}</p>
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
    
    // Dodaj wizualny feedback z animacją
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.7';
      e.currentTarget.style.transform = 'scale(0.98) rotate(1deg)';
      e.currentTarget.style.transition = 'all 0.2s ease';
      e.currentTarget.classList.add('animate-swipe-feedback');
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
    // Przywróć wszystkie style z płynną animacją
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
      e.currentTarget.style.transform = '';
      e.currentTarget.style.transition = 'all 0.3s ease';
      e.currentTarget.classList.remove('animate-swipe-feedback');
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
    setTouchStartX(touch.clientX);
    setTouchCurrentY(touch.clientY);
    setDraggedIndex(index);
    setIsTouchDragging(false);
    
    // Don't prevent default here - allow scrolling to work normally
    // Only prevent when we actually start dragging
  };

  const handleTouchMove = (e: React.TouchEvent, index: number) => {
    if (touchStartY === null || touchStartX === null || draggedIndex === null) return;
    
    const touch = e.touches[0];
    const currentY = touch.clientY;
    setTouchCurrentY(currentY);
    
    const deltaY = Math.abs(currentY - touchStartY);
    const deltaX = Math.abs(touch.clientX - touchStartX);
    
    // Only start dragging if moved more than 15px vertically and less than 10px horizontally
    // This allows for normal scrolling while still enabling drag
    if (deltaY > 15 && deltaX < 10 && !isTouchDragging) {
      setIsTouchDragging(true);
      // Add enhanced visual feedback with smooth animation
      const element = e.currentTarget as HTMLElement;
      element.style.opacity = '0.8';
      element.style.transform = 'scale(0.96) rotate(1.5deg)';
      element.style.transition = 'all 0.2s ease';
      element.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
      element.classList.add('animate-swipe-feedback');
    }
    
    if (isTouchDragging) {
      // Only prevent scrolling when actually dragging
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
    
    // Reset visual feedback with smooth animation
    const element = e.currentTarget as HTMLElement;
    element.style.opacity = '1';
    element.style.transform = '';
    element.style.transition = 'all 0.3s ease';
    element.style.boxShadow = '';
    element.classList.remove('animate-swipe-feedback');
    
    // Reset state
    setTouchStartY(null);
    setTouchStartX(null);
    setTouchCurrentY(null);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setIsTouchDragging(false);
  };

  return (
    <div ref={containerRef} className="space-y-2 sm:space-y-3 animate-fade-in">
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
            transition-all duration-300 ease-out
            ${isDragLocked ? 'cursor-default' : 'cursor-move hover:scale-[1.01]'}
            ${draggedIndex === index ? 'opacity-70 scale-96 rotate-1 z-10' : ''}
            ${dragOverIndex === index && draggedIndex !== index ? 'transform scale-105 shadow-xl border-2 border-blue-400 bg-blue-50 dark:bg-blue-900/20' : ''}
            animate-fade-in
            focus-enhanced
          `}
          style={{animationDelay: `${index * 0.1}s`}}
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