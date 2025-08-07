import React, { useRef, useState } from 'react';
import { X, Download, Upload, FileText, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { Habit, HabitStatus } from '../types/habit';
import { loadNotificationSettings } from '../utils/notifications';
import Toast from './Toast';

interface ImportExportModalProps {
  onClose: () => void;
  habits: Habit[];
  statuses: HabitStatus[];
  onImportData: (habits: Habit[], statuses: HabitStatus[]) => void;
}

interface ExportData {
  version: string;
  exportDate: string;
  habits: Habit[];
  statuses: HabitStatus[];
  notificationSettings: any;
}

const ImportExportModal: React.FC<ImportExportModalProps> = ({
  onClose,
  habits,
  statuses,
  onImportData
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = () => {
    try {
      const exportData: ExportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        habits,
        statuses,
        notificationSettings: loadNotificationSettings()
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      setToast({ message: t('importExport.exportSuccess'), type: 'success' });
    } catch (error) {
      console.error('Export error:', error);
      setToast({ message: t('importExport.importError'), type: 'error' });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportData;
      
      // Validate data structure
      if (!data.habits || !Array.isArray(data.habits) || 
          !data.statuses || !Array.isArray(data.statuses)) {
        throw new Error('Invalid data structure');
      }

      // Validate habit structure
      for (const habit of data.habits) {
        if (!habit.id || !habit.name || !Array.isArray(habit.validDays)) {
          throw new Error('Invalid habit structure');
        }
      }

      // Validate status structure
      for (const status of data.statuses) {
        if (!status.habitId || !status.date || !status.status) {
          throw new Error('Invalid status structure');
        }
      }

      // Show confirmation dialog
      const confirmed = window.confirm(t('importExport.confirmImport'));
      if (!confirmed) {
        setIsImporting(false);
        return;
      }

      // Import data
      onImportData(data.habits, data.statuses);
      
      // Import notification settings if available
      if (data.notificationSettings) {
        localStorage.setItem('habit-tracker-notifications', JSON.stringify(data.notificationSettings));
      }
      
      setToast({ message: t('importExport.importSuccess'), type: 'success' });
      
      // Close modal after successful import
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Import error:', error);
      setToast({ message: t('importExport.invalidFile'), type: 'error' });
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {t('importExport.title')}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Export Section */}
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-start gap-3 mb-3">
              <Download size={20} className="text-blue-500 mt-0.5" />
              <div className="flex-1">
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {t('importExport.export')}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  {t('importExport.exportDescription')}
                </p>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download size={16} />
              {t('importExport.export')}
            </button>
          </div>

          {/* Import Section */}
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-start gap-3 mb-3">
              <Upload size={20} className="text-green-500 mt-0.5" />
              <div className="flex-1">
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {t('importExport.import')}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  {t('importExport.importDescription')}
                </p>
              </div>
            </div>
            <button
              onClick={handleImportClick}
              disabled={isImporting}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Upload size={16} />
              {isImporting ? `${t('importExport.importing')}...` : t('importExport.selectFile')}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Info Section */}
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'}`}>
            <div className="flex items-start gap-3">
              <Database size={20} className="text-purple-500 mt-0.5" />
              <div className="flex-1">
                <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>
                  {t('importExport.dataIncluded')}
                </h4>
                <ul className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                  <li>• {t('importExport.fileFormat')}</li>
                  <li>• Nawyki ({habits.length})</li>
                  <li>• Wpisy postępu ({statuses.length})</li>
                  <li>• Ustawienia powiadomień</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ImportExportModal;