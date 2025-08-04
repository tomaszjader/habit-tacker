import React, { useState } from 'react';
import { Habit, HabitStatus, StatusType } from '../types/habit';
import { getDateDaysAgo, isValidDay } from '../utils/storage';
import { getHabitStatusForDate, getDateLabel } from '../utils/habitUtils';
import StatusPicker from './StatusPicker';
import Toast from './Toast';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { Trash2, Edit3 } from 'lucide-react';

interface HabitHistoryEditorProps {
  habit: Habit;
  statuses: HabitStatus[];
  onStatusChange: (date: string, status: StatusType) => void;
  onDeleteHabit: (habitId: string) => void;
  onClose: () => void;
  onUpdateHabit: (habitId: string, updates: Partial<Habit>) => void;
}

const HabitHistoryEditor: React.FC<HabitHistoryEditorProps> = ({ habit, statuses, onStatusChange, onDeleteHabit, onClose, onUpdateHabit }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [emergencyHabitText, setEmergencyHabitText] = useState(habit.emergencyHabitText || '');
  const [isEditingEmergencyHabit, setIsEditingEmergencyHabit] = useState(!habit.emergencyHabitText);
  
  // New state for editing habit name and valid days
  const [isEditingHabitName, setIsEditingHabitName] = useState(false);
  const [habitName, setHabitName] = useState(habit.name);
  const [isEditingValidDays, setIsEditingValidDays] = useState(false);
  const [validDays, setValidDays] = useState(habit.validDays);
  
  const dates = [0, 1, 2, 3].map(daysAgo => ({
    daysAgo,
    date: getDateDaysAgo(daysAgo),
    dateObj: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
    label: getDateLabel(daysAgo)
  }));

  const handleDeleteHabit = () => {
    if (window.confirm(t('habits.deleteConfirm'))) {
      onDeleteHabit(habit.id);
      setToastMessage(t('habits.deleted'));
      setShowToast(true);
      // Zamknij modal po krótkim opóźnieniu, aby użytkownik zobaczył toast
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  const handleEmergencyHabitSave = () => {
    const updates = { emergencyHabitText: emergencyHabitText.trim() || undefined };
    onUpdateHabit(habit.id, updates);
    setIsEditingEmergencyHabit(false);
    setToastMessage(t('habits.emergencyHabitSaved'));
    setShowToast(true);
  };

  const handleEditEmergencyHabit = () => {
    setIsEditingEmergencyHabit(true);
  };

  const handleHabitNameSave = () => {
    if (habitName.trim()) {
      const updates = { name: habitName.trim() };
      onUpdateHabit(habit.id, updates);
      setIsEditingHabitName(false);
      setToastMessage(t('habits.habitNameSaved'));
      setShowToast(true);
    }
  };

  const handleValidDaysSave = () => {
    if (validDays.length > 0) {
      const updates = { validDays };
      onUpdateHabit(habit.id, updates);
      setIsEditingValidDays(false);
      setToastMessage(t('habits.validDaysSaved'));
      setShowToast(true);
    }
  };

  const toggleValidDay = (day: number) => {
    setValidDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => a - b)
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>{habit.name}</h2>
          <button
            onClick={onClose}
            className={`text-2xl leading-none ${
              theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ×
          </button>
        </div>
        
        {/* Habit Editing Section */}
        <div className="space-y-4 mb-6">
          {/* Edit Habit Name */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {t('habits.name')}
              </label>
              {!isEditingHabitName && (
                <button
                  onClick={() => setIsEditingHabitName(true)}
                  className={`p-1 rounded transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  title={t('habits.editHabitName')}
                >
                  <Edit3 size={14} />
                </button>
              )}
            </div>
            
            {isEditingHabitName ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder={t('habits.name')}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleHabitNameSave}
                    disabled={!habitName.trim()}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    {t('habits.save')}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingHabitName(false);
                      setHabitName(habit.name);
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {t('habits.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <div className={`p-3 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}>
                {habit.name}
              </div>
            )}
          </div>

          {/* Edit Valid Days */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {t('habits.validDays')}
              </label>
              {!isEditingValidDays && (
                <button
                  onClick={() => setIsEditingValidDays(true)}
                  className={`p-1 rounded transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  title={t('habits.editValidDays')}
                >
                  <Edit3 size={14} />
                </button>
              )}
            </div>
            
            {isEditingValidDays ? (
              <div className="space-y-3">
                <div className="grid grid-cols-7 gap-1">
                  {[0, 1, 2, 3, 4, 5, 6].map(day => (
                    <button
                      key={day}
                      onClick={() => toggleValidDay(day)}
                      className={`p-2 text-xs rounded-lg border transition-colors ${
                        validDays.includes(day)
                          ? 'bg-blue-500 text-white border-blue-500'
                          : theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {t(`habits.days.${day}`).slice(0, 3)}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleValidDaysSave}
                    disabled={validDays.length === 0}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    {t('habits.save')}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingValidDays(false);
                      setValidDays(habit.validDays);
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {t('habits.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4, 5, 6].map(day => (
                  <div
                    key={day}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                      habit.validDays.includes(day) 
                        ? 'bg-blue-500 text-white' 
                        : theme === 'dark' ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-500'
                    }`}
                    title={t(`habits.days.${day}`)}
                  >
                    {t(`habits.days.${day}`).slice(0, 1)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className={`border-t mb-6 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}></div>
        
        <div className="space-y-6">
          {dates.map(({ daysAgo, date, dateObj, label }) => {
            const currentStatus = getHabitStatusForDate(habit.id, date, statuses);
            const isValid = isValidDay(habit, dateObj);
            
            return (
              <div key={date} className={`rounded-lg p-4 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex justify-between items-center mb-3">
                  <span className={`font-medium ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>{label}</span>
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {dateObj.toLocaleDateString(t('language') === 'pl' ? 'pl-PL' : 'en-US')}
                  </span>
                </div>
                
                <StatusPicker
                  currentStatus={currentStatus}
                  onStatusChange={(status) => onStatusChange(date, status)}
                  isValidDay={isValid}
                />
              </div>
            );
          })}
        </div>
        
        <div className={`mt-6 pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
          <div className="text-center mb-4">
            <span className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>{t('habits.successStreak')}: </span>
            <span className="font-bold text-lg text-green-500">{habit.successCount}</span>
          </div>
          
          {/* Emergency Habit Settings */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              {t('habits.emergencyHabit')}
            </label>
            <p className={`text-xs mb-3 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {t('habits.emergencyHabitDescription')}
            </p>
            
            {isEditingEmergencyHabit ? (
              <div className="space-y-3">
                <textarea
                  value={emergencyHabitText}
                  onChange={(e) => setEmergencyHabitText(e.target.value)}
                  placeholder={t('habits.emergencyHabitPlaceholder')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  rows={2}
                />
                <button
                  onClick={handleEmergencyHabitSave}
                  className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  {t('habits.save')}
                </button>
              </div>
            ) : habit.emergencyHabitText ? (
              <div className="space-y-3">
                <div className={`p-3 border rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-green-900/20 border-green-700 text-green-300' 
                    : 'bg-green-50 border-green-200 text-green-700'
                }`}>
                  <p className={`text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`}>
                    {t('habits.emergencyHabit')}:
                  </p>
                  <p className="text-sm">
                    {habit.emergencyHabitText}
                  </p>
                </div>
                <button
                  onClick={handleEditEmergencyHabit}
                  className={`w-full px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {t('habits.edit')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={emergencyHabitText}
                  onChange={(e) => setEmergencyHabitText(e.target.value)}
                  placeholder={t('habits.emergencyHabitPlaceholder')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  rows={2}
                />
                <button
                  onClick={handleEmergencyHabitSave}
                  className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  {t('habits.save')}
                </button>
              </div>
            )}
          </div>
          
          {/* Delete Button */}
          <button
            onClick={handleDeleteHabit}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
              theme === 'dark'
                ? 'bg-red-900/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 border-red-800'
                : 'bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border-red-200'
            }`}
          >
            <Trash2 size={18} />
            {t('habits.delete')}
          </button>
        </div>
      </div>
      
      {/* Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default HabitHistoryEditor;