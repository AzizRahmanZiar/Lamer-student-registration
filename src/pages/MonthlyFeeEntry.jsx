import { useState, useEffect } from 'react';
import {
  FaSave, FaBook, FaUser, FaCalendarAlt, FaMoneyBillWave,
  FaTrash, FaEdit, FaUserCircle, FaFilter, FaPlusCircle,
  FaCheckCircle, FaExclamationCircle, FaSearch,FaTimes  
} from 'react-icons/fa';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import SearchableDropdown from '../components/SearchableDropdown';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import Table from '../components/Table';
import Button from '../components/Button';
import { useModal } from '../hooks/useModal';

const SUBJECTS = [
  { id: 'calligraphy', label: 'Calligraphy' },
  { id: 'english', label: 'English' },
  { id: 'math', label: 'Mathematics' },
  { id: 'physics', label: 'Physics' },
  { id: 'computer', label: 'Computer' },
  { id: 'arabic', label: 'Arabic' },
];

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function MonthlyFeeEntry() {
  const {
    students,
    monthlyFees,
    addMonthlyFee,
    updateMonthlyFee,
    deleteMonthlyFee,
    getCurrentMonthYear,
    getCurrentUserCanEdit,
  } = useData();
  const { role } = useAuth();
  const modal = useModal(false);
  const deleteModal = useModal(false);
  const [editingId, setEditingId] = useState(null);
  const [feeToDelete, setFeeToDelete] = useState(null);
  const [filterMonth, setFilterMonth] = useState(getCurrentMonthYear().month);
  const [filterYear, setFilterYear] = useState(getCurrentMonthYear().year);
  const [generating, setGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    studentId: '',
    studentName: '',
    month: getCurrentMonthYear().month,
    year: getCurrentMonthYear().year,
    subjectFees: {},
    paidAmount: '',
  });

  const canEdit = getCurrentUserCanEdit();

  const filteredFees = monthlyFees.filter(
    fee => fee.month === filterMonth && fee.year === filterYear
  );

  const resetForm = () => {
    setEditingId(null);
    setError('');
    setForm({
      studentId: '',
      studentName: '',
      month: filterMonth,
      year: filterYear,
      subjectFees: {},
      paidAmount: '',
    });
  };

  useEffect(() => {
    setForm(prev => ({ ...prev, month: filterMonth, year: filterYear }));
  }, [filterMonth, filterYear]);

  const getAvailableStudents = () => {
    if (editingId) return students;
    const existingIds = new Set(
      monthlyFees
        .filter(f => f.month === form.month && f.year === form.year)
        .map(f => f.studentId)
    );
    return students.filter(s => !existingIds.has(s.id));
  };

  const availableStudents = getAvailableStudents();
  const selectedStudent = students.find(s => s.id === form.studentId);

  const handleStudentSelect = (student) => {
    if (!student) {
      setForm({ ...form, studentId: '', studentName: '', subjectFees: {} });
      return;
    }
    const initialFees = {};
    student.courses?.forEach(courseId => {
      initialFees[courseId] = '';
    });
    setForm({
      ...form,
      studentId: student.id,
      studentName: student.fullname,
      subjectFees: initialFees,
    });
    setError('');
  };

  const handleSubjectFeeChange = (subjectId, value) => {
    setForm(prev => ({
      ...prev,
      subjectFees: { ...prev.subjectFees, [subjectId]: value },
    }));
    setError('');
  };

  const totalAmount = Object.values(form.subjectFees).reduce(
    (sum, val) => sum + (parseFloat(val) || 0),
    0
  );
  const paidAmountNum = parseFloat(form.paidAmount) || 0;

  const isDuplicate = () => {
    if (editingId) return false;
    return monthlyFees.some(
      f => f.studentId === form.studentId &&
           f.month === form.month &&
           f.year === form.year
    );
  };

  const handleSubmit = async () => {
    if (!form.studentId) {
      setError('Please select a student.');
      return;
    }
    if (isDuplicate()) {
      setError(`A fee record for ${form.studentName} already exists for ${form.month} ${form.year}.`);
      return;
    }

    const subjectsArray = Object.entries(form.subjectFees).map(([id, fee]) => ({
      id,
      fee: parseFloat(fee) || 0,
    }));

    const feeData = {
      studentId: form.studentId,
      studentName: form.studentName,
      month: form.month,
      year: form.year,
      subjects: subjectsArray,
      totalAmount,
      paidAmount: paidAmountNum,
      status: paidAmountNum >= totalAmount ? 'paid' : paidAmountNum > 0 ? 'partial' : 'unpaid',
    };

    try {
      if (editingId) {
        await updateMonthlyFee(editingId, feeData);
      } else {
        await addMonthlyFee(feeData);
      }
      modal.close();
      resetForm();
    } catch (error) {
      console.error('Error saving fee:', error);
      alert('Failed to save fee record.');
    }
  };

  const handleEdit = (fee) => {
    setEditingId(fee.id);
    const subjectFees = {};
    fee.subjects.forEach(sub => {
      subjectFees[sub.id] = sub.fee === 0 ? '' : sub.fee.toString();
    });
    setForm({
      studentId: fee.studentId,
      studentName: fee.studentName,
      month: fee.month,
      year: fee.year,
      subjectFees,
      paidAmount: fee.paidAmount === 0 ? '' : fee.paidAmount.toString(),
    });
    setError('');
    modal.open();
  };

  const handleDeleteClick = (fee) => {
    setFeeToDelete(fee);
    deleteModal.open();
  };

  const handleConfirmDelete = async () => {
    if (feeToDelete) {
      await deleteMonthlyFee(feeToDelete.id);
      deleteModal.close();
      setFeeToDelete(null);
    }
  };

  const generateMonthlyFees = async () => {
    setGenerating(true);
    try {
      const existingIds = new Set(filteredFees.map(f => f.studentId));
      const toGenerate = students.filter(s => !existingIds.has(s.id));
      if (toGenerate.length === 0) {
        setGenerationResult({
          success: false,
          count: 0,
          month: filterMonth,
          year: filterYear,
          students: [],
          message: 'All students already have fee records for this month.',
        });
        setGenerating(false);
        return;
      }
      const generatedNames = [];
      for (const student of toGenerate) {
        const subjectFees = {};
        (student.courses || []).forEach(courseId => {
          subjectFees[courseId] = 0;
        });
        const subjectsArray = Object.entries(subjectFees).map(([id, fee]) => ({ id, fee }));
        await addMonthlyFee({
          studentId: student.id,
          studentName: student.fullname,
          month: filterMonth,
          year: filterYear,
          subjects: subjectsArray,
          totalAmount: 0,
          paidAmount: 0,
          status: 'unpaid',
        });
        generatedNames.push(student.fullname);
      }
      setGenerationResult({
        success: true,
        count: toGenerate.length,
        month: filterMonth,
        year: filterYear,
        students: generatedNames,
        message: `Successfully generated ${toGenerate.length} fee record(s).`,
      });
    } catch (error) {
      console.error('Error generating fees:', error);
      setGenerationResult({
        success: false,
        count: 0,
        month: filterMonth,
        year: filterYear,
        students: [],
        message: 'Failed to generate fee records. Please try again.',
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-6">
      <PageHeader
        title="Monthly Fee Collection"
        subtitle="Record and track monthly payments"
        actions={[
          {
            children: 'New Payment',
            icon: FaSave,
            onClick: () => { resetForm(); modal.open(); },
            variant: 'success'
          }
        ]}
      />

      <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <FaFilter className="text-gray-500" />
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
        >
          {monthNames.map(m => <option key={m}>{m}</option>)}
        </select>
        <input
          type="number"
          value={filterYear}
          onChange={(e) => setFilterYear(parseInt(e.target.value) || new Date().getFullYear())}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-24"
        />
        <span className="text-sm text-gray-500">({filteredFees.length} records)</span>
        <button
          onClick={generateMonthlyFees}
          disabled={generating}
          className="ml-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-1.5 rounded-lg text-sm flex items-center gap-2"
        >
          <FaPlusCircle size={14} />
          {generating ? 'Generating...' : 'Generate for this month'}
        </button>
      </div>

      <Table headers={['Student', 'Month/Year', 'Total Fee', 'Paid', 'Status', 'Actions']}>
        {filteredFees.length === 0 ? (
          <tr>
            <td colSpan="6" className="px-5 py-12 text-center text-gray-400">
              No records for {filterMonth} {filterYear}.
              <button onClick={generateMonthlyFees} className="ml-2 text-blue-600 underline">
                Generate now
              </button>
            </td>
          </tr>
        ) : (
          filteredFees.map(fee => (
            <tr key={fee.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-5 py-3 font-medium">{fee.studentName}</td>
              <td className="px-5 py-3">{fee.month} {fee.year}</td>
              <td className="px-5 py-3">؋ {fee.totalAmount.toFixed(2)}</td>
              <td className="px-5 py-3">؋ {fee.paidAmount.toFixed(2)}</td>
              <td className="px-5 py-3">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  fee.status === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : fee.status === 'partial'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {fee.status}
                </span>
              </td>
              <td className="px-5 py-3 text-center">
                {canEdit ? (
                  <div className="flex justify-center gap-2">
                    <button onClick={() => handleEdit(fee)} className="text-blue-600 hover:text-blue-800">
                      <FaEdit size={16} />
                    </button>
                    <button onClick={() => handleDeleteClick(fee)} className="text-red-600 hover:text-red-800">
                      <FaTrash size={16} />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">(view only)</span>
                )}
              </td>
            </tr>
          ))
        )}
      </Table>

      <Modal isOpen={modal.isOpen} onClose={modal.close} title={editingId ? 'Edit Payment' : 'Record Monthly Fee'}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
          {editingId ? (
            <div className="p-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
              {form.studentName} <span className="text-xs text-gray-400 ml-2">(editing)</span>
            </div>
          ) : availableStudents.length === 0 ? (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm flex items-start gap-2">
              <FaExclamationCircle className="mt-0.5 flex-shrink-0" size={18} />
              <div>
                All students have fee records for {form.month} {form.year}.
                {filterMonth === form.month && filterYear === form.year ? (
                  <span> You can generate fees for a different month using the filter above.</span>
                ) : (
                  <span> You can generate fees for this month using the "Generate for this month" button.</span>
                )}
              </div>
            </div>
          ) : (
            <SearchableDropdown
              items={availableStudents}
              value={form.studentId}
              onChange={handleStudentSelect}
              placeholder="Search by student name or father name..."
              displayKey="fullname"
              secondaryKey="fathername"
            />
          )}
          {form.studentName && !editingId && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Selected:</span> {form.studentName}
              {selectedStudent?.fathername && ` (${selectedStudent.fathername})`}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <select
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2"
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
              >
                {monthNames.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || new Date().getFullYear() })}
            />
          </div>
        </div>

        {form.studentId && Object.keys(form.subjectFees).length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Fees (AFN)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(form.subjectFees).map(([subjectId, fee]) => {
                const subject = SUBJECTS.find(s => s.id === subjectId);
                return (
                  <div key={subjectId} className="relative">
                    <FaBook className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="number"
                      placeholder={`${subject?.label || subjectId} fee (AFN)`}
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2"
                      value={fee}
                      onChange={(e) => handleSubjectFeeChange(subjectId, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (AFN)</label>
          <div className="relative">
            <FaMoneyBillWave className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="number"
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2"
              value={form.paidAmount}
              onChange={(e) => setForm({ ...form, paidAmount: e.target.value })}
              placeholder="Enter paid amount"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Fee:</span>
            <span className="text-xl font-bold text-green-700">؋ {totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="font-medium">Status:</span>
            <span className={`text-sm px-2 py-1 rounded-full ${
              paidAmountNum >= totalAmount
                ? 'bg-green-100 text-green-800'
                : paidAmountNum > 0
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {paidAmountNum >= totalAmount ? 'Paid' : paidAmountNum > 0 ? 'Partial' : 'Unpaid'}
            </span>
          </div>
        </div>

        {/* ✅ Footer buttons fixed */}
        <div className="flex justify-end gap-3 mt-4 border-t pt-4">
          <Button variant="outline" onClick={modal.close}>Cancel</Button>
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={!form.studentId || (!editingId && availableStudents.length === 0)}
          >
            {editingId ? 'Update' : 'Save Payment'}
          </Button>
        </div>
      </Modal>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleConfirmDelete}
        title="Delete Fee Record"
        message={`Delete payment for ${feeToDelete?.studentName} (${feeToDelete?.month} ${feeToDelete?.year})? This action cannot be undone.`}
      />

      {generationResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative animate-fadeInUp">
            <button
              onClick={() => setGenerationResult(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FaTimes size={20} />
            </button>
            <div className="flex justify-center mb-4">
              {generationResult.success ? (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-green-600 text-3xl" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <FaExclamationCircle className="text-red-600 text-3xl" />
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800">
              {generationResult.success ? 'Generation Complete' : 'Generation Failed'}
            </h2>
            <p className="text-center text-gray-600 mt-2">{generationResult.message}</p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Month/Year</span>
                <span className="font-medium">{generationResult.month} {generationResult.year}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-600">Records Created</span>
                <span className="font-medium">{generationResult.count}</span>
              </div>
            </div>
            {generationResult.success && generationResult.students.length > 0 && (
              <div className="mt-4 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                <p className="text-xs text-gray-500 font-medium mb-1">Students:</p>
                <div className="flex flex-wrap gap-1">
                  {generationResult.students.slice(0, 20).map((name, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {name}
                    </span>
                  ))}
                  {generationResult.students.length > 20 && (
                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                      +{generationResult.students.length - 20} more
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setGenerationResult(null)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm font-medium"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}