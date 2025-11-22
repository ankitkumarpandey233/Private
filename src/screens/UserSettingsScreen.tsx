import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useData } from '../context/DataContext';

export const UserSettingsScreen: React.FC = () => {
  const { users, currentUserId, updateUser } = useData();
  const currentUser = users.find((u) => u.id === currentUserId);
  const [upiId, setUpiId] = useState(currentUser?.upiId ?? '');
  const [preferredApp, setPreferredApp] = useState(currentUser?.preferredUpiApp ?? '');

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text>User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = () => {
    updateUser(currentUserId, { upiId: upiId.trim(), preferredUpiApp: preferredApp.trim() });
    Alert.alert('Saved', 'Your payment details have been updated.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.heading}>Settings</Text>
        <Text style={styles.label}>Your UPI ID</Text>
        <TextInput
          style={styles.input}
          value={upiId}
          onChangeText={setUpiId}
          placeholder="yourname@bank"
          autoCapitalize="none"
        />
        <Text style={styles.label}>Preferred UPI app (optional)</Text>
        <TextInput
          style={styles.input}
          value={preferredApp}
          onChangeText={setPreferredApp}
          placeholder="Google Pay, PhonePe, etc"
        />
        <Text style={styles.save} onPress={handleSave}>
          Save
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f2f2f2'
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
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 12
  },
  save: {
    color: '#2f80ed',
    fontWeight: '700',
    fontSize: 16,
    marginTop: 8
  }
});
