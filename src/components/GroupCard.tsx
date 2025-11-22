import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface GroupCardProps {
  name: string;
  summary: string;
  onPress: () => void;
}

const ACCENT = '#1cc29f';

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
        <Text style={[styles.summary, isOwe ? styles.oweText : isOwed ? styles.owedText : undefined]}>
          {summary || 'All settled'}
        </Text>
      </View>
      <View style={styles.chevron}>
        <Text style={{ color: '#aaa', fontSize: 18 }}>{'›'}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
    color: '#222'
  },
  summary: {
    color: '#555',
    fontSize: 14
  },
  oweText: {
    color: '#d9534f'
  },
  owedText: {
    color: ACCENT
  },
  chevron: {
    marginLeft: 8
  }
});
