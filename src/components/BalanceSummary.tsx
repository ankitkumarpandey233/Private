import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BalanceDisplay } from '../utils/balance';
import { colors, radius, spacing } from '../theme';

interface BalanceSummaryProps {
  summary: string;
  balances: BalanceDisplay[];
}

export const BalanceSummary: React.FC<BalanceSummaryProps> = ({ summary, balances }) => {
  return (
    <View style={styles.container}>
      {summary ? <Text style={styles.summary}>{summary}</Text> : null}
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
    marginBottom: spacing.l
  },
  summary: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.m,
    color: colors.textPrimary
  },
  balanceRow: {
    backgroundColor: colors.card,
    borderRadius: radius.m,
    padding: spacing.m,
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: colors.border
  },
  balanceText: {
    fontSize: 14,
    color: colors.textPrimary
  },
  oweText: {
    color: colors.danger
  },
  owedText: {
    color: colors.positive
  }
});
