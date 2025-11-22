import React, { createContext, useContext, useMemo, useState } from 'react';
import { expenses as seedExpenses, groups as seedGroups, users as seedUsers } from '../data/sampleData';
import { calculateGroupDebts } from '../utils/balance';
import { Expense, Group, Settlement, User } from '../types';
import { nanoid } from 'nanoid/non-secure';

export type DataContextValue = {
  currentUserId: string;
  users: User[];
  groups: Group[];
  expenses: Expense[];
  settlements: Settlement[];
  updateUser: (userId: string, updates: Partial<User>) => void;
  addSettlement: (settlement: Omit<Settlement, 'id' | 'createdAt'>) => void;
  getGroupDebts: (groupId: string) => ReturnType<typeof calculateGroupDebts>;
};

const DataContext = createContext<DataContextValue | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [expenses] = useState<Expense[]>(seedExpenses);
  const [groups] = useState<Group[]>(seedGroups);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const currentUserId = 'u1';

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, ...updates } : user)));
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

  const value = useMemo(
    () => ({ currentUserId, users, expenses, groups, settlements, updateUser, addSettlement, getGroupDebts }),
    [users, expenses, groups, settlements]
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
