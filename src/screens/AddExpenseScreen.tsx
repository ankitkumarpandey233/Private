import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useData } from '../context/DataContext';

const ACCENT = '#1cc29f';

type AddExpenseProps = NativeStackScreenProps<RootStackParamList, 'AddExpense'>;

export const AddExpenseScreen: React.FC<AddExpenseProps> = ({ route, navigation }) => {
  const { groupId, expenseId } = route.params;
  const { groups, users, currentUserId, addExpense, updateExpense, expenses } = useData();
  const group = groups.find((g) => g.id === groupId);
  const expenseToEdit = expenses.find((e) => e.id === expenseId);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidByUserId, setPaidByUserId] = useState(currentUserId);
  const [splitType, setSplitType] = useState<'equal' | 'stub'>('equal');

  useEffect(() => {
    if (expenseToEdit) {
      setDescription(expenseToEdit.description);
      setAmount(expenseToEdit.amount.toString());
      setPaidByUserId(expenseToEdit.paidByUserId);
    }
  }, [expenseToEdit]);

  const members = useMemo(() => {
    return group?.memberIds
      .map((id) => users.find((user) => user.id === id))
      .filter(Boolean)
      .map((u) => u!);
  }, [group, users]);

  const handleSave = () => {
    if (!group) return;
    const numericAmount = Number(amount);
    if (!description || !numericAmount || numericAmount <= 0) {
      Alert.alert('Missing info', 'Please add a description and a valid amount.');
      return;
    }

    if (expenseToEdit) {
      updateExpense(expenseToEdit.id, {
        description,
        amount: numericAmount,
        paidByUserId
      });
    } else {
      addExpense({
        groupId: group.id,
        description,
        amount: numericAmount,
        paidByUserId
      });
    }

    navigation.goBack();
  };

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
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>{expenseToEdit ? 'Edit expense' : 'Add expense'}</Text>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Dinner, taxi, etc."
        />

        <Text style={styles.label}>Amount (₹)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0"
        />

        <Text style={styles.label}>Paid by</Text>
        <View style={styles.chipRow}>
          {members?.map((member) => (
            <Pressable
              key={member.id}
              style={[styles.chip, paidByUserId === member.id && styles.chipSelected]}
              onPress={() => setPaidByUserId(member.id)}
            >
              <Text style={[styles.chipText, paidByUserId === member.id && styles.chipTextSelected]}>
                {member.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Split type</Text>
        <View style={styles.chipRow}>
          <Pressable
            style={[styles.chip, splitType === 'equal' && styles.chipSelected]}
            onPress={() => setSplitType('equal')}
          >
            <Text style={[styles.chipText, splitType === 'equal' && styles.chipTextSelected]}>Split equally</Text>
          </Pressable>
          <Pressable style={styles.chip} onPress={() => setSplitType('stub')}>
            <Text style={styles.chipText}>Custom (coming soon)</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Pressable style={styles.secondaryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.secondaryText}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={handleSave}>
            <Text style={styles.primaryText}>Save</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  container: {
    padding: 16
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#222'
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    color: '#777',
    marginBottom: 6,
    marginTop: 12
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    fontSize: 16
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginBottom: 8,
    marginRight: 8
  },
  chipSelected: {
    backgroundColor: 'rgba(28, 194, 159, 0.15)',
    borderColor: ACCENT,
    borderWidth: 1
  },
  chipText: {
    color: '#444'
  },
  chipTextSelected: {
    color: ACCENT,
    fontWeight: '700'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 10
  },
  primaryButton: {
    backgroundColor: ACCENT,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center'
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16
  },
  secondaryButton: {
    borderColor: '#ccc',
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  secondaryText: {
    color: '#444',
    fontWeight: '700',
    fontSize: 16
  }
});
