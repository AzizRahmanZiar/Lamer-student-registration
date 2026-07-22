import { useData } from '../context/DataContext';
import { FaUsers, FaMoneyBillWave, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import SummaryCard from '../components/SummaryCard';
import Card from '../components/Card';

export default function Dashboard() {
  const { students, monthlyFees, loading, getCurrentMonthCollected, getPendingStudents, getCurrentMonthYear } = useData();
  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();

  const totalStudents = students.length;
  const totalFeesCollected = monthlyFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + (f.paidAmount || 0), 0);
  const currentMonthTotal = getCurrentMonthCollected();

  const paidStudentsThisMonth = monthlyFees
    .filter(f => f.month === currentMonth && f.year === currentYear && f.status === 'paid')
    .map(f => ({ id: f.studentId, name: f.studentName, paid: f.paidAmount, total: f.totalAmount }));

  const pendingStudents = getPendingStudents();

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{currentMonth} {currentYear} – Fee Collection Overview</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <SummaryCard title="Total Students" value={totalStudents} icon={FaUsers} color="blue" />
        <SummaryCard title="Total Fees Collected" value={`؋ ${totalFeesCollected.toFixed(2)}`} icon={FaMoneyBillWave} color="green" />
        <SummaryCard title={`${currentMonth} Collection`} value={`؋ ${currentMonthTotal.toFixed(2)}`} icon={FaMoneyBillWave} color="purple" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-green-600" /> Paid This Month ({paidStudentsThisMonth.length})
          </h2>
          {paidStudentsThisMonth.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No payments recorded for this month yet.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {paidStudentsThisMonth.map(item => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <span className="text-sm text-green-700">؋ {item.paid.toFixed(2)} / {item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaTimesCircle className="text-red-600" /> Unpaid / Remaining ({pendingStudents.length})
          </h2>
          {pendingStudents.length === 0 ? (
            <p className="text-green-600 text-sm text-center py-6">✅ All students have paid for this month!</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {pendingStudents.map(student => {
                const feeRecord = monthlyFees.find(f => f.studentId === student.id && f.month === currentMonth && f.year === currentYear);
                const due = feeRecord ? feeRecord.totalAmount : 0;
                return (
                  <div key={student.id} className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                    <span className="font-medium text-gray-800">{student.fullname}</span>
                    <span className="text-sm text-red-600">Due: ؋ {due.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}