import { Linking } from 'react-native';

export async function payWithUpi(upiId: string, amount: number, note: string): Promise<void> {
  const upiUrl =
    'upi://pay' +
    `?pa=${encodeURIComponent(upiId)}` +
    `&am=${encodeURIComponent(amount.toString())}` +
    `&cu=INR` +
    `&tn=${encodeURIComponent(note)}`;

  const canOpen = await Linking.canOpenURL(upiUrl);
  if (!canOpen) {
    console.warn('No app can handle UPI URL, still trying openURL:', upiUrl);
  }

  try {
    await Linking.openURL(upiUrl);
  } catch (error) {
    console.warn('Failed to open UPI URL', error);
  }
}
