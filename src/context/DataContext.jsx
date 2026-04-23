// src/context/DataContext.jsx
import { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);

  // Calculate total for a single fee record
  const calculateTotal = (entry) => {
    const subjects = [
      'calligraphy',
      'english',
      'math',
      'physics',
      'computer',
      'arabic',
    ];
    const total = subjects.reduce((sum, sub) => {
      const val = parseFloat(entry[sub]) || 0;
      return sum + val;
    }, 0);
    return total;
  };

  // Get total collected amount from all fees
  const getTotalCollected = () => {
    return fees.reduce((sum, fee) => sum + calculateTotal(fee), 0);
  };

  // Get average fee per student (among those who have fee records)
  const getAverageFee = () => {
    if (fees.length === 0) return 0;
    return getTotalCollected() / fees.length;
  };

  // Get subject-wise total fees
  const getSubjectTotals = () => {
    const subjects = [
      'calligraphy',
      'english',
      'math',
      'physics',
      'computer',
      'arabic',
    ];
    const totals = {};
    subjects.forEach((sub) => {
      totals[sub] = 0;
    });
    fees.forEach((fee) => {
      subjects.forEach((sub) => {
        totals[sub] += parseFloat(fee[sub]) || 0;
      });
    });
    return totals;
  };

  return (
    <DataContext.Provider
      value={{
        students,
        setStudents,
        fees,
        setFees,
        calculateTotal,
        getTotalCollected,
        getAverageFee,
        getSubjectTotals,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
