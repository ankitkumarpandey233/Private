import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Expense, User } from '../types';

interface ExpenseItemProps {
  expense: Expense;
  payer: User | undefined;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, payer }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {payer?.name ?? 'Someone'} paid ₹{expense.amount.toFixed(0)}
      </Text>
      <Text style={styles.description}>{expense.description}</Text>
      <Text style={styles.date}>{new Date(expense.createdAt).toLocaleDateString()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee'
  },
  title: {
    fontWeight: '600',
    marginBottom: 4
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
