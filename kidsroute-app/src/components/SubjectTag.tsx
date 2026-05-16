import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface SubjectTagProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function SubjectTag({ label, selected, onPress }: SubjectTagProps) {
  return (
    <TouchableOpacity
      testID="subject-tag"
      style={[styles.tag, selected && styles.selected]}
      onPress={onPress}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#F5F5F5',
    margin: 4,
  },
  selected: {
    backgroundColor: '#4F8EF7',
    borderColor: '#4F8EF7',
  },
  label: { fontSize: 14, color: '#333' },
  selectedLabel: { color: '#FFF', fontWeight: '600' },
});
