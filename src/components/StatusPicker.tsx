import React from 'react';
import { StatusType } from '../types/habit';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

interface StatusPickerProps {
  currentStatus: StatusType | null;
  onStatusChange: (status: StatusType) => void;
  isValidDay: boolean;
}

const StatusPicker: React.FC<StatusPickerProps> = ({
  currentStatus,
  onStatusChange,
  isValidDay
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  if (!isValidDay) {
    return (
      <div className="flex justify-center">
        <button className={`w-16 h-16 rounded-3xl glass-card flex items-center justify-center text-2xl transition-all duration-300 ${
          theme === 'dark' 
            ? 'border-white/10 text-white/60' 
            : 'border-black/5 text-tesla-400'
        }`}>
          ➖
        </button>
      </div>
    );
  }

  const statuses: { 
    type: StatusType; 
    emoji: string; 
    gradient: string; 
    hoverGradient: string;
    label: string;
    shadowColor: string;
  }[] = [
    { 
      type: 'completed', 
      emoji: '✅', 
      gradient: 'from-apple-400 to-apple-600', 
      hoverGradient: 'from-apple-300 to-apple-500',
      label: 'Completed',
      shadowColor: 'shadow-apple'
    },
    { 
      type: 'partial', 
      emoji: '🟡', 
      gradient: 'from-yellow-400 to-orange-500', 
      hoverGradient: 'from-yellow-300 to-orange-400',
      label: 'Partial',
      shadowColor: 'shadow-glow'
    },
    { 
      type: 'failed', 
      emoji: '❌', 
      gradient: 'from-red-400 to-red-600', 
      hoverGradient: 'from-red-300 to-red-500',
      label: 'Failed',
      shadowColor: 'shadow-tesla'
    },
    { 
      type: 'not-applicable', 
      emoji: '➖', 
      gradient: 'from-gray-400 to-gray-600', 
      hoverGradient: 'from-gray-300 to-gray-500',
      label: 'Skip',
      shadowColor: 'shadow-apple'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {statuses.map(status => (
        <div key={status.type} className="flex flex-col items-center gap-2">
          <button
            onClick={() => onStatusChange(status.type)}
            className={`
              w-16 h-16 rounded-3xl flex items-center justify-center text-2xl
              transition-all duration-300 active:scale-95 group/status
              ${currentStatus === status.type 
                ? `glass-card bg-gradient-to-r ${status.gradient} scale-110 ${status.shadowColor} border-white/20` 
                : theme === 'dark'
                  ? 'glass-card border-white/10 hover:border-white/20 hover:scale-105 hover:shadow-glow'
                  : 'glass-card border-black/5 hover:border-black/10 hover:scale-105 hover:shadow-apple'
              }
              ${currentStatus === status.type ? '' : `hover:bg-gradient-to-r hover:${status.hoverGradient}/20`}
            `}
            title={t(`habits.status.${status.type}`)}
          >
            <span className="group-hover/status:scale-110 transition-transform duration-200">
              {status.emoji}
            </span>
          </button>
          <span className={`text-xs font-medium ${
            theme === 'dark' ? 'text-white/70' : 'text-tesla-600'
          }`}>
            {t(`habits.status.${status.type}`)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StatusPicker;