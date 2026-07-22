import { FaTimes } from 'react-icons/fa';

export default function Modal({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-2xl', className = '' }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`bg-white rounded-2xl shadow-xl w-full ${maxWidth} my-8 ${className}`}>
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white"><FaTimes size={22} /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && <div className="flex justify-end gap-3 px-6 pb-6 pt-2 border-t border-gray-100">{footer}</div>}
      </div>
    </div>
  );
}