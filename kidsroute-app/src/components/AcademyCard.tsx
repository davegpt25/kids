import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AcademyResult } from '../api/academy';

interface AcademyCardProps {
  academy: AcademyResult;
}

export function AcademyCard({ academy }: AcademyCardProps) {
  const fee = academy.monthlyFee
    ? `${Math.round(academy.monthlyFee / 10000)}만원/월`
    : '수강료 미정';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{academy.name}</Text>
        <Text style={styles.distance}>{Math.round(academy.distance_m)}m</Text>
      </View>
      <Text style={styles.address}>{academy.address}</Text>
      <View style={styles.row}>
        <Text style={styles.subject}>{academy.subjects.join(' · ')}</Text>
        <Text style={styles.fee}>{fee}</Text>
      </View>
      {academy.hasTimetable ? (
        <View style={styles.slots}>
          {academy.timeSlots.map((slot, i) => (
            <Text key={i} style={styles.slot}>
              {slot.dayOfWeek.toUpperCase()} {slot.startTime}~{slot.endTime}
            </Text>
          ))}
        </View>
      ) : (
        <Text style={styles.noTimetable}>시간표 정보 없음</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginVertical: 6, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: 16, fontWeight: '700', color: '#111' },
  distance: { fontSize: 13, color: '#888' },
  address: { fontSize: 13, color: '#666', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  subject: { fontSize: 13, color: '#4F8EF7', fontWeight: '600' },
  fee: { fontSize: 13, color: '#333' },
  slots: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  slot: { fontSize: 12, color: '#555', backgroundColor: '#F0F4FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  noTimetable: { fontSize: 12, color: '#AAA', marginTop: 8 },
});
