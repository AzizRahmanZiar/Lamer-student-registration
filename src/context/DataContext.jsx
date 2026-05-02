// src/context/DataContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase';

const DataContext = createContext();

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }) {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [monthlyFees, setMonthlyFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyDueDay, setMonthlyDueDay] = useState(10);

  // Real-time listeners
  useEffect(() => {
    // Students listener
    const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStudents(data);
    });

    // Monthly fees listener
    const unsubMonthlyFees = onSnapshot(
      collection(db, 'monthlyFees'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMonthlyFees(data);
      },
    );

    // Fees (static fee structures) listener
    const unsubFees = onSnapshot(collection(db, 'fees'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFees(data);
    });

    // Load settings
    const loadSettings = async () => {
      try {
        const settingsRef = doc(db, 'settings', 'global');
        const snap = await getDoc(settingsRef);
        if (snap.exists()) {
          setMonthlyDueDay(snap.data().monthlyDueDay || 10);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();

    return () => {
      unsubStudents();
      unsubMonthlyFees();
      unsubFees();
    };
  }, []);

  // Helper: get current month and year
  const getCurrentMonthYear = () => {
    const now = new Date();
    const monthNames = [
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
    ];
    return {
      month: monthNames[now.getMonth()],
      year: now.getFullYear(),
      monthIndex: now.getMonth(),
    };
  };

  // Helper: calculate total fee from fee structure
  const calculateTotal = (feeRecord) => {
    const subjects = [
      'calligraphy',
      'english',
      'math',
      'physics',
      'computer',
      'arabic',
    ];
    let total = 0;
    subjects.forEach((sub) => {
      total += parseFloat(feeRecord[sub]) || 0;
    });
    return total;
  };

  // Get current month collected amount
  const getCurrentMonthCollected = () => {
    const { month, year } = getCurrentMonthYear();
    return monthlyFees
      .filter(
        (fee) =>
          fee.month === month && fee.year === year && fee.status === 'paid',
      )
      .reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
  };

  // Get pending students for current month
  const getPendingStudents = () => {
    const { month, year } = getCurrentMonthYear();
    const paidStudentIds = monthlyFees
      .filter(
        (fee) =>
          fee.month === month && fee.year === year && fee.status === 'paid',
      )
      .map((fee) => fee.studentId);
    return students.filter((student) => !paidStudentIds.includes(student.id));
  };

  // Get monthly history (last 6 months summary)
  const getMonthlyHistory = () => {
    const history = {};
    monthlyFees.forEach((fee) => {
      const key = `${fee.month} ${fee.year}`;
      if (!history[key]) {
        history[key] = { collected: 0, expected: 0, count: 0 };
      }
      if (fee.status === 'paid') {
        history[key].collected += fee.paidAmount || 0;
      }
      history[key].expected += fee.totalAmount || 0;
      history[key].count++;
    });
    return Object.entries(history)
      .map(([period, data]) => ({ period, ...data }))
      .slice(-6);
  };

  // CRUD for monthly fees
  const addMonthlyFee = async (feeData) => {
    try {
      await addDoc(collection(db, 'monthlyFees'), {
        ...feeData,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding monthly fee:', error);
      throw error;
    }
  };

  const updateMonthlyFee = async (id, feeData) => {
    try {
      const ref = doc(db, 'monthlyFees', id);
      await updateDoc(ref, {
        ...feeData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating monthly fee:', error);
      throw error;
    }
  };

  const deleteMonthlyFee = async (id) => {
    try {
      await deleteDoc(doc(db, 'monthlyFees', id));
    } catch (error) {
      console.error('Error deleting monthly fee:', error);
      throw error;
    }
  };

  // Update monthly due day setting
  const updateMonthlyDueDay = async (day) => {
    try {
      const settingsRef = doc(db, 'settings', 'global');
      await setDoc(settingsRef, { monthlyDueDay: day }, { merge: true });
      setMonthlyDueDay(day);
    } catch (error) {
      console.error('Error updating due day:', error);
      throw error;
    }
  };

  const value = {
    students,
    fees,
    monthlyFees,
    loading,
    monthlyDueDay,
    calculateTotal,
    getCurrentMonthCollected,
    getPendingStudents,
    getMonthlyHistory,
    getCurrentMonthYear,
    addMonthlyFee,
    updateMonthlyFee,
    deleteMonthlyFee,
    updateMonthlyDueDay,
    setFees, // for Fees component
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
