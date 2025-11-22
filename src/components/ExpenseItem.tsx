import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Expense, User } from '../types';

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

  return (
    <Pressable onLongPress={handleLongPress} delayLongPress={180}>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.amount}>₹{expense.amount.toFixed(0)}</Text>
          <Text style={styles.title}>{payer?.name ?? 'Someone'} paid</Text>
        </View>
        <Text style={styles.description}>{expense.description}</Text>
        <Text style={styles.date}>{new Date(expense.createdAt).toLocaleDateString()}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1cc29f'
  },
  title: {
    fontWeight: '600',
    color: '#222'
  },
  description: {
    color: '#555',
    marginBottom: 6
  },
  date: {
    color: '#777',
    fontSize: 12
  }
});
