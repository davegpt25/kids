import { ConflictChecker, DayOfWeek } from '../src/schedule/engine/conflict-checker';

describe('ConflictChecker', () => {
  const checker = new ConflictChecker({ walkingBufferMinutes: 10 });

  it('같은 요일에 시간이 겹치면 충돌로 판정한다', () => {
    const a = { dayOfWeek: 'mon' as DayOfWeek, startTime: '16:00', endTime: '18:00' };
    const b = { dayOfWeek: 'mon' as DayOfWeek, startTime: '17:00', endTime: '19:00' };
    expect(checker.isConflict(a, b)).toBe(true);
  });

  it('다른 요일이면 충돌이 아니다', () => {
    const a = { dayOfWeek: 'mon' as DayOfWeek, startTime: '16:00', endTime: '18:00' };
    const b = { dayOfWeek: 'tue' as DayOfWeek, startTime: '16:00', endTime: '18:00' };
    expect(checker.isConflict(a, b)).toBe(false);
  });

  it('이동 버퍼(10분)를 포함해 충돌을 판정한다', () => {
    // 18:00 종료 후 10분 버퍼 → 18:10 이전 시작은 충돌
    const a = { dayOfWeek: 'mon' as DayOfWeek, startTime: '16:00', endTime: '18:00' };
    const b = { dayOfWeek: 'mon' as DayOfWeek, startTime: '18:05', endTime: '20:00' };
    expect(checker.isConflict(a, b)).toBe(true);
  });

  it('버퍼 이후 시작은 충돌이 아니다', () => {
    const a = { dayOfWeek: 'mon' as DayOfWeek, startTime: '16:00', endTime: '18:00' };
    const b = { dayOfWeek: 'mon' as DayOfWeek, startTime: '18:10', endTime: '20:00' };
    expect(checker.isConflict(a, b)).toBe(false);
  });
});
