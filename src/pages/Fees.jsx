// src/components/Fees.jsx
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  FaPlusCircle,
  FaBook,
  FaDollarSign,
  FaSave,
  FaTimes,
  FaCalculator,
  FaUser,
  FaEdit,
  FaTrash,
  FaSearch,
} from 'react-icons/fa';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const ALL_SUBJECTS = [
  { id: 'calligraphy', label: 'Calligraphy' },
  { id: 'english', label: 'English' },
  { id: 'math', label: 'Mathematics' },
  { id: 'physics', label: 'Physics' },
  { id: 'computer', label: 'Computer' },
  { id: 'arabic', label: 'Arabic' },
];

export default function Fees() {
  const { students, fees, setFees, calculateTotal } = useData();
  const { role } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [feeToDelete, setFeeToDelete] = useState(null);
  const [form, setForm] = useState({
    studentId: '',
    fullname: '',
    fathername: '',
    subjectFees: {},
  });

  const fetchFees = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'fees'));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFees(data);
    } catch (error) {
      console.error('Error fetching fees:', error);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const resetModal = () => {
    setEditingId(null);
    setSelectedStudentId('');
    setAvailableSubjects([]);
    setForm({ studentId: '', fullname: '', fathername: '', subjectFees: {} });
  };

  const handleStudentChange = (studentId) => {
    setSelectedStudentId(studentId);
    const student = students.find((s) => String(s.id) === String(studentId));

    if (student) {
      const enrolled = Array.isArray(student.courses) ? student.courses : [];
      const matched = ALL_SUBJECTS.filter((sub) => enrolled.includes(sub.id));
      setAvailableSubjects(matched);
      setForm({
        studentId: student.id,
        fullname: student.fullname,
        fathername: student.fathername || '',
        subjectFees: {},
      });
    } else {
      setAvailableSubjects([]);
      setForm({ studentId: '', fullname: '', fathername: '', subjectFees: {} });
    }
  };

  const handleSubjectFeeChange = (subjectId, value) => {
    setForm((prev) => ({
      ...prev,
      subjectFees: { ...prev.subjectFees, [subjectId]: value },
    }));
  };

  const formTotal = () => {
    return Object.values(form.subjectFees).reduce(
      (sum, val) => sum + (parseFloat(val) || 0),
      0,
    );
  };

  const handleSubmit = async () => {
    if (!form.studentId) return;

    try {
      const feeData = {
        studentId: form.studentId,
        fullname: form.fullname,
        fathername: form.fathername,
        ...ALL_SUBJECTS.reduce((acc, sub) => {
          acc[sub.id] = form.subjectFees[sub.id] || '0';
          return acc;
        }, {}),
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        const feeRef = doc(db, 'fees', editingId);
        await updateDoc(feeRef, feeData);
      } else {
        await addDoc(collection(db, 'fees'), {
          ...feeData,
          createdAt: serverTimestamp(),
        });
      }
      await fetchFees();
      setShowModal(false);
      resetModal();
    } catch (error) {
      console.error('Error saving fee:', error);
    }
  };

  const handleEdit = (fee) => {
    setEditingId(fee.id);
    const student = students.find(
      (s) => String(s.id) === String(fee.studentId),
    );
    if (student) {
      const enrolled = student.courses || [];
      const matched = ALL_SUBJECTS.filter((sub) => enrolled.includes(sub.id));
      setAvailableSubjects(matched);
      const subjectFees = {};
      matched.forEach((sub) => {
        subjectFees[sub.id] = fee[sub.id] || '';
      });
      setForm({
        studentId: fee.studentId,
        fullname: fee.fullname,
        fathername: fee.fathername || '',
        subjectFees,
      });
      setSelectedStudentId(fee.studentId);
    } else {
      setAvailableSubjects(ALL_SUBJECTS);
      const subjectFees = {};
      ALL_SUBJECTS.forEach((sub) => {
        subjectFees[sub.id] = fee[sub.id] || '';
      });
      setForm({
        studentId: fee.studentId,
        fullname: fee.fullname,
        fathername: fee.fathername || '',
        subjectFees,
      });
      setSelectedStudentId(fee.studentId);
    }
    setShowModal(true);
  };

  const handleDeleteClick = (fee) => {
    setFeeToDelete(fee);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (feeToDelete) {
      try {
        await deleteDoc(doc(db, 'fees', feeToDelete.id));
        await fetchFees();
      } catch (error) {
        console.error('Error deleting fee:', error);
      } finally {
        setDeleteModalOpen(false);
        setFeeToDelete(null);
      }
    }
  };

  const filteredFees = fees.filter(
    (fee) =>
      fee.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fee.fathername &&
        fee.fathername.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const subjectFields = ALL_SUBJECTS;

  return (
    <div className='px-4 sm:px-6 py-4 sm:py-6'>
      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6'>
        <div>
          <h1 className='text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2'>
            <FaDollarSign className='text-green-600' size={24} />
            Fee Management
          </h1>
          <p className='text-gray-500 text-xs sm:text-sm mt-1'>
            Select a student and enter fees for their enrolled courses only
          </p>
        </div>
        <button
          onClick={() => {
            resetModal();
            setShowModal(true);
          }}
          className='bg-green-600 hover:bg-green-700 transition text-white px-4 py-2 rounded-xl shadow-sm flex items-center justify-center gap-2 font-medium text-sm sm:text-base'
        >
          <FaPlusCircle size={16} /> Add Fee Record
        </button>
      </div>

      {/* Search Bar */}
      <div className='mb-4 relative'>
        <FaSearch
          className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
          size={14}
        />
        <input
          type='text'
          placeholder='Search by student name or father name...'
          className='w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm min-w-[800px]'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='px-3 sm:px-5 py-3 text-left font-semibold text-gray-700 text-xs sm:text-sm'>
                  Student
                </th>
                <th className='px-3 sm:px-5 py-3 text-left font-semibold text-gray-700 text-xs sm:text-sm'>
                  Father Name
                </th>
                {subjectFields.map((sub) => (
                  <th
                    key={sub.id}
                    className='px-3 sm:px-5 py-3 text-left font-semibold text-gray-700 text-xs sm:text-sm'
                  >
                    {sub.label}
                  </th>
                ))}
                <th className='px-3 sm:px-5 py-3 text-left font-semibold text-gray-700 bg-green-50 text-xs sm:text-sm'>
                  Total (PKR)
                </th>
                <th className='px-3 sm:px-5 py-3 text-center font-semibold text-gray-700 text-xs sm:text-sm'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {filteredFees.length === 0 ? (
                <tr>
                  <td
                    colSpan={subjectFields.length + 4}
                    className='px-5 py-12 text-center text-gray-400'
                  >
                    <FaBook size={32} className='mx-auto text-gray-300 mb-2' />
                    No fee records available
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => (
                  <tr key={fee.id} className='hover:bg-gray-50 transition'>
                    <td className='px-3 sm:px-5 py-3 font-medium text-gray-800 text-xs sm:text-sm'>
                      {fee.fullname}
                    </td>
                    <td className='px-3 sm:px-5 py-3 text-gray-600 text-xs sm:text-sm'>
                      {fee.fathername || '—'}
                    </td>
                    {subjectFields.map((sub) => (
                      <td
                        key={sub.id}
                        className='px-3 sm:px-5 py-3 text-gray-700 text-xs sm:text-sm'
                      >
                        {fee[sub.id] && fee[sub.id] !== '0' ? fee[sub.id] : '—'}
                      </td>
                    ))}
                    <td className='px-3 sm:px-5 py-3 font-semibold text-green-700 bg-green-50 text-xs sm:text-sm'>
                      ₨ {calculateTotal(fee).toFixed(2)}
                    </td>
                    <td className='px-3 sm:px-5 py-3 text-center'>
                      {role === 'admin' ? (
                        <div className='flex items-center justify-center gap-2'>
                          <button
                            onClick={() => handleEdit(fee)}
                            className='text-blue-600 hover:text-blue-800'
                            title='Edit'
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(fee)}
                            className='text-red-600 hover:text-red-800'
                            title='Delete'
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className='text-xs text-gray-400'>
                          (read only)
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto'>
          <div className='bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 mx-4'>
            <div className='bg-gradient-to-r from-green-600 to-emerald-700 px-4 sm:px-6 py-4 flex justify-between items-center rounded-t-2xl'>
              <h2 className='text-lg sm:text-xl font-semibold text-white flex items-center gap-2'>
                <FaSave size={20} />{' '}
                {editingId ? 'Edit Fee Record' : 'New Fee Entry'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className='text-white/80 hover:text-white'
              >
                <FaTimes size={22} />
              </button>
            </div>
            <div className='p-4 sm:p-6 max-h-[70vh] overflow-y-auto'>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Select Student *
                </label>
                <div className='relative'>
                  <FaUser
                    className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                    size={16}
                  />
                  <select
                    className='w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm'
                    value={selectedStudentId}
                    onChange={(e) => handleStudentChange(e.target.value)}
                  >
                    <option value=''>-- Choose a student --</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.fullname} (courses:{' '}
                        {student.courses?.join(', ') || 'none'})
                      </option>
                    ))}
                  </select>
                </div>
                {form.fullname && (
                  <div className='mt-2 text-sm text-gray-600'>
                    <span className='font-medium'>Father:</span>{' '}
                    {form.fathername}
                  </div>
                )}
              </div>

              {availableSubjects.length === 0 && selectedStudentId && (
                <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-700'>
                  ⚠️ This student has no enrolled courses. Please edit the
                  student and add courses first.
                </div>
              )}

              {availableSubjects.length > 0 && (
                <div className='mb-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Course Fees (only enrolled subjects)
                  </label>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    {availableSubjects.map((sub) => (
                      <div key={sub.id} className='relative'>
                        <FaBook
                          className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                          size={14}
                        />
                        <input
                          type='number'
                          placeholder={`${sub.label} fee (PKR)`}
                          className='w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm'
                          value={form.subjectFees[sub.id] || ''}
                          onChange={(e) =>
                            handleSubjectFeeChange(sub.id, e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                <div className='flex items-center justify-between flex-wrap gap-2'>
                  <div className='flex items-center gap-2'>
                    <FaCalculator className='text-green-600' size={18} />
                    <span className='font-medium text-gray-700 text-sm'>
                      Total Amount:
                    </span>
                  </div>
                  <div className='text-xl sm:text-2xl font-bold text-green-700'>
                    ₨ {formTotal().toFixed(2)}
                  </div>
                </div>
                <p className='text-xs text-gray-400 mt-1'>
                  Only fees for enrolled courses are included
                </p>
              </div>
            </div>
            <div className='flex flex-col sm:flex-row justify-end gap-3 px-4 sm:px-6 pb-6 pt-2 border-t border-gray-100'>
              <button
                onClick={() => setShowModal(false)}
                className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm'
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.studentId || availableSubjects.length === 0}
                className={`px-5 py-2 rounded-lg shadow-sm transition font-medium text-sm flex items-center justify-center gap-2 ${
                  !form.studentId || availableSubjects.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <FaSave size={16} />{' '}
                {editingId ? 'Update Record' : 'Save Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title='Delete Fee Record'
        message={`Are you sure you want to delete fee record for ${feeToDelete?.fullname || 'this student'}? This action cannot be undone.`}
      />
    </div>
  );
}
