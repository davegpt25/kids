import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SubjectTag } from '../components/SubjectTag';
import { useScheduleStore } from '../store/schedule.store';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Subject'>;

const ALL_SUBJECTS = ['수학', '영어', '국어', '과학', '미술', '음악', '체육', '코딩', '한자'];

export function SubjectScreen() {
  const navigation = useNavigation<Nav>();
  const { subjectPriority, setSubjectPriority } = useScheduleStore();

  const toggle = (subject: string) => {
    if (subjectPriority.includes(subject)) {
      setSubjectPriority(subjectPriority.filter((s) => s !== subject));
    } else {
      setSubjectPriority([...subjectPriority, subject]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>어떤 과목을 원하세요?</Text>
      <Text style={styles.subtitle}>선택 순서가 우선순위가 됩니다</Text>
      <View style={styles.tags}>
        {ALL_SUBJECTS.map((s) => (
          <SubjectTag
            key={s}
            label={s}
            selected={subjectPriority.includes(s)}
            onPress={() => toggle(s)}
          />
        ))}
      </View>
      {subjectPriority.length > 0 && (
        <View style={styles.priorityBox}>
          <Text style={styles.priorityTitle}>선택된 우선순위</Text>
          {subjectPriority.map((s, i) => (
            <Text key={s} style={styles.priorityItem}>
              {i + 1}. {s}
            </Text>
          ))}
        </View>
      )}
      <TouchableOpacity
        style={[styles.nextBtn, subjectPriority.length === 0 && styles.disabled]}
        disabled={subjectPriority.length === 0}
        onPress={() => navigation.navigate('Recommend')}
      >
        <Text style={styles.nextLabel}>추천 받기 →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginTop: 40, color: '#111' },
  subtitle: { fontSize: 14, color: '#888', marginTop: 6, marginBottom: 24 },
  tags: { flexDirection: 'row', flexWrap: 'wrap' },
  priorityBox: { marginTop: 20, padding: 16, backgroundColor: '#EEF4FF', borderRadius: 10 },
  priorityTitle: { fontSize: 14, fontWeight: '600', color: '#4F8EF7', marginBottom: 8 },
  priorityItem: { fontSize: 14, color: '#333', marginBottom: 4 },
  nextBtn: { marginTop: 24, backgroundColor: '#4F8EF7', padding: 16, borderRadius: 12, alignItems: 'center' },
  disabled: { backgroundColor: '#CCC' },
  nextLabel: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
