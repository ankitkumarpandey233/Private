import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { GroupDetailScreen } from '../screens/GroupDetailScreen';
import { SettleUpScreen } from '../screens/SettleUpScreen';
import { UserSettingsScreen } from '../screens/UserSettingsScreen';
import { AddExpenseScreen } from '../screens/AddExpenseScreen';

export type RootStackParamList = {
  Tabs: undefined;
  GroupDetail: { groupId: string };
  AddExpense: { groupId: string; expenseId?: string };
  SettleUp: { groupId: string; payerId?: string; receiverId?: string; amount?: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Settings" component={UserSettingsScreen} />
  </Tab.Navigator>
);

export const RootNavigator = () => {
  return (
    <NavigationContainer theme={DefaultTheme}>
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="GroupDetail" component={GroupDetailScreen} options={{ title: 'Group' }} />
        <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ title: 'Add expense' }} />
        <Stack.Screen name="SettleUp" component={SettleUpScreen} options={{ presentation: 'modal', title: 'Settle up' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
