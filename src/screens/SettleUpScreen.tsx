import React, { useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useData } from '../context/DataContext';
import { calculateGroupDebts, buildBalanceDisplay } from '../utils/balance';
import { payWithUpi } from '../utils/upi';

export type SettleUpProps = NativeStackScreenProps<RootStackParamList, 'SettleUp'>;

export const SettleUpScreen: React.FC<SettleUpProps> = ({ route, navigation }) => {
  const { groupId, fromUserId, toUserId, amount } = route.params;
  const { groups, users, expenses, settlements, addSettlement, currentUserId } = useData();
  const group = groups.find((g) => g.id === groupId);

  const debts = useMemo(() => {
    if (!group) return [];
    const baseDebts = calculateGroupDebts(group, expenses, settlements);
    return buildBalanceDisplay(currentUserId, baseDebts, users);
  }, [group, expenses, settlements, currentUserId, users]);

  const initialBalance = debts.find(
    (debt) => debt.fromUserId === fromUserId && debt.toUserId === toUserId && amount === debt.amount
  ) || debts[0];

  const [selectedBalance, setSelectedBalance] = useState(initialBalance);
  const [customAmount, setCustomAmount] = useState(
    initialBalance ? initialBalance.amount.toFixed(0) : amount?.toFixed(0) ?? '0'
  );

  if (!group || !selectedBalance) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text>No balances to settle.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const receiverId = selectedBalance.direction === 'owe' ? selectedBalance.toUserId : selectedBalance.fromUserId;
  const receiver = users.find((u) => u.id === receiverId);
  const amountNumber = Number(customAmount) || 0;

  const handlePayWithUpi = async () => {
    if (!receiver?.upiId) {
      Alert.alert('Missing UPI ID', 'This user does not have a UPI ID set.');
      return;
    }
    await payWithUpi(receiver.upiId, amountNumber, `Settle up for ${group.name}`);
  };

  const handleSettle = () => {
    if (amountNumber <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount to settle.');
      return;
    }

    const fromUser = selectedBalance.direction === 'owe' ? selectedBalance.fromUserId : selectedBalance.toUserId;
    const toUser = selectedBalance.direction === 'owe' ? selectedBalance.toUserId : selectedBalance.fromUserId;

    addSettlement({ groupId: group.id, fromUserId: fromUser, toUserId: toUser, amount: amountNumber });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.heading}>Settle up</Text>
        <View style={styles.selector}>
          <Text style={styles.label}>Paying to:</Text>
          <Text style={styles.value}>{receiver?.name ?? 'User'}</Text>
          <Text style={styles.label}>Amount (₹)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={customAmount}
            onChangeText={setCustomAmount}
          />
          <Text style={styles.label}>UPI ID</Text>
          <Text style={styles.value}>{receiver?.upiId ?? 'Not provided'}</Text>
        </View>

        <Text style={styles.label}>Choose balance</Text>
        {debts.map((debt) => {
          const otherUserId = debt.direction === 'owe' ? debt.toUserId : debt.fromUserId;
          const otherUser = users.find((u) => u.id === otherUserId);
          const isSelected = debt === selectedBalance;
          return (
            <Pressable
              key={`${debt.fromUserId}-${debt.toUserId}`}
              style={[styles.balanceRow, isSelected && styles.balanceRowSelected]}
              onPress={() => {
                setSelectedBalance(debt);
                setCustomAmount(debt.amount.toFixed(0));
              }}
            >
              <Text>
                {debt.direction === 'owe'
                  ? `You owe ${otherUser?.name ?? 'User'} ₹${debt.amount.toFixed(0)}`
                  : `${otherUser?.name ?? 'User'} owes you ₹${debt.amount.toFixed(0)}`}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.footer}>
        <Pressable style={styles.primaryButton} onPress={handlePayWithUpi}>
          <Text style={styles.primaryButtonText}>Pay with UPI</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={handleSettle}>
          <Text style={styles.secondaryButtonText}>Mark as settled</Text>
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
    marginBottom: 16
  },
  selector: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee'
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    marginBottom: 4
  },
  value: {
    fontSize: 16,
    fontWeight: '600'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16
  },
  balanceRow: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 8
  },
  balanceRowSelected: {
    borderColor: '#2f80ed',
    backgroundColor: '#e8f1ff'
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee'
  },
  primaryButton: {
    backgroundColor: '#2f80ed',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700'
  },
  secondaryButton: {
    borderColor: '#2f80ed',
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: '#2f80ed',
    fontWeight: '700'
  }
});
