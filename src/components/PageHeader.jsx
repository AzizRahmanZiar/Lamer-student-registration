import Button from './Button';

export default function PageHeader({ title, subtitle, actions = [] }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">{title}</h1>
        {subtitle && <p className="text-gray-500 text-xs sm:text-sm mt-1">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, idx) => <Button key={idx} {...action} />)}
      </div>
    </div>
  );
}