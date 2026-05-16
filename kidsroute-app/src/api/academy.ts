import { apiClient } from './client';

export interface AcademyResult {
  id: string;
  name: string;
  address: string;
  subjects: string[];
  monthlyFee: number | null;
  phone: string | null;
  hasTimetable: boolean;
  distance_m: number;
  timeSlots: { dayOfWeek: string; startTime: string; endTime: string }[];
}

export async function fetchNearbyAcademies(params: {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  subjects: string[];
}): Promise<AcademyResult[]> {
  const { data } = await apiClient.get('/academies/nearby', { params });
  return data;
}
