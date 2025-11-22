import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BalanceDisplay } from '../utils/balance';

interface BalanceSummaryProps {
  summary: string;
  balances: BalanceDisplay[];
}

const ACCENT = '#1cc29f';

export const BalanceSummary: React.FC<BalanceSummaryProps> = ({ summary, balances }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.summary}>{summary}</Text>
      {balances.map((balance) => (
        <View key={`${balance.fromUserId}-${balance.toUserId}`} style={styles.balanceRow}>
          <Text
            style={[
              styles.balanceText,
              balance.direction === 'owe' ? styles.oweText : styles.owedText
            ]}
          >
            {balance.direction === 'owe'
              ? `You owe ${balance.otherUserName} ₹${balance.amount.toFixed(0)}`
              : `${balance.otherUserName} owes you ₹${balance.amount.toFixed(0)}`}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20
  },
  summary: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: '#222'
  },
  balanceRow: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee'
  },
  balanceText: {
    fontSize: 14,
    color: '#444'
  },
  oweText: {
    color: '#d9534f'
  },
  owedText: {
    color: ACCENT
  }
});
