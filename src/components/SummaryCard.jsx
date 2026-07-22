export default function SummaryCard({ title, value, icon: Icon, color = 'blue' }) {
  const colors = { blue: 'bg-blue-50 border-blue-100', green: 'bg-green-50 border-green-100', purple: 'bg-purple-50 border-purple-100', red: 'bg-red-50 border-red-100' };
  const iconColors = { blue: 'bg-blue-500', green: 'bg-green-500', purple: 'bg-purple-500', red: 'bg-red-500' };
  return (
    <div className={`rounded-xl p-5 shadow-sm border ${colors[color]}`}>
      <div className="flex justify-between items-start">
        <div><p className="text-gray-500 text-sm">{title}</p><p className="text-2xl font-bold text-gray-800 mt-1">{value}</p></div>
        <div className={`${iconColors[color]} p-3 rounded-full text-white`}><Icon size={20} /></div>
      </div>
    </div>
  );
}