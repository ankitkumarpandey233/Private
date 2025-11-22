import React, { useMemo } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useData } from '../context/DataContext';
import { GroupCard } from '../components/GroupCard';
import { buildBalanceDisplay, calculateGroupDebts } from '../utils/balance';
import { colors, spacing } from '../theme';

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Tabs'>;

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { groups, users, expenses, settlements, currentUserId } = useData();

  const summaries = useMemo(() => {
    return groups.map((group) => {
      const debts = calculateGroupDebts(group, expenses, settlements);
      const balances = buildBalanceDisplay(currentUserId, debts, users);
      const oweTotal = balances
        .filter((balance) => balance.direction === 'owe')
        .reduce((sum, balance) => sum + balance.amount, 0);
      const owedTotal = balances
        .filter((balance) => balance.direction === 'owed')
        .reduce((sum, balance) => sum + balance.amount, 0);
      let summary = 'All settled';
      if (oweTotal > owedTotal) {
        summary = `You owe ₹${(oweTotal - owedTotal).toFixed(0)}`;
      } else if (owedTotal > oweTotal) {
        summary = `You are owed ₹${(owedTotal - oweTotal).toFixed(0)}`;
      }

      return { groupId: group.id, summary };
    });
  }, [groups, users, expenses, settlements, currentUserId]);

  const getSummary = (groupId: string) => summaries.find((s) => s.groupId === groupId)?.summary ?? '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.heading}>Groups</Text>
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GroupCard
              name={item.name}
              summary={getSummary(item.id)}
              onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
            />
          )}
          ListEmptyComponent={<Text>No groups yet.</Text>}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
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
    paddingHorizontal: spacing.m,
    paddingTop: spacing.l
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.m,
    color: colors.textPrimary
  }
});
