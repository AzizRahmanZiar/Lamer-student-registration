// src/components/MonthlyFeeEntry.jsx
import { useState } from 'react';
import {
  FaSave,
  FaTimes,
  FaBook,
  FaUser,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaTrash,
  FaEdit,
} from 'react-icons/fa';
import { useData } from '../context/DataContext';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const SUBJECTS = [
  { id: 'calligraphy', label: 'Calligraphy' },
  { id: 'english', label: 'English' },
  { id: 'math', label: 'Mathematics' },
  { id: 'physics', label: 'Physics' },
  { id: 'computer', label: 'Computer' },
  { id: 'arabic', label: 'Arabic' },
];

export default function MonthlyFeeEntry() {
  const {
    students,
    monthlyFees,
    addMonthlyFee,
    updateMonthlyFee,
    deleteMonthlyFee,
    getCurrentMonthYear,
  } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [feeToDelete, setFeeToDelete] = useState(null);

  const [form, setForm] = useState({
    studentId: '',
    studentName: '',
    month: getCurrentMonthYear().month,
    year: getCurrentMonthYear().year,
    subjectFees: {},
    paidAmount: 0,
  });

  const resetForm = () => {
    setEditingId(null);
    setForm({
      studentId: '',
      studentName: '',
      month: getCurrentMonthYear().month,
      year: getCurrentMonthYear().year,
      subjectFees: {},
      paidAmount: 0,
    });
  };

  const handleStudentChange = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    if (student) {
      const initialFees = {};
      student.courses?.forEach((courseId) => {
        initialFees[courseId] = 0;
      });
      setForm({
        ...form,
        studentId: student.id,
        studentName: student.fullname,
        subjectFees: initialFees,
      });
    }
  };

  const handleSubjectFeeChange = (subjectId, value) => {
    setForm((prev) => ({
      ...prev,
      subjectFees: { ...prev.subjectFees, [subjectId]: parseFloat(value) || 0 },
    }));
  };

  const totalAmount = Object.values(form.subjectFees).reduce(
    (sum, val) => sum + val,
    0,
  );

  const handleSubmit = async () => {
    if (!form.studentId) return;

    const subjectsArray = Object.entries(form.subjectFees).map(([id, fee]) => ({
      id,
      fee,
    }));
    const feeData = {
      studentId: form.studentId,
      studentName: form.studentName,
      month: form.month,
      year: form.year,
      subjects: subjectsArray,
      totalAmount,
      paidAmount: form.paidAmount,
      status:
        form.paidAmount >= totalAmount
          ? 'paid'
          : form.paidAmount > 0
            ? 'partial'
            : 'unpaid',
      paymentDate: new Date(),
    };

    try {
      if (editingId) {
        await updateMonthlyFee(editingId, feeData);
      } else {
        await addMonthlyFee(feeData);
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving fee:', error);
    }
  };

  const handleEdit = (fee) => {
    setEditingId(fee.id);
    const subjectFees = {};
    fee.subjects.forEach((sub) => {
      subjectFees[sub.id] = sub.fee;
    });
    setForm({
      studentId: fee.studentId,
      studentName: fee.studentName,
      month: fee.month,
      year: fee.year,
      subjectFees,
      paidAmount: fee.paidAmount,
    });
    setShowModal(true);
  };

  const handleDeleteClick = (fee) => {
    setFeeToDelete(fee);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (feeToDelete) {
      await deleteMonthlyFee(feeToDelete.id);
      setDeleteModalOpen(false);
      setFeeToDelete(null);
    }
  };

  return (
    <div className='px-4 sm:px-6 py-4 sm:py-6'>
      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6'>
        <div>
          <h1 className='text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2'>
            <FaMoneyBillWave className='text-green-600' size={24} />
            Monthly Fee Collection
          </h1>
          <p className='text-gray-500 text-xs sm:text-sm mt-1'>
            Record monthly payments for each student
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 font-medium'
        >
          <FaSave size={16} /> New Payment
        </button>
      </div>

      {/* Fees Table */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm min-w-[700px]'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-5 py-3 text-left'>Student</th>
                <th className='px-5 py-3 text-left'>Month/Year</th>
                <th className='px-5 py-3 text-left'>Total Fee</th>
                <th className='px-5 py-3 text-left'>Paid</th>
                <th className='px-5 py-3 text-left'>Status</th>
                <th className='px-5 py-3 text-center'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {monthlyFees.map((fee) => (
                <tr
                  key={fee.id}
                  className='border-b border-gray-100 hover:bg-gray-50'
                >
                  <td className='px-5 py-3 font-medium'>{fee.studentName}</td>
                  <td className='px-5 py-3'>
                    {fee.month} {fee.year}
                  </td>
                  <td className='px-5 py-3'>؋ {fee.totalAmount.toFixed(2)}</td>
                  <td className='px-5 py-3'>؋ {fee.paidAmount.toFixed(2)}</td>
                  <td className='px-5 py-3'>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        fee.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : fee.status === 'partial'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {fee.status}
                    </span>
                  </td>
                  <td className='px-5 py-3 text-center'>
                    <div className='flex justify-center gap-2'>
                      <button
                        onClick={() => handleEdit(fee)}
                        className='text-blue-600 hover:text-blue-800'
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(fee)}
                        className='text-red-600 hover:text-red-800'
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {monthlyFees.length === 0 && (
                <tr>
                  <td
                    colSpan='6'
                    className='px-5 py-12 text-center text-gray-400'
                  >
                    No monthly fee records yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto'>
          <div className='bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8'>
            <div className='bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-4 flex justify-between items-center rounded-t-2xl'>
              <h2 className='text-xl font-semibold text-white'>
                {editingId ? 'Edit Payment' : 'Record Monthly Fee'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className='text-white/80 hover:text-white'
              >
                <FaTimes size={22} />
              </button>
            </div>
            <div className='p-6 space-y-4 max-h-[70vh] overflow-y-auto'>
              {/* Student */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Student *
                </label>
                <div className='relative'>
                  <FaUser
                    className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                    size={16}
                  />
                  <select
                    className='w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 focus:ring-green-500'
                    value={form.studentId}
                    onChange={(e) => handleStudentChange(e.target.value)}
                    disabled={!!editingId}
                  >
                    <option value=''>Select a student</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullname} ({s.courses?.join(', ') || 'no courses'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Month/Year */}
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Month
                  </label>
                  <div className='relative'>
                    <FaCalendarAlt
                      className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                      size={14}
                    />
                    <select
                      className='w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2'
                      value={form.month}
                      onChange={(e) =>
                        setForm({ ...form, month: e.target.value })
                      }
                    >
                      {[
                        'January',
                        'February',
                        'March',
                        'April',
                        'May',
                        'June',
                        'July',
                        'August',
                        'September',
                        'October',
                        'November',
                        'December',
                      ].map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Year
                  </label>
                  <input
                    type='number'
                    className='w-full border border-gray-300 rounded-lg px-3 py-2'
                    value={form.year}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        year:
                          parseInt(e.target.value) || new Date().getFullYear(),
                      })
                    }
                  />
                </div>
              </div>

              {/* Subject Fees */}
              {form.studentId && Object.keys(form.subjectFees).length > 0 && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Course Fees (AFN)
                  </label>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    {Object.entries(form.subjectFees).map(
                      ([subjectId, fee]) => {
                        const subject = SUBJECTS.find(
                          (s) => s.id === subjectId,
                        );
                        return (
                          <div key={subjectId} className='relative'>
                            <FaBook
                              className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                              size={14}
                            />
                            <input
                              type='number'
                              placeholder={subject?.label || subjectId}
                              className='w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2'
                              value={fee}
                              onChange={(e) =>
                                handleSubjectFeeChange(
                                  subjectId,
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              )}

              {/* Paid Amount */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Amount Paid (AFN)
                </label>
                <div className='relative'>
                  <FaMoneyBillWave
                    className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                    size={16}
                  />
                  <input
                    type='number'
                    className='w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2'
                    value={form.paidAmount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        paidAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              {/* Total */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <div className='flex justify-between items-center'>
                  <span className='font-medium'>Total Fee:</span>
                  <span className='text-xl font-bold text-green-700'>
                    ؋ {totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-between items-center mt-1'>
                  <span className='font-medium'>Status:</span>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      form.paidAmount >= totalAmount
                        ? 'bg-green-100 text-green-800'
                        : form.paidAmount > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {form.paidAmount >= totalAmount
                      ? 'Paid'
                      : form.paidAmount > 0
                        ? 'Partial'
                        : 'Unpaid'}
                  </span>
                </div>
              </div>
            </div>
            <div className='flex justify-end gap-3 px-6 pb-6 pt-2 border-t border-gray-100'>
              <button
                onClick={() => setShowModal(false)}
                className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className='px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm font-medium'
              >
                {editingId ? 'Update' : 'Save Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title='Delete Fee Record'
        message={`Delete payment for ${feeToDelete?.studentName} (${feeToDelete?.month} ${feeToDelete?.year})? This action cannot be undone.`}
      />
    </div>
  );
}
