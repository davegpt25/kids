export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface TimeSlot {
  dayOfWeek: DayOfWeek;
  startTime: string; // 'HH:mm'
  endTime: string;
}

interface ConflictCheckerOptions {
  walkingBufferMinutes: number;
}

export class ConflictChecker {
  private readonly bufferMinutes: number;

  constructor({ walkingBufferMinutes }: ConflictCheckerOptions) {
    this.bufferMinutes = walkingBufferMinutes;
  }

  isConflict(a: TimeSlot, b: TimeSlot): boolean {
    if (a.dayOfWeek !== b.dayOfWeek) return false;

    const aStart = this.toMinutes(a.startTime);
    const aEnd = this.toMinutes(a.endTime) + this.bufferMinutes;
    const bStart = this.toMinutes(b.startTime);
    const bEnd = this.toMinutes(b.endTime) + this.bufferMinutes;

    return aStart < bEnd && bStart < aEnd;
  }

  private toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }
}
