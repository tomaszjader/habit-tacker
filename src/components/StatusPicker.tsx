import React from 'react';
import { StatusType } from '../types/habit';
import { useTranslation } from 'react-i18next';

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
  if (!isValidDay) {
    return (
      <div className="flex justify-center">
        <button className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">
          ➖
        </button>
      </div>
    );
  }

  const statuses: { type: StatusType; emoji: string; color: string; label: string }[] = [
    { type: 'completed', emoji: '✅', color: 'bg-green-100 border-green-300', label: 'Completed' },
    { type: 'partial', emoji: '🟡', color: 'bg-yellow-100 border-yellow-300', label: 'Partial' },
    { type: 'failed', emoji: '❌', color: 'bg-red-100 border-red-300', label: 'Failed' },
    { type: 'not-applicable', emoji: '➖', color: 'bg-gray-100 border-gray-300', label: 'Skip' }
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {statuses.map(status => (
        <button
          key={status.type}
          onClick={() => onStatusChange(status.type)}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center text-lg
            border-2 transition-all duration-200 active:scale-95
            ${currentStatus === status.type 
              ? `${status.color} scale-110 shadow-md` 
              : 'bg-white border-gray-200 hover:bg-gray-50'
            }
          `}
          title={t(`habits.status.${status.type}`)}
        >
          {status.emoji}
        </button>
      ))}
    </div>
  );
};

export default StatusPicker;