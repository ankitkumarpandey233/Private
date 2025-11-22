import { Expense, Group, Settlement, User } from '../types';

type Debt = {
  fromUserId: string;
  toUserId: string;
  amount: number;
};

const keyForPair = (from: string, to: string) => `${from}|${to}`;

export const calculateGroupDebts = (
  group: Group,
  expenses: Expense[],
  settlements: Settlement[]
): Debt[] => {
  const debtMap = new Map<string, number>();

  const groupExpenses = expenses.filter((expense) => expense.groupId === group.id);
  const memberCount = group.memberIds.length;

  groupExpenses.forEach((expense) => {
    const share = expense.amount / memberCount;
    group.memberIds.forEach((memberId) => {
      if (memberId !== expense.paidByUserId) {
        const key = keyForPair(memberId, expense.paidByUserId);
        const current = debtMap.get(key) ?? 0;
        debtMap.set(key, current + share);
      }
    });
  });

  settlements
    .filter((settlement) => settlement.groupId === group.id)
    .forEach((settlement) => {
      const key = keyForPair(settlement.fromUserId, settlement.toUserId);
      const current = debtMap.get(key) ?? 0;
      const updated = current - settlement.amount;
      if (updated > 0) {
        debtMap.set(key, updated);
      } else {
        debtMap.delete(key);
      }
    });

  return Array.from(debtMap.entries()).map(([pairKey, amount]) => {
    const [fromUserId, toUserId] = pairKey.split('|');
    return { fromUserId, toUserId, amount };
  });
};

export const summarizeForUser = (
  currentUserId: string,
  debts: Debt[],
  users: User[]
): { summary: string; balances: Debt[] } => {
  const relevantDebts = debts.filter(
    (debt) => debt.fromUserId === currentUserId || debt.toUserId === currentUserId
  );

  const totalOwe = relevantDebts
    .filter((debt) => debt.fromUserId === currentUserId)
    .reduce((sum, debt) => sum + debt.amount, 0);
  const totalOwed = relevantDebts
    .filter((debt) => debt.toUserId === currentUserId)
    .reduce((sum, debt) => sum + debt.amount, 0);

  let summary = 'All settled up';
  if (totalOwe > totalOwed) {
    summary = `You owe ₹${(totalOwe - totalOwed).toFixed(0)}`;
  } else if (totalOwed > totalOwe) {
    summary = `You are owed ₹${(totalOwed - totalOwe).toFixed(0)}`;
  }

  const balances = relevantDebts.map((debt) => {
    const otherUserId = debt.fromUserId === currentUserId ? debt.toUserId : debt.fromUserId;
    const otherUser = users.find((user) => user.id === otherUserId);
    const direction = debt.fromUserId === currentUserId ? 'owe' : 'owed';
    return {
      fromUserId: debt.fromUserId,
      toUserId: debt.toUserId,
      amount: debt.amount,
      direction,
      otherUserName: otherUser?.name ?? 'User'
    } as Debt & { direction: 'owe' | 'owed'; otherUserName: string };
  });

  return { summary, balances: balances as Debt[] };
};

export type BalanceDisplay = {
  direction: 'owe' | 'owed';
  otherUserName: string;
  amount: number;
  fromUserId: string;
  toUserId: string;
};

export const buildBalanceDisplay = (
  currentUserId: string,
  debts: Debt[],
  users: User[]
): BalanceDisplay[] => {
  return debts
    .filter((debt) => debt.fromUserId === currentUserId || debt.toUserId === currentUserId)
    .map((debt) => {
      const isOwing = debt.fromUserId === currentUserId;
      const otherUserId = isOwing ? debt.toUserId : debt.fromUserId;
      const otherUser = users.find((user) => user.id === otherUserId);
      return {
        direction: isOwing ? 'owe' : 'owed',
        otherUserName: otherUser?.name ?? 'User',
        amount: debt.amount,
        fromUserId: debt.fromUserId,
        toUserId: debt.toUserId
      };
    });
};
