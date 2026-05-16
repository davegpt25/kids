import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchRecommendation, saveSchedule } from '../api/schedule';
import { useScheduleStore } from '../store/schedule.store';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri'];
const DAY_LABELS: Record<string, string> = {
  mon: '월',
  tue: '화',
  wed: '수',
  thu: '목',
  fri: '금',
};
const HOURS = Array.from({ length: 9 }, (_, i) => i + 13);

function timeToHour(time: string): number {
  const [h] = time.split(':').map(Number);
  return h;
}

export function CalendarScreen() {
  const { latitude, longitude, radiusMeters, subjectPriority, dismissalTime, childId } =
    useScheduleStore();

  const { data } = useQuery({
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

  const mutation = useMutation({
    mutationFn: saveSchedule,
    onSuccess: () => Alert.alert('저장 완료', '스케줄이 저장되었습니다.'),
    onError: () => Alert.alert('오류', '저장에 실패했습니다.'),
  });

  const academies = data?.combination ?? [];

  const handleSave = () => {
    if (!childId) {
      Alert.alert('아이 정보 필요', '저장하려면 아이 프로필을 먼저 설정해 주세요.');
      return;
    }
    mutation.mutate({
      childId,
      academyIds: academies.map((a) => a.id),
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>주간 캘린더</Text>
      <ScrollView horizontal>
        <View>
          <View style={styles.headerRow}>
            <View style={styles.timeCol} />
            {DAYS.map((d) => (
              <View key={d} style={styles.dayCol}>
                <Text style={styles.dayLabel}>{DAY_LABELS[d]}</Text>
              </View>
            ))}
          </View>
          <ScrollView>
            {HOURS.map((h) => (
              <View key={h} style={styles.hourRow}>
                <Text style={styles.hourLabel}>{h}:00</Text>
                {DAYS.map((d) => {
                  const slot = academies
                    .flatMap((a) =>
                      a.timeSlots
                        .filter((s) => s.dayOfWeek === d)
                        .map((s) => ({ ...s, name: a.name })),
                    )
                    .find((s) => timeToHour(s.startTime) === h);
                  return (
                    <View key={d} style={styles.cell}>
                      {slot && (
                        <View style={styles.block}>
                          <Text style={styles.blockText} numberOfLines={2}>
                            {slot.name}
                          </Text>
                          <Text style={styles.blockTime}>
                            {slot.startTime}~{slot.endTime}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnLabel}>이 스케줄 저장</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  title: { fontSize: 20, fontWeight: '700', padding: 20, paddingTop: 48, color: '#111' },
  headerRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#EEE' },
  timeCol: { width: 48 },
  dayCol: { width: 72, alignItems: 'center', paddingVertical: 8 },
  dayLabel: { fontSize: 14, fontWeight: '600', color: '#444' },
  hourRow: { flexDirection: 'row', height: 60, borderBottomWidth: 1, borderColor: '#F0F0F0' },
  hourLabel: { width: 48, fontSize: 11, color: '#AAA', textAlign: 'center', paddingTop: 4 },
  cell: { width: 72, borderLeftWidth: 1, borderColor: '#F0F0F0', padding: 2 },
  block: { flex: 1, backgroundColor: '#4F8EF7', borderRadius: 4, padding: 4 },
  blockText: { fontSize: 10, color: '#FFF', fontWeight: '600' },
  blockTime: { fontSize: 9, color: '#DDF' },
  saveBtn: { margin: 16, backgroundColor: '#111', padding: 16, borderRadius: 12, alignItems: 'center' },
  saveBtnLabel: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});
