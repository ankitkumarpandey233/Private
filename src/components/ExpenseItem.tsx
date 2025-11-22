import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Expense, User } from '../types';
import { colors, radius, spacing } from '../theme';

interface ExpenseItemProps {
  expense: Expense;
  payer: User | undefined;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, payer, onEdit, onDelete }) => {
  const handleLongPress = () => {
    if (!onEdit && !onDelete) return;
    Alert.alert('Expense options', undefined, [
      onEdit ? { text: 'Edit', onPress: onEdit } : undefined,
      onDelete ? { text: 'Delete', onPress: onDelete, style: 'destructive' } : undefined,
      { text: 'Cancel', style: 'cancel' }
    ].filter(Boolean) as { text: string; onPress?: () => void; style?: 'destructive' | 'cancel' }[]);
  };

  const primaryLine = `${payer?.name ?? 'Someone'} paid ₹${expense.amount.toFixed(0)} – ${
    expense.description
  }`;

  return (
    <Pressable onLongPress={handleLongPress} delayLongPress={180}>
      <View style={styles.card}>
        <Text style={styles.title}>{primaryLine}</Text>
        <Text style={styles.date}>{new Date(expense.createdAt).toLocaleDateString()}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    padding: spacing.m,
    borderRadius: radius.m,
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1
  },
  title: {
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.s / 2
  },
  date: {
    color: colors.textSecondary,
    fontSize: 12
  }
});
