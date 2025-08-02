import React, { useEffect } from 'react';
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-400" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-400" />;
      default:
        return <Info size={20} className="text-blue-400" />;
    }
  };

  const getAccentColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-400/30';
      case 'error':
        return 'border-red-400/30';
      default:
        return 'border-blue-400/30';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full glass-card ${getAccentColor()} border rounded-2xl shadow-tesla p-4 animate-slide-down`}>
      <div className="flex items-center gap-3">
        {getIcon()}
        <p className={`flex-1 font-medium ${
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          {message}
        </p>
        <button
          onClick={onClose}
          className={`transition-colors rounded-lg p-1 hover:bg-white/10 ${
            theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;