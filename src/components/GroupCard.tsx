import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface GroupCardProps {
  name: string;
  summary: string;
  onPress: () => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({ name, summary, onPress }) => {
  return (
    <Pressable style={styles.card} onPress={onPress} accessibilityRole="button">
      <View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.summary}>{summary}</Text>
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
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  summary: {
    color: '#555'
  }
});
