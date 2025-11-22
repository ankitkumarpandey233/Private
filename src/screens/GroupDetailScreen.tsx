import React, { useMemo } from 'react';
import { Alert, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useData } from '../context/DataContext';
import { BalanceSummary } from '../components/BalanceSummary';
import { ExpenseItem } from '../components/ExpenseItem';
import { buildBalanceDisplay } from '../utils/balance';
import { colors, radius, spacing } from '../theme';

export type GroupDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'GroupDetail'>;

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
      ...groupExpenses.map((expense) => ({
        type: 'expense',
        id: expense.id,
        createdAt: expense.createdAt
      })),
      ...groupSettlements.map((settlement) => ({
        type: 'settlement',
        id: settlement.id,
        createdAt: settlement.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [groupExpenses, groupSettlements]);

  const settleTarget = useMemo(
    () => balances.find((b) => b.direction === 'owe') || balances[0],
    [balances]
  );

  const settleTargetUser = useMemo(() => {
    if (!settleTarget) return undefined;
    const userId =
      settleTarget.direction === 'owe' ? settleTarget.toUserId : settleTarget.fromUserId;
    return users.find((u) => u.id === userId);
  }, [settleTarget, users]);

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
    const target = settleTarget;
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
        <Text style={styles.settlementDate}>
          {new Date(settlement.createdAt).toLocaleDateString()}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.heroCard}>
          <Text style={styles.heading}>{group.name}</Text>
          <Text
            style={[
              styles.summary,
              summaryText.toLowerCase().includes('owed')
                ? styles.positiveText
                : summaryText.toLowerCase().includes('owe')
                ? styles.dangerText
                : styles.mutedText
            ]}
          >
            {summaryText}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Balances</Text>
          <BalanceSummary summary="" balances={balances} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Activity</Text>
        </View>
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
          ListEmptyComponent={<Text style={styles.mutedText}>No activity yet.</Text>}
          contentContainerStyle={{ paddingBottom: spacing.xl * 3 }}
        />
      </View>
      <View style={styles.footer}>
        {settleTargetUser?.upiId ? (
          <Text style={styles.footerHint}>
            You can pay {settleTargetUser.name} via UPI on the next screen.
          </Text>
        ) : null}
        <Pressable
          style={styles.secondaryButton}
          onPress={handleSettleUp}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryButtonText}>Settle up</Text>
        </Pressable>
      </View>
      <Pressable style={styles.fab} onPress={handleAddExpense} accessibilityRole="button">
        <Feather name="plus" size={24} color={colors.card} />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.m,
    paddingTop: spacing.l
  },
  heroCard: {
    backgroundColor: colors.card,
    padding: spacing.l,
    borderRadius: radius.l,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary
  },
  summary: {
    fontSize: 16,
    marginTop: spacing.s,
    color: colors.textSecondary
  },
  section: {
    marginBottom: spacing.l
  },
  sectionHeader: {
    marginBottom: spacing.s
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary
  },
  footer: {
    padding: spacing.l,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderColor: colors.border
  },
  footerHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.s
  },
  secondaryButton: {
    borderColor: colors.accent,
    borderWidth: 1,
    paddingVertical: spacing.m,
    borderRadius: radius.m,
    alignItems: 'center',
    backgroundColor: colors.card
  },
  secondaryButtonText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 16
  },
  fab: {
    position: 'absolute',
    right: spacing.l,
    bottom: spacing.xl,
    backgroundColor: colors.accent,
    padding: spacing.m,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  settlementCard: {
    backgroundColor: colors.card,
    padding: spacing.m,
    borderRadius: radius.m,
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: colors.border
  },
  settlementLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.s / 2
  },
  settlementText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.s / 2
  },
  settlementDate: {
    fontSize: 12,
    color: colors.textSecondary
  },
  mutedText: {
    color: colors.textSecondary
  },
  dangerText: {
    color: colors.danger
  },
  positiveText: {
    color: colors.positive
  }
});
