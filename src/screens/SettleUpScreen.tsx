import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useData } from '../context/DataContext';
import { payWithUpi } from '../utils/upi';
import { colors, radius, spacing } from '../theme';

export type SettleUpProps = NativeStackScreenProps<RootStackParamList, 'SettleUp'>;

export const SettleUpScreen: React.FC<SettleUpProps> = ({ route, navigation }) => {
  const { groupId, payerId, receiverId, amount } = route.params;
  const { groups, users, addSettlement } = useData();
  const group = groups.find((g) => g.id === groupId);
  const payer = useMemo(() => users.find((u) => u.id === payerId), [users, payerId]);
  const receiver = useMemo(() => users.find((u) => u.id === receiverId), [users, receiverId]);
  const [customAmount, setCustomAmount] = useState(amount?.toFixed(0) ?? '0');

  if (!group || !payer || !receiver) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text>Missing details for settling up.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const amountNumber = Number(customAmount) || 0;

  const handleSettle = () => {
    if (amountNumber <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount to settle.');
      return;
    }

    addSettlement({ groupId: group.id, payerId: payer.id, receiverId: receiver.id, amount: amountNumber });
    navigation.goBack();
  };

  const handlePayWithUpi = async () => {
    if (!receiver.upiId || amountNumber <= 0) return;
    await payWithUpi(receiver.upiId, amountNumber, `Settle up for ${group.name}`);
  };

  const handleCopyUpi = async () => {
    if (!receiver.upiId) return;
    await Clipboard.setStringAsync(receiver.upiId);
    Alert.alert('Copied', 'UPI ID copied to clipboard');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Settle up</Text>
          <Text style={styles.subtitle}>You are paying {receiver.name}</Text>
          <Text style={styles.amount}>₹{amountNumber.toFixed(0)}</Text>
          <Text style={styles.groupLabel}>Group: {group.name}</Text>

          <Text style={styles.label}>Amount (₹)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={customAmount}
            onChangeText={setCustomAmount}
          />

          {receiver.upiId ? (
            <View style={styles.upiSection}>
              <Text style={styles.upiLabel}>UPI</Text>
              <View style={styles.upiChip}>
                <Text style={styles.upiValue}>{receiver.upiId}</Text>
              </View>
              <Pressable
                style={[styles.primaryButton, amountNumber <= 0 && styles.disabledButton]}
                onPress={handlePayWithUpi}
                accessibilityRole="button"
                disabled={amountNumber <= 0}
              >
                <Text style={styles.primaryButtonText}>Pay with UPI</Text>
              </Pressable>
              <Pressable style={styles.textButton} onPress={handleCopyUpi} accessibilityRole="button">
                <Text style={styles.textButtonText}>Copy UPI ID</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.upiSection}>
              <Text style={styles.upiLabel}>UPI</Text>
              <Text style={styles.muted}>This user has not added a UPI ID yet.</Text>
            </View>
          )}

          {receiver.upiQrImageUri ? (
            <View style={styles.qrSection}>
              <Text style={styles.qrLabel}>Or scan this QR</Text>
              <Image source={{ uri: receiver.upiQrImageUri }} style={styles.qrPreview} />
              <Text style={styles.qrCaption}>Or scan this QR in your UPI app.</Text>
            </View>
          ) : null}

          <Pressable style={styles.secondaryButton} onPress={handleSettle} accessibilityRole="button">
            <Text style={styles.secondaryButtonText}>Mark as settled</Text>
          </Pressable>
          <Pressable style={styles.textButton} onPress={() => navigation.goBack()} accessibilityRole="button">
            <Text style={styles.textButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
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
    padding: spacing.l,
    justifyContent: 'center'
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.l,
    padding: spacing.l,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.s
  },
  amount: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginVertical: spacing.l
  },
  groupLabel: {
    color: colors.textSecondary,
    marginBottom: spacing.m,
    textAlign: 'center'
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.s
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.m,
    padding: spacing.m,
    fontSize: 16,
    marginBottom: spacing.l,
    backgroundColor: colors.card
  },
  upiSection: {
    marginBottom: spacing.l
  },
  upiLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.s
  },
  upiChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.m,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    alignSelf: 'flex-start',
    marginBottom: spacing.m
  },
  upiValue: {
    color: colors.textPrimary,
    fontWeight: '700'
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: spacing.l
  },
  qrLabel: {
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.s
  },
  qrPreview: {
    width: 220,
    height: 220,
    borderRadius: radius.m,
    marginBottom: spacing.s,
    backgroundColor: colors.background
  },
  qrCaption: {
    color: colors.textSecondary,
    fontSize: 12
  },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.m,
    borderRadius: radius.m,
    alignItems: 'center',
    marginBottom: spacing.s
  },
  primaryButtonText: {
    color: colors.card,
    fontWeight: '700'
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.m,
    borderRadius: radius.m,
    alignItems: 'center',
    marginBottom: spacing.s
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontWeight: '700'
  },
  textButton: {
    paddingVertical: spacing.s,
    alignItems: 'center'
  },
  textButtonText: {
    color: colors.accent,
    fontWeight: '700'
  },
  disabledButton: {
    opacity: 0.6
  },
  muted: {
    color: colors.textSecondary
  }
});
