import { ConflictChecker, TimeSlot } from './conflict-checker';

export interface AcademyWithSlots {
  id: string;
  name: string;
  subjects: string[];
  timeSlots: TimeSlot[];
  latitude: number;
  longitude: number;
  address: string;
  monthlyFee: number;
  phone: string | null;
  hasTimetable: boolean;
  distance_m: number;
}

export class Combinator {
  constructor(private readonly checker: ConflictChecker) {}

  buildCombination(
    academies: AcademyWithSlots[],
    subjectPriority: string[],
  ): AcademyWithSlots[] {
    const sorted = [...academies].sort((a, b) => {
      const ai = this.priorityIndex(a.subjects, subjectPriority);
      const bi = this.priorityIndex(b.subjects, subjectPriority);
      return ai - bi;
    });

    const selected: AcademyWithSlots[] = [];

    for (const candidate of sorted) {
      if (this.hasConflictWithSelected(candidate, selected)) continue;
      selected.push(candidate);
    }

    return selected;
  }

  private priorityIndex(subjects: string[], priority: string[]): number {
    for (let i = 0; i < priority.length; i++) {
      if (subjects.includes(priority[i])) return i;
    }
    return priority.length;
  }

  buildTopCombinations(
    academies: AcademyWithSlots[],
    subjectPriority: string[],
    maxCount: number,
  ): AcademyWithSlots[][] {
    const results: AcademyWithSlots[][] = [];

    const bySubject = new Map<string, AcademyWithSlots[]>();
    for (const subject of subjectPriority) {
      bySubject.set(
        subject,
        academies.filter((a) => a.subjects.includes(subject)),
      );
    }

    const subjects = subjectPriority.filter((s) => (bySubject.get(s)?.length ?? 0) > 0);
    if (subjects.length === 0) return results;

    const recurse = (idx: number, current: AcademyWithSlots[]) => {
      if (results.length >= maxCount) return;
      if (idx === subjects.length) {
        results.push([...current]);
        return;
      }
      for (const academy of bySubject.get(subjects[idx]) ?? []) {
        if (!this.hasConflictWithSelected(academy, current)) {
          current.push(academy);
          recurse(idx + 1, current);
          current.pop();
        }
      }
    };

    recurse(0, []);
    return results;
  }

  private hasConflictWithSelected(
    candidate: AcademyWithSlots,
    selected: AcademyWithSlots[],
  ): boolean {
    for (const picked of selected) {
      for (const cs of candidate.timeSlots) {
        for (const ps of picked.timeSlots) {
          if (this.checker.isConflict(cs, ps)) return true;
        }
      }
    }
    return false;
  }
}
