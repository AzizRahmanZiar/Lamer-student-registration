import { useState, useRef, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';

export default function SearchableDropdown({
  items,
  value,
  onChange,
  placeholder = 'Search...',
  displayKey = 'fullname',
  secondaryKey = 'fathername',
  disabled = false,
  className = '',
}) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (value) {
      const selected = items.find(item => item.id === value);
      if (selected) setInputValue(`${selected[displayKey] || ''} ${selected[secondaryKey] || ''}`.trim());
    } else {
      setInputValue('');
    }
  }, [value, items, displayKey, secondaryKey]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = items.filter(item =>
    `${item[displayKey] || ''} ${item[secondaryKey] || ''}`
      .toLowerCase()
      .includes(inputValue.toLowerCase())
  );

  const handleSelect = (item) => {
    setInputValue(`${item[displayKey] || ''} ${item[secondaryKey] || ''}`.trim());
    setShowSuggestions(false);
    if (onChange) onChange(item);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    setShowSuggestions(true);
    if (val === '' && onChange) onChange(null);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          disabled={disabled}
        />
      </div>
      {showSuggestions && !disabled && inputValue.trim() !== '' && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-2 text-gray-500 text-sm">No matching items</div>
          ) : (
            filtered.map(item => (
              <div key={item.id} className="px-4 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-0" onClick={() => handleSelect(item)}>
                <div className="font-medium text-gray-800">{item[displayKey]}</div>
                {item[secondaryKey] && <div className="text-xs text-gray-500">{item[secondaryKey]} • {item.courses?.length || 0} courses</div>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}