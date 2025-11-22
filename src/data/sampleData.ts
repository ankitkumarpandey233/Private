import { Expense, Group, User } from '../types';

export const users: User[] = [
  { id: 'u1', name: 'You', upiId: 'you@okaxis', upiQrImageUri: 'https://via.placeholder.com/200x200.png?text=Your+UPI+QR' },
  { id: 'u2', name: 'Rahul', upiId: 'rahul@okhdfc', upiQrImageUri: 'https://via.placeholder.com/200x200.png?text=Rahul+QR' },
  { id: 'u3', name: 'Aisha', upiId: 'aisha@okicici' },
  { id: 'u4', name: 'Vikram', upiId: 'vikram@ybl' }
];

export const groups: Group[] = [
  { id: 'g1', name: 'Weekend Trip', memberIds: ['u1', 'u2', 'u3'] },
  { id: 'g2', name: 'Flatmates', memberIds: ['u1', 'u2', 'u4'] },
  { id: 'g3', name: 'Office Lunch', memberIds: ['u1', 'u3', 'u4'] }
];

export const expenses: Expense[] = [
  {
    id: 'e1',
    groupId: 'g1',
    paidByUserId: 'u2',
    amount: 1200,
    description: 'Cab from station',
    createdAt: new Date().toISOString()
  },
  {
    id: 'e2',
    groupId: 'g1',
    paidByUserId: 'u3',
    amount: 1800,
    description: 'Dinner',
    createdAt: new Date().toISOString()
  },
  {
    id: 'e3',
    groupId: 'g2',
    paidByUserId: 'u1',
    amount: 900,
    description: 'Groceries',
    createdAt: new Date().toISOString()
  },
  {
    id: 'e4',
    groupId: 'g3',
    paidByUserId: 'u4',
    amount: 1500,
    description: 'Team lunch',
    createdAt: new Date().toISOString()
  }
];
