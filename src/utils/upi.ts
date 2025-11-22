import { Alert, Linking } from 'react-native';

export const payWithUpi = async (upiId: string, amount: number, note: string) => {
  const params = new URLSearchParams({
    pa: upiId,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: note
  });

  const url = `upi://pay?${params.toString()}`;

  try {
    await Linking.openURL(url);
  } catch (error) {
    console.error('Failed to open UPI app', error);
    Alert.alert('UPI Error', 'Could not open a UPI app on this device.');
  }
};
