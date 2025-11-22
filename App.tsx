import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { DataProvider } from './src/context/DataContext';

export default function App() {
  return (
    <DataProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </DataProvider>
  );
}
