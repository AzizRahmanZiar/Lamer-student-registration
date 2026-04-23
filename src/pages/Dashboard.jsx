import { useData } from '../context/DataContext';
import {
  FaUsers,
  FaMoneyBillWave,
  FaChartLine,
  FaBookOpen,
  FaSchool,
  FaExclamationTriangle,
} from 'react-icons/fa';

export default function Dashboard() {
  const {
    students,
    monthlyFees,
    loading,
    getCurrentMonthCollected,
    getPendingStudents,
    getMonthlyHistory,
    getCurrentMonthYear,
  } = useData();

  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
  const totalStudents = students.length;
  const totalPaidRecords = monthlyFees.filter(
    (f) => f.status === 'paid',
  ).length;
  const currentMonthTotal = getCurrentMonthCollected();
  const pendingStudents = getPendingStudents();
  const monthlyHistory = getMonthlyHistory();

  // Most popular course (from student enrollments)
  const courseCounts = {};
  students.forEach((student) => {
    student.courses?.forEach((course) => {
      courseCounts[course] = (courseCounts[course] || 0) + 1;
    });
  });
  const mostPopularCourse = Object.entries(courseCounts).sort(
    (a, b) => b[1] - a[1],
  )[0];

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800 flex items-center gap-2'>
          <FaSchool className='text-indigo-600' size={28} />
          Dashboard
        </h1>
        <p className='text-gray-500 text-sm mt-1'>
          Monthly fee collection overview – {currentMonth} {currentYear}
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8'>
        <div className='bg-blue-50 rounded-xl p-5 shadow-sm border border-gray-100'>
          <div className='flex justify-between items-start'>
            <div>
              <p className='text-gray-500 text-sm'>Total Students</p>
              <p className='text-2xl font-bold text-blue-600 mt-1'>
                {totalStudents}
              </p>
            </div>
            <div className='bg-blue-500 p-3 rounded-full text-white'>
              <FaUsers size={20} />
            </div>
          </div>
        </div>

        <div className='bg-green-50 rounded-xl p-5 shadow-sm border border-gray-100'>
          <div className='flex justify-between items-start'>
            <div>
              <p className='text-gray-500 text-sm'>This Month's Collection</p>
              <p className='text-2xl font-bold text-green-600 mt-1'>
                ؋ {currentMonthTotal.toFixed(2)}
              </p>
            </div>
            <div className='bg-green-500 p-3 rounded-full text-white'>
              <FaMoneyBillWave size={20} />
            </div>
          </div>
        </div>

        <div className='bg-purple-50 rounded-xl p-5 shadow-sm border border-gray-100'>
          <div className='flex justify-between items-start'>
            <div>
              <p className='text-gray-500 text-sm'>Paid Records (All Time)</p>
              <p className='text-2xl font-bold text-purple-600 mt-1'>
                {totalPaidRecords}
              </p>
            </div>
            <div className='bg-purple-500 p-3 rounded-full text-white'>
              <FaChartLine size={20} />
            </div>
          </div>
        </div>

        <div className='bg-orange-50 rounded-xl p-5 shadow-sm border border-gray-100'>
          <div className='flex justify-between items-start'>
            <div>
              <p className='text-gray-500 text-sm'>Pending This Month</p>
              <p className='text-2xl font-bold text-orange-600 mt-1'>
                {pendingStudents.length}
              </p>
            </div>
            <div className='bg-orange-500 p-3 rounded-full text-white'>
              <FaExclamationTriangle size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Two columns */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Pending Students */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-5'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
            <FaExclamationTriangle className='text-orange-600' />
            Pending Payments – {currentMonth} {currentYear}
          </h2>
          {pendingStudents.length === 0 ? (
            <p className='text-green-600 text-sm text-center py-6'>
              ✅ All students have paid for this month!
            </p>
          ) : (
            <div className='space-y-2 max-h-64 overflow-y-auto'>
              {pendingStudents.map((student) => (
                <div
                  key={student.id}
                  className='flex justify-between items-center p-2 bg-orange-50 rounded-lg'
                >
                  <div>
                    <p className='font-medium text-gray-800'>
                      {student.fullname}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {student.fathername || '—'}
                    </p>
                  </div>
                  <span className='text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full'>
                    Unpaid
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most Enrolled Courses */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-5'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
            <FaBookOpen className='text-blue-600' />
            Most Enrolled Courses
          </h2>
          {students.length === 0 ? (
            <p className='text-gray-400 text-center py-6'>
              No students added yet
            </p>
          ) : (
            <div className='space-y-3'>
              {Object.entries(courseCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([courseId, count]) => {
                  const label =
                    courseId.charAt(0).toUpperCase() + courseId.slice(1);
                  const maxCount = Math.max(...Object.values(courseCounts), 1);
                  const percentage = (count / maxCount) * 100;
                  return (
                    <div key={courseId}>
                      <div className='flex justify-between text-sm mb-1'>
                        <span>{label}</span>
                        <span className='font-medium'>
                          {count} student{count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-blue-500 h-2 rounded-full'
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
          {mostPopularCourse && (
            <div className='mt-4 pt-3 border-t text-sm text-gray-600'>
              🔥 Most popular:{' '}
              <span className='font-semibold text-blue-600'>
                {mostPopularCourse[0]}
              </span>{' '}
              ({mostPopularCourse[1]} students)
            </div>
          )}
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className='mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <div className='px-5 py-4 border-b border-gray-200'>
          <h2 className='text-lg font-semibold text-gray-800'>
            Recent Monthly Payments
          </h2>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-5 py-2 text-left'>Student</th>
                <th className='px-5 py-2 text-left'>Month/Year</th>
                <th className='px-5 py-2 text-left'>Amount</th>
                <th className='px-5 py-2 text-left'>Status</th>
              </tr>
            </thead>
            <tbody>
              {monthlyFees.slice(0, 5).map((fee) => (
                <tr
                  key={fee.id}
                  className='border-b border-gray-100 hover:bg-gray-50'
                >
                  <td className='px-5 py-2 font-medium'>{fee.studentName}</td>
                  <td className='px-5 py-2'>
                    {fee.month} {fee.year}
                  </td>
                  <td className='px-5 py-2 text-green-600'>
                    ؋ {fee.paidAmount.toFixed(2)}
                  </td>
                  <td className='px-5 py-2'>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        fee.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {fee.status}
                    </span>
                  </td>
                </tr>
              ))}
              {monthlyFees.length === 0 && (
                <tr>
                  <td
                    colSpan='4'
                    className='px-5 py-8 text-center text-gray-400'
                  >
                    No fee records yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
