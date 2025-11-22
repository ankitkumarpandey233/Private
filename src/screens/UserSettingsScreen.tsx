import React, { useEffect, useState } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import { useData } from '../context/DataContext';
import { colors, radius, spacing } from '../theme';

export const UserSettingsScreen: React.FC = () => {
  const {
    currentUser,
    currentUserId,
    updateCurrentUserUpi,
    updateCurrentUserUpiQrImage,
    updateUser
  } = useData();

  const [upiId, setUpiId] = useState(currentUser?.upiId ?? '');
  const [preferredApp, setPreferredApp] = useState(currentUser?.preferredUpiApp ?? '');
  const [upiQrImageUri, setUpiQrImageUri] = useState(currentUser?.upiQrImageUri ?? '');

  useEffect(() => {
    setUpiId(currentUser?.upiId ?? '');
    setPreferredApp(currentUser?.preferredUpiApp ?? '');
    setUpiQrImageUri(currentUser?.upiQrImageUri ?? '');
  }, [currentUser]);

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
    const trimmedUpi = upiId.trim();
    updateCurrentUserUpi(trimmedUpi);
    updateUser(currentUserId, { preferredUpiApp: preferredApp.trim() });

    if (upiQrImageUri) {
      updateCurrentUserUpiQrImage(upiQrImageUri);
    }

    Alert.alert('Saved', 'Your payment details have been updated.');
  };

  const pickQrImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access to pick a QR image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      quality: 0.8
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setUpiQrImageUri(uri);
      updateCurrentUserUpiQrImage(uri);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Payment details</Text>

        <Text style={styles.label}>Your UPI ID</Text>
        <TextInput
          style={styles.input}
          value={upiId}
          onChangeText={setUpiId}
          placeholder="yourname@bank"
          autoCapitalize="none"
        />
        <Text style={styles.helper}>Others will see this when they settle with you.</Text>

        <Text style={styles.label}>Preferred UPI app (optional)</Text>
        <TextInput
          style={styles.input}
          value={preferredApp}
          onChangeText={setPreferredApp}
          placeholder="Google Pay, PhonePe, etc"
        />

        <View style={styles.qrRow}>
          <Pressable style={styles.outlineButton} onPress={pickQrImage}>
            <Text style={styles.outlineButtonText}>Select QR image</Text>
          </Pressable>
          {upiQrImageUri ? <Text style={styles.qrInfo}>QR selected</Text> : null}
        </View>

        {upiQrImageUri ? (
          <View style={styles.qrPreviewWrapper}>
            <Image source={{ uri: upiQrImageUri }} style={styles.qrPreview} />
            <Text style={styles.qrCaption}>Your UPI QR</Text>
          </View>
        ) : null}

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
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
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.l
  },
  label: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.s
  },
  helper: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.l
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.m,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.s,
    color: colors.textPrimary
  },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
    gap: spacing.s
  },
  outlineButton: {
    borderColor: colors.accent,
    borderWidth: 1,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: radius.m,
    backgroundColor: colors.card
  },
  outlineButtonText: {
    color: colors.accent,
    fontWeight: '700'
  },
  qrInfo: {
    color: colors.textSecondary,
    fontWeight: '600'
  },
  qrPreviewWrapper: {
    backgroundColor: colors.card,
    padding: spacing.m,
    borderRadius: radius.m,
    borderColor: colors.border,
    borderWidth: 1,
    marginBottom: spacing.l,
    alignItems: 'center'
  },
  qrPreview: {
    width: 150,
    height: 150,
    borderRadius: radius.m,
    marginBottom: spacing.s
  },
  qrCaption: {
    color: colors.textSecondary,
    fontSize: 12
  },
  saveButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.m,
    borderRadius: radius.m,
    alignItems: 'center'
  },
  saveButtonText: {
    color: colors.card,
    fontWeight: '700',
    fontSize: 16
  }
});
