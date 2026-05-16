import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useScheduleStore } from '../store/schedule.store';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const RADIUS_OPTIONS = [
  { label: '500m', value: 500 },
  { label: '1km', value: 1000 },
  { label: '2km', value: 2000 },
];

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { setLocation, radiusMeters, setRadius } = useScheduleStore();
  const [locationLabel, setLocationLabel] = useState('위치 감지 중...');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('위치 권한 필요', '설정에서 위치 권한을 허용해 주세요.');
        setLocationLabel('위치 권한 없음');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords.latitude, loc.coords.longitude);
      setLocationLabel(
        `위도 ${loc.coords.latitude.toFixed(4)}, 경도 ${loc.coords.longitude.toFixed(4)}`,
      );
    })();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>내 위치</Text>
      <Text style={styles.location}>{locationLabel}</Text>

      <Text style={styles.sectionTitle}>탐색 반경</Text>
      <View style={styles.radRow}>
        {RADIUS_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.radBtn, radiusMeters === opt.value && styles.radBtnSelected]}
            onPress={() => setRadius(opt.value)}
          >
            <Text style={[styles.radLabel, radiusMeters === opt.value && styles.radLabelSelected]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.nextBtn} onPress={() => navigation.navigate('Subject')}>
        <Text style={styles.nextLabel}>과목 선택하기 →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginTop: 40, color: '#111' },
  location: { fontSize: 14, color: '#666', marginTop: 8, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  radRow: { flexDirection: 'row', gap: 10, marginBottom: 32 },
  radBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  radBtnSelected: { backgroundColor: '#4F8EF7', borderColor: '#4F8EF7' },
  radLabel: { fontSize: 14, color: '#333' },
  radLabelSelected: { color: '#FFF', fontWeight: '600' },
  nextBtn: { backgroundColor: '#4F8EF7', padding: 16, borderRadius: 12, alignItems: 'center' },
  nextLabel: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
