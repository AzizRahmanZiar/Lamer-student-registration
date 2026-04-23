// src/components/DeleteConfirmationModal.jsx
import { FaExclamationTriangle, FaTimes, FaTrash } from 'react-icons/fa';

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
}) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 animate-fadeIn'>
        <div className='flex justify-between items-center p-4 border-b border-gray-200'>
          <div className='flex items-center gap-2 text-red-600'>
            <FaExclamationTriangle size={22} />
            <h2 className='text-lg font-semibold'>{title}</h2>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600'
          >
            <FaTimes size={20} />
          </button>
        </div>
        <div className='p-6'>
          <p className='text-gray-600'>{message}</p>
        </div>
        <div className='flex justify-end gap-3 p-4 border-t border-gray-200'>
          <button
            onClick={onClose}
            className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center gap-2'
          >
            <FaTrash size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
