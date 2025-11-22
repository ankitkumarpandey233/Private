export type User = {
  id: string;
  name: string;
  upiId?: string;
  preferredUpiApp?: string;
};

export type Group = {
  id: string;
  name: string;
  memberIds: string[];
};

export type Expense = {
  id: string;
  groupId: string;
  paidByUserId: string;
  amount: number;
  description: string;
  createdAt: string;
};

export type Settlement = {
  id: string;
  groupId: string;
  payerId: string;
  receiverId: string;
  amount: number;
  createdAt: string;
};
