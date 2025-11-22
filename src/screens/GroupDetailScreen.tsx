import React, { useMemo } from 'react';
import { Alert, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useData } from '../context/DataContext';
import { BalanceSummary } from '../components/BalanceSummary';
import { ExpenseItem } from '../components/ExpenseItem';
import { buildBalanceDisplay } from '../utils/balance';

export type GroupDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'GroupDetail'>;

const ACCENT = '#1cc29f';

type ActivityItem =
  | { type: 'expense'; id: string; createdAt: string }
  | { type: 'settlement'; id: string; createdAt: string };

export const GroupDetailScreen: React.FC<GroupDetailScreenProps> = ({ route, navigation }) => {
  const { groupId } = route.params;
  const {
    groups,
    expenses,
    users,
    currentUserId,
    settlements,
    deleteExpense,
    getGroupDebts
  } = useData();
  const group = groups.find((g) => g.id === groupId);

  const groupExpenses = useMemo(
    () => expenses.filter((expense) => expense.groupId === groupId),
    [expenses, groupId]
  );

  const groupSettlements = useMemo(
    () => settlements.filter((settlement) => settlement.groupId === groupId),
    [settlements, groupId]
  );

  const balances = useMemo(() => {
    if (!group) return [];
    const debts = getGroupDebts(groupId);
    return buildBalanceDisplay(currentUserId, debts, users);
  }, [group, getGroupDebts, groupId, currentUserId, users]);

  const summaryText = useMemo(() => {
    if (balances.length === 0) return 'All settled up';
    const oweTotal = balances
      .filter((balance) => balance.direction === 'owe')
      .reduce((sum, balance) => sum + balance.amount, 0);
    const owedTotal = balances
      .filter((balance) => balance.direction === 'owed')
      .reduce((sum, balance) => sum + balance.amount, 0);

    if (oweTotal > owedTotal) return `You owe ₹${(oweTotal - owedTotal).toFixed(0)}`;
    if (owedTotal > oweTotal) return `You are owed ₹${(owedTotal - oweTotal).toFixed(0)}`;
    return 'All settled up';
  }, [balances]);

  const activity: ActivityItem[] = useMemo(() => {
    return [
      ...groupExpenses.map((expense) => ({ type: 'expense', id: expense.id, createdAt: expense.createdAt })),
      ...groupSettlements.map((settlement) => ({
        type: 'settlement',
        id: settlement.id,
        createdAt: settlement.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [groupExpenses, groupSettlements]);

  if (!group) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text>Group not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddExpense = () => {
    navigation.navigate('AddExpense', { groupId });
  };

  const handleSettleUp = () => {
    const target = balances.find((b) => b.direction === 'owe') || balances[0];
    if (!target) {
      Alert.alert('All settled', 'No balances to settle right now.');
      return;
    }
    const payerId = target.direction === 'owe' ? target.fromUserId : target.toUserId;
    const receiverId = target.direction === 'owe' ? target.toUserId : target.fromUserId;
    navigation.navigate('SettleUp', { groupId, payerId, receiverId, amount: target.amount });
  };

  const renderSettlement = (settlementId: string) => {
    const settlement = groupSettlements.find((s) => s.id === settlementId);
    if (!settlement) return null;
    const payer = users.find((u) => u.id === settlement.payerId);
    const receiver = users.find((u) => u.id === settlement.receiverId);

    let text = `${payer?.name ?? 'Someone'} settled ₹${settlement.amount.toFixed(0)} with ${
      receiver?.name ?? 'someone'
    }`;
    if (settlement.payerId === currentUserId) {
      text = `You settled ₹${settlement.amount.toFixed(0)} with ${receiver?.name ?? 'someone'}`;
    } else if (settlement.receiverId === currentUserId) {
      text = `${payer?.name ?? 'Someone'} settled ₹${settlement.amount.toFixed(0)} with you`;
    }

    return (
      <View style={styles.settlementCard}>
        <Text style={styles.settlementLabel}>Settlement</Text>
        <Text style={styles.settlementText}>{text}</Text>
        <Text style={styles.settlementDate}>{new Date(settlement.createdAt).toLocaleDateString()}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.heroCard}>
          <Text style={styles.heading}>{group.name}</Text>
          <Text style={styles.summary}>{summaryText}</Text>
        </View>
        <BalanceSummary summary={summaryText} balances={balances} />
        <Text style={styles.subheading}>Activity</Text>
        <FlatList
          data={activity}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            if (item.type === 'expense') {
              const expense = groupExpenses.find((e) => e.id === item.id);
              if (!expense) return null;
              return (
                <ExpenseItem
                  expense={expense}
                  payer={users.find((u) => u.id === expense.paidByUserId)}
                  onEdit={() => navigation.navigate('AddExpense', { groupId, expenseId: expense.id })}
                  onDelete={() =>
                    Alert.alert('Delete expense?', 'This cannot be undone.', [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => deleteExpense(expense.id)
                      }
                    ])
                  }
                />
              );
            }
            return renderSettlement(item.id);
          }}
          ListEmptyComponent={<Text>No expenses yet.</Text>}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      </View>
      <View style={styles.footer}>
        <Pressable style={styles.secondaryButton} onPress={handleSettleUp}>
          <Text style={styles.secondaryButtonText}>Settle up</Text>
        </Pressable>
      </View>
      <Pressable style={styles.fab} onPress={handleAddExpense} accessibilityRole="button">
        <Text style={styles.fabText}>＋ Add expense</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16
  },
  heroCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee'
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222'
  },
  summary: {
    fontSize: 16,
    color: '#555',
    marginTop: 6
  },
  subheading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#222'
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee'
  },
  secondaryButton: {
    borderColor: ACCENT,
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  secondaryButtonText: {
    color: ACCENT,
    fontWeight: '700',
    fontSize: 16
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 26,
    backgroundColor: ACCENT,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  fabText: {
    color: '#fff',
    fontWeight: '700'
  },
  settlementCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee'
  },
  settlementLabel: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4
  },
  settlementText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4
  },
  settlementDate: {
    fontSize: 12,
    color: '#777'
  }
});
