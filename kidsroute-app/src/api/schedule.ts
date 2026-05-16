import { apiClient } from './client';
import { AcademyResult } from './academy';

export interface RecommendResult {
  combination: AcademyResult[];
  totalCount: number;
  combinationCount: number;
}

export async function fetchRecommendation(params: {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  subjectPriority: string[];
  dismissalTime: string;
}): Promise<RecommendResult> {
  const { data } = await apiClient.get('/schedules/recommend', { params });
  return data;
}

export async function saveSchedule(body: {
  childId: string;
  academyIds: string[];
}) {
  const { data } = await apiClient.post('/schedules', body);
  return data;
}
