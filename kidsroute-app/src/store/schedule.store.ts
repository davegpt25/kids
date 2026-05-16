import { create } from 'zustand';

interface ScheduleState {
  latitude: number | null;
  longitude: number | null;
  radiusMeters: number;
  subjectPriority: string[];
  dismissalTime: string;
  childId: string | null;
  setLocation: (lat: number, lng: number) => void;
  setRadius: (r: number) => void;
  setSubjectPriority: (subjects: string[]) => void;
  setDismissalTime: (time: string) => void;
  setChildId: (id: string) => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  latitude: null,
  longitude: null,
  radiusMeters: 1000,
  subjectPriority: [],
  dismissalTime: '14:30',
  childId: null,
  setLocation: (lat, lng) => set({ latitude: lat, longitude: lng }),
  setRadius: (r) => set({ radiusMeters: r }),
  setSubjectPriority: (subjects) => set({ subjectPriority: subjects }),
  setDismissalTime: (time) => set({ dismissalTime: time }),
  setChildId: (id) => set({ childId: id }),
}));
