import React, { useMemo } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useData } from '../context/DataContext';
import { BalanceSummary } from '../components/BalanceSummary';
import { ExpenseItem } from '../components/ExpenseItem';
import { buildBalanceDisplay, calculateGroupDebts } from '../utils/balance';

export type GroupDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'GroupDetail'>;

export const GroupDetailScreen: React.FC<GroupDetailScreenProps> = ({ route, navigation }) => {
  const { groupId } = route.params;
  const { groups, expenses, users, currentUserId, settlements } = useData();
  const group = groups.find((g) => g.id === groupId);

  const groupExpenses = useMemo(
    () => expenses.filter((expense) => expense.groupId === groupId),
    [expenses, groupId]
  );

  const balances = useMemo(() => {
    if (!group) return [];
    const debts = calculateGroupDebts(group, expenses, settlements);
    return buildBalanceDisplay(currentUserId, debts, users);
  }, [group, expenses, settlements, currentUserId, users]);

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

  if (!group) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text>Group not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.heading}>{group.name}</Text>
        <BalanceSummary summary={summaryText} balances={balances} />
        <Text style={styles.subheading}>Expenses</Text>
        <FlatList
          data={groupExpenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ExpenseItem expense={item} payer={users.find((u) => u.id === item.paidByUserId)} />
          )}
          ListEmptyComponent={<Text>No expenses yet.</Text>}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>
      <View style={styles.footer}>
        <Pressable
          style={styles.button}
          onPress={() =>
            navigation.navigate('SettleUp', {
              groupId,
              fromUserId: balances[0]?.fromUserId,
              toUserId: balances[0]?.toUserId,
              amount: balances[0]?.amount
            })
          }
        >
          <Text style={styles.buttonText}>Settle up</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7'
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee'
  },
  button: {
    backgroundColor: '#2f80ed',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16
  }
});
