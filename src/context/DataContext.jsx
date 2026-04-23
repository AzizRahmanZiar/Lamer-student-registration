import { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';

const DataContext = createContext();

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }) {
  const [students, setStudents] = useState([]);
  const [monthlyFees, setMonthlyFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real‑time listeners
  useEffect(() => {
    const unsubStudents = onSnapshot(
      collection(db, 'students'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStudents(data);
      },
      (err) => setError(err),
    );

    const unsubFees = onSnapshot(
      collection(db, 'monthly_fees'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMonthlyFees(data);
        setLoading(false);
      },
      (err) => setError(err),
    );

    return () => {
      unsubStudents();
      unsubFees();
    };
  }, []);

  // Helper: current month/year
  const getCurrentMonthYear = () => {
    const now = new Date();
    return {
      month: now.toLocaleString('default', { month: 'long' }),
      year: now.getFullYear(),
    };
  };

  // Total collected for a specific month/year
  const getMonthlyCollected = (month, year) => {
    return monthlyFees
      .filter(
        (fee) =>
          fee.month === month && fee.year === year && fee.status === 'paid',
      )
      .reduce((sum, fee) => sum + fee.paidAmount, 0);
  };

  // Total collected this month
  const getCurrentMonthCollected = () => {
    const { month, year } = getCurrentMonthYear();
    return getMonthlyCollected(month, year);
  };

  // Students who haven't paid for current month
  const getPendingStudents = () => {
    const { month, year } = getCurrentMonthYear();
    const paidStudentIds = monthlyFees
      .filter((fee) => fee.month === month && fee.year === year)
      .map((fee) => fee.studentId);
    return students.filter((s) => !paidStudentIds.includes(s.id));
  };

  // Monthly history for charts
  const getMonthlyHistory = () => {
    const history = {};
    monthlyFees.forEach((fee) => {
      if (fee.status === 'paid') {
        const key = `${fee.month} ${fee.year}`;
        history[key] = (history[key] || 0) + fee.paidAmount;
      }
    });
    return history;
  };

  // Total paid by a student across all months
  const getStudentTotalPaid = (studentId) => {
    return monthlyFees
      .filter((fee) => fee.studentId === studentId && fee.status === 'paid')
      .reduce((sum, fee) => sum + fee.paidAmount, 0);
  };

  // CRUD operations
  const addMonthlyFee = async (feeData) => {
    try {
      await addDoc(collection(db, 'monthly_fees'), {
        ...feeData,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error adding fee:', err);
      throw err;
    }
  };

  const updateMonthlyFee = async (id, feeData) => {
    try {
      const feeRef = doc(db, 'monthly_fees', id);
      await updateDoc(feeRef, { ...feeData, updatedAt: serverTimestamp() });
    } catch (err) {
      console.error('Error updating fee:', err);
      throw err;
    }
  };

  const deleteMonthlyFee = async (id) => {
    try {
      await deleteDoc(doc(db, 'monthly_fees', id));
    } catch (err) {
      console.error('Error deleting fee:', err);
      throw err;
    }
  };

  const value = {
    students,
    monthlyFees,
    loading,
    error,
    getCurrentMonthCollected,
    getPendingStudents,
    getMonthlyHistory,
    getStudentTotalPaid,
    addMonthlyFee,
    updateMonthlyFee,
    deleteMonthlyFee,
    getCurrentMonthYear,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
