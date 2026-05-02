// src/components/Settings.jsx
import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaSave } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export default function Settings() {
  const { role } = useAuth();
  const { monthlyDueDay, updateMonthlyDueDay } = useData();
  const [dueDay, setDueDay] = useState(monthlyDueDay);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDueDay(monthlyDueDay);
  }, [monthlyDueDay]);

  if (role !== 'admin') {
    return (
      <div className='p-6 text-center text-red-600'>
        Access denied. Admin only.
      </div>
    );
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateMonthlyDueDay(dueDay);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='px-4 sm:px-6 py-4 sm:py-6 max-w-2xl mx-auto'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800 flex items-center gap-2'>
          <FaCalendarAlt className='text-indigo-600' size={28} />
          Fee Settings
        </h1>
        <p className='text-gray-500 text-sm mt-1'>
          Configure monthly payment deadline
        </p>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
        <div className='mb-6'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Monthly Payment Due Day (1-31)
          </label>
          <input
            type='number'
            min='1'
            max='31'
            value={dueDay}
            onChange={(e) => setDueDay(parseInt(e.target.value) || 10)}
            className='w-full sm:w-48 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500'
          />
          <p className='text-xs text-gray-400 mt-1'>
            The day of each month when fees are expected to be paid. If the day
            exceeds month length, the last day of the month will be used.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className='bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-2 rounded-lg shadow-sm flex items-center gap-2 font-medium'
        >
          <FaSave size={16} /> {loading ? 'Saving...' : 'Save Settings'}
        </button>

        {saved && (
          <div className='mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm'>
            ✅ Settings saved successfully
          </div>
        )}
      </div>
    </div>
  );
}
