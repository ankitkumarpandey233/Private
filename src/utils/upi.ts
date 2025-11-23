import { Alert, Linking } from 'react-native';

export async function payWithUpi(upiId: string, amount: number, note: string): Promise<void> {
  const params = new URLSearchParams({
    pa: upiId,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: note
  });

  const url = `upi://pay?${params.toString()}`;

  // First check if a UPI app can handle this
  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    console.warn('No UPI app available, still trying to open the URL:', url);
  }

  try {
    await Linking.openURL(url);
  } catch (error) {
    console.error('Failed to open UPI app', error);
    Alert.alert('UPI Error', 'Could not open a UPI app on this device.');
  }
}
