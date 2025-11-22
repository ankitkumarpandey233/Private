import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BalanceDisplay } from '../utils/balance';

interface BalanceSummaryProps {
  summary: string;
  balances: BalanceDisplay[];
}

export const BalanceSummary: React.FC<BalanceSummaryProps> = ({ summary, balances }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.summary}>{summary}</Text>
      {balances.map((balance) => (
        <Text key={`${balance.fromUserId}-${balance.toUserId}`} style={styles.balanceText}>
          {balance.direction === 'owe'
            ? `You owe ${balance.otherUserName} ₹${balance.amount.toFixed(0)}`
            : `${balance.otherUserName} owes you ₹${balance.amount.toFixed(0)}`}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  summary: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8
  },
  balanceText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4
  }
});
