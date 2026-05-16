import { ConflictChecker, TimeSlot } from './conflict-checker';

export interface AcademyWithSlots {
  id: string;
  name: string;
  subjects: string[];
  timeSlots: TimeSlot[];
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
