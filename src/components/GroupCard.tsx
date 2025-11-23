import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';

interface GroupCardProps {
  name: string;
  summary: string;
  onPress: () => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({ name, summary, onPress }) => {
  const lowerSummary = summary.toLowerCase();
  const isOwe = lowerSummary.startsWith('you owe');
  const isOwed = lowerSummary.includes('are owed');

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      android_ripple={{ color: 'rgba(28, 194, 159, 0.1)' }}
      accessibilityRole="button"
    >
      <View>
        <Text style={styles.name}>{name}</Text>
        <Text
          style={[
            styles.summary,
            isOwe ? styles.oweText : isOwed ? styles.owedText : undefined
          ]}
        >
          {summary || 'All settled'}
        </Text>
      </View>

      <Feather name="chevron-right" size={20} color={colors.textSecondary} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    padding: spacing.m,
    borderRadius: radius.m,
    marginHorizontal: spacing.m,
    marginVertical: spacing.s,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardPressed: {
    transform: [{ translateY: 1 }]
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    color: colors.textPrimary
  },
  summary: {
    color: colors.textSecondary,
    fontSize: 14
  },
  oweText: {
    color: colors.danger
  },
  owedText: {
    color: colors.positive
  }
});

