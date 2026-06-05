import { Combinator, AcademyWithSlots } from '../src/schedule/engine/combinator';
import { ConflictChecker } from '../src/schedule/engine/conflict-checker';

const checker = new ConflictChecker({ walkingBufferMinutes: 10 });
const combinator = new Combinator(checker);

const mathAcademy: AcademyWithSlots = {
  id: 'a1',
  name: '강남수학',
  subjects: ['수학'],
  latitude: 37.5,
  longitude: 127.0,
  address: '',
  monthlyFee: 300000,
  phone: null,
  hasTimetable: true,
  distance_m: 500,
  timeSlots: [{ dayOfWeek: 'mon' as const, startTime: '16:00', endTime: '18:00' }],
};

const englishAcademy: AcademyWithSlots = {
  id: 'a2',
  name: '영어나라',
  subjects: ['영어'],
  latitude: 37.5,
  longitude: 127.0,
  address: '',
  monthlyFee: 300000,
  phone: null,
  hasTimetable: true,
  distance_m: 500,
  timeSlots: [{ dayOfWeek: 'mon' as const, startTime: '18:30', endTime: '20:00' }],
};

const conflictingAcademy: AcademyWithSlots = {
  id: 'a3',
  name: '충돌수학',
  subjects: ['수학'],
  latitude: 37.5,
  longitude: 127.0,
  address: '',
  monthlyFee: 300000,
  phone: null,
  hasTimetable: true,
  distance_m: 500,
  timeSlots: [{ dayOfWeek: 'mon' as const, startTime: '17:00', endTime: '19:00' }],
};

describe('Combinator', () => {
  it('충돌 없는 학원들을 조합으로 반환한다', () => {
    const result = combinator.buildCombination(
      [mathAcademy, englishAcademy],
      ['수학', '영어'],
    );
    expect(result.map((a) => a.id)).toEqual(['a1', 'a2']);
  });

  it('충돌하는 학원은 조합에서 제외한다', () => {
    const result = combinator.buildCombination(
      [mathAcademy, conflictingAcademy, englishAcademy],
      ['수학', '영어'],
    );
    const ids = result.map((a) => a.id);
    expect(ids).toContain('a1');
    expect(ids).not.toContain('a3');
    expect(ids).toContain('a2');
  });

  it('과목 우선순위 순서대로 선택한다', () => {
    const result = combinator.buildCombination(
      [englishAcademy, mathAcademy],
      ['수학', '영어'], // 수학 우선
    );
    expect(result[0].id).toBe('a1');
  });
});
