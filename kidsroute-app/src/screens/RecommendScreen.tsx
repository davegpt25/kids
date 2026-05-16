import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchRecommendation } from '../api/schedule';
import { AcademyCard } from '../components/AcademyCard';
import { useScheduleStore } from '../store/schedule.store';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Recommend'>;

export function RecommendScreen() {
  const navigation = useNavigation<Nav>();
  const { latitude, longitude, radiusMeters, subjectPriority, dismissalTime } =
    useScheduleStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['recommend', latitude, longitude, radiusMeters, subjectPriority],
    queryFn: () =>
      fetchRecommendation({
        latitude: latitude!,
        longitude: longitude!,
        radiusMeters,
        subjectPriority,
        dismissalTime,
      }),
    enabled: !!latitude && !!longitude,
  });

  if (isLoading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#4F8EF7" />;
  }

  if (isError || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>추천 정보를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>추천 학원 조합</Text>
      <Text style={styles.sub}>
        {data.combinationCount}개 충돌 없는 조합 · 반경 내 {data.totalCount}개 학원
      </Text>
      <FlatList
        data={data.combination}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AcademyCard academy={item} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      <TouchableOpacity style={styles.saveBtn} onPress={() => navigation.navigate('Calendar')}>
        <Text style={styles.saveBtnLabel}>캘린더로 확인 →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginTop: 40, color: '#111' },
  sub: { fontSize: 13, color: '#888', marginTop: 6, marginBottom: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#E55', fontSize: 15 },
  saveBtn: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: '#4F8EF7',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnLabel: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
