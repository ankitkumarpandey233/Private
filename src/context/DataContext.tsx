import React, { createContext, useContext, useMemo, useState } from 'react';
import { expenses as seedExpenses, groups as seedGroups, users as seedUsers } from '../data/sampleData';
import { calculateGroupDebts } from '../utils/balance';
import { Expense, Group, Settlement, User } from '../types';
import { nanoid } from 'nanoid/non-secure';

export type DataContextValue = {
  currentUserId: string;
  currentUser?: User;
  users: User[];
  groups: Group[];
  expenses: Expense[];
  settlements: Settlement[];
  updateUser: (userId: string, updates: Partial<User>) => void;
  updateCurrentUserUpi: (upiId: string) => void;
  updateCurrentUserUpiQrImage: (upiQrImageUri: string) => void;
  addSettlement: (settlement: Omit<Settlement, 'id' | 'createdAt'>) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (expenseId: string, updates: Partial<Expense>) => void;
  deleteExpense: (expenseId: string) => void;
  getGroupDebts: (groupId: string) => ReturnType<typeof calculateGroupDebts>;
};

const DataContext = createContext<DataContextValue | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [expenses, setExpenses] = useState<Expense[]>(seedExpenses);
  const [groups] = useState<Group[]>(seedGroups);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const currentUserId = 'u1';

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId),
    [users, currentUserId]
  );

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, ...updates } : user)));
  };

  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    setExpenses((prev) => [
      ...prev,
      {
        ...expense,
        id: nanoid(),
        createdAt: new Date().toISOString()
      }
    ]);
  };

  const updateExpense = (expenseId: string, updates: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((expense) => (expense.id === expenseId ? { ...expense, ...updates } : expense))
    );
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== expenseId));
  };

  const addSettlement = (settlement: Omit<Settlement, 'id' | 'createdAt'>) => {
    setSettlements((prev) => [
      ...prev,
      {
        ...settlement,
        id: nanoid(),
        createdAt: new Date().toISOString()
      }
    ]);
  };

  const getGroupDebts = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return [];
    return calculateGroupDebts(group, expenses, settlements);
  };

  const updateCurrentUserUpi = (upiId: string) => {
    updateUser(currentUserId, { upiId });
  };

  const updateCurrentUserUpiQrImage = (upiQrImageUri: string) => {
    updateUser(currentUserId, { upiQrImageUri });
  };

  const value = useMemo(
    () => ({
      currentUserId,
      currentUser,
      users,
      expenses,
      groups,
      settlements,
      updateUser,
      updateCurrentUserUpi,
      updateCurrentUserUpiQrImage,
      addSettlement,
      addExpense,
      updateExpense,
      deleteExpense,
      getGroupDebts
    }),
    [currentUserId, currentUser, users, expenses, groups, settlements]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
