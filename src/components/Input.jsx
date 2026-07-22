export default function Input({
  label,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  className = '',
  ...props
}) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />}
        <input
          type={type}
          className={`w-full border border-gray-300 rounded-lg ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          {...props}
        />
      </div>
    </div>
  );
}