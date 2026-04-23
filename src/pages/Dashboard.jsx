import { useData } from '../context/DataContext';
import {
  FaUsers,
  FaMoneyBillWave,
  FaChartLine,
  FaBookOpen,
  FaCalculator,
  FaSchool,
} from 'react-icons/fa';

export default function Dashboard() {
  const { students, fees, getTotalCollected, getAverageFee, getSubjectTotals } =
    useData();

  const totalStudents = students.length;
  const totalFeeRecords = fees.length;
  const totalCollected = getTotalCollected();
  const averageFee = getAverageFee();
  const subjectTotals = getSubjectTotals();

  // Find most enrolled course (from students)
  const courseCounts = {};
  students.forEach((student) => {
    student.courses?.forEach((course) => {
      courseCounts[course] = (courseCounts[course] || 0) + 1;
    });
  });
  const mostPopularCourse = Object.entries(courseCounts).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const statsCards = [
    {
      title: 'Total Students',
      value: totalStudents,
      icon: FaUsers,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Fee Records',
      value: totalFeeRecords,
      icon: FaMoneyBillWave,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Collected',
      value: `₨ ${totalCollected.toFixed(2)}`,
      icon: FaCalculator,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Average Fee',
      value: `₨ ${averageFee.toFixed(2)}`,
      icon: FaChartLine,
      color: 'bg-orange-500',
      bgLight: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800 flex items-center gap-2'>
          <FaSchool className='text-indigo-600' size={28} />
          Dashboard
        </h1>
        <p className='text-gray-500 text-sm mt-1'>
          Overview of student enrollment and fee collection
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8'>
        {statsCards.map((card, idx) => (
          <div
            key={idx}
            className={`${card.bgLight} rounded-xl p-5 shadow-sm border border-gray-100 transition hover:shadow-md`}
          >
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-gray-500 text-sm'>{card.title}</p>
                <p className={`text-2xl font-bold mt-1 ${card.textColor}`}>
                  {card.value}
                </p>
              </div>
              <div className={`${card.color} p-3 rounded-full text-white`}>
                <card.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout for charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Subject-wise Fee Collection */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-5'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
            <FaMoneyBillWave className='text-green-600' /> Subject-wise Fee
            Collection
          </h2>
          <div className='space-y-3'>
            {Object.entries(subjectTotals).map(([subject, total]) => {
              const maxTotal = Math.max(...Object.values(subjectTotals), 1);
              const percentage = (total / maxTotal) * 100;
              const subjectLabel =
                subject.charAt(0).toUpperCase() + subject.slice(1);
              return (
                <div key={subject}>
                  <div className='flex justify-between text-sm mb-1'>
                    <span className='text-gray-700'>{subjectLabel}</span>
                    <span className='font-medium text-gray-800'>
                      ₨ {total.toFixed(2)}
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2.5'>
                    <div
                      className='bg-green-500 h-2.5 rounded-full'
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          {fees.length === 0 && (
            <p className='text-gray-400 text-sm mt-4 text-center'>
              No fee data available
            </p>
          )}
        </div>

        {/* Popular Courses (based on student enrollment) */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-5'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
            <FaBookOpen className='text-blue-600' /> Most Enrolled Courses
          </h2>
          {students.length === 0 ? (
            <p className='text-gray-400 text-sm text-center py-8'>
              No students added yet
            </p>
          ) : (
            <div className='space-y-3'>
              {Object.entries(courseCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([courseId, count]) => {
                  const courseLabel =
                    courseId.charAt(0).toUpperCase() + courseId.slice(1);
                  const maxCount = Math.max(...Object.values(courseCounts), 1);
                  const percentage = (count / maxCount) * 100;
                  return (
                    <div key={courseId}>
                      <div className='flex justify-between text-sm mb-1'>
                        <span className='text-gray-700'>{courseLabel}</span>
                        <span className='font-medium text-gray-800'>
                          {count} student{count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2.5'>
                        <div
                          className='bg-blue-500 h-2.5 rounded-full'
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
          {mostPopularCourse && (
            <div className='mt-4 pt-3 border-t border-gray-100 text-sm text-gray-600'>
              🔥 Most popular:{' '}
              <span className='font-semibold text-blue-600'>
                {mostPopularCourse[0].charAt(0).toUpperCase() +
                  mostPopularCourse[0].slice(1)}
              </span>{' '}
              ({mostPopularCourse[1]} students)
            </div>
          )}
        </div>
      </div>

      {/* Recent Fee Records Preview */}
      <div className='mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <div className='px-5 py-4 border-b border-gray-200'>
          <h2 className='text-lg font-semibold text-gray-800'>
            Recent Fee Records
          </h2>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-5 py-2 text-left text-gray-600'>Student</th>
                <th className='px-5 py-2 text-left text-gray-600'>
                  Father Name
                </th>
                <th className='px-5 py-2 text-left text-gray-600'>Total Fee</th>
              </tr>
            </thead>
            <tbody>
              {fees.slice(0, 5).map((fee, idx) => {
                const total = Object.keys(subjectTotals).reduce(
                  (sum, sub) => sum + (parseFloat(fee[sub]) || 0),
                  0,
                );
                return (
                  <tr
                    key={idx}
                    className='border-b border-gray-100 hover:bg-gray-50'
                  >
                    <td className='px-5 py-2 font-medium'>{fee.fullname}</td>
                    <td className='px-5 py-2 text-gray-600'>
                      {fee.fathername || '—'}
                    </td>
                    <td className='px-5 py-2 text-green-600 font-medium'>
                      ₨ {total.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
              {fees.length === 0 && (
                <tr>
                  <td
                    colSpan='3'
                    className='px-5 py-8 text-center text-gray-400'
                  >
                    No fee records found
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
