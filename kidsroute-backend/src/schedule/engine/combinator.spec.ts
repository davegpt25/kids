import { Combinator, AcademyWithSlots } from './combinator';
import { ConflictChecker, DayOfWeek } from './conflict-checker';

const makeAcademy = (
  id: string,
  subject: string,
  dayOfWeek: string,
  start: string,
  end: string,
  lat = 37.5,
  lng = 127.0,
): AcademyWithSlots => ({
  id,
  name: `학원-${id}`,
  subjects: [subject],
  latitude: lat,
  longitude: lng,
  address: '',
  monthlyFee: 300000,
  phone: null,
  hasTimetable: true,
  distance_m: 500,
  timeSlots: [{ dayOfWeek: dayOfWeek as DayOfWeek, startTime: start, endTime: end }],
});

describe('Combinator.buildTopCombinations', () => {
  const checker = new ConflictChecker({ walkingBufferMinutes: 5 });
  const combinator = new Combinator(checker);

  it('과목이 다른 두 학원은 조합에 포함된다', () => {
    const academies = [
      makeAcademy('m1', '수학', 'mon', '16:00', '18:00'),
      makeAcademy('k1', '국어', 'tue', '16:00', '18:00'),
    ];
    const results = combinator.buildTopCombinations(academies, ['수학', '국어'], 3);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveLength(2);
  });

  it('최대 N개 조합만 반환한다', () => {
    const academies = [
      makeAcademy('m1', '수학', 'mon', '16:00', '18:00'),
      makeAcademy('m2', '수학', 'wed', '16:00', '18:00'),
      makeAcademy('k1', '국어', 'tue', '16:00', '18:00'),
      makeAcademy('k2', '국어', 'thu', '16:00', '18:00'),
    ];
    const results = combinator.buildTopCombinations(academies, ['수학', '국어'], 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it('시간이 겹치는 조합은 제외된다', () => {
    const academies = [
      makeAcademy('m1', '수학', 'mon', '16:00', '18:00'),
      makeAcademy('k1', '국어', 'mon', '16:00', '18:00'), // 월요일 겹침
    ];
    const results = combinator.buildTopCombinations(academies, ['수학', '국어'], 3);
    expect(results.length).toBe(0);
  });

  it('요청한 과목 중 학원이 없는 과목은 무시하고 조합한다', () => {
    const academies = [
      makeAcademy('m1', '수학', 'mon', '16:00', '18:00'),
      makeAcademy('k1', '국어', 'tue', '16:00', '18:00'),
    ];
    // 영어 학원은 없지만 수학+국어 조합은 나와야 함
    const results = combinator.buildTopCombinations(academies, ['수학', '국어', '영어'], 3);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveLength(2);
  });

  it('과목당 여러 학원이 있을 때 조합 수가 maxCount를 초과하지 않는다', () => {
    const academies = [
      makeAcademy('m1', '수학', 'mon', '16:00', '18:00'),
      makeAcademy('m2', '수학', 'tue', '16:00', '18:00'),
      makeAcademy('m3', '수학', 'wed', '16:00', '18:00'),
      makeAcademy('k1', '국어', 'thu', '16:00', '18:00'),
      makeAcademy('k2', '국어', 'fri', '16:00', '18:00'),
    ];
    // 3수학 × 2국어 = 6 가능한 조합, maxCount=3이므로 3개만
    const results = combinator.buildTopCombinations(academies, ['수학', '국어'], 3);
    expect(results.length).toBe(3);
  });
});
