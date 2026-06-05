import axios from 'axios';
import { KakaoDirectionsService } from './kakao-directions.service';

jest.mock('axios');

describe('KakaoDirectionsService', () => {
  let service: KakaoDirectionsService;

  beforeEach(() => {
    service = new KakaoDirectionsService();
  });

  describe('estimateWalkingMinutes', () => {
    it('300m → 4분 (300/80 = 3.75, 올림)', () => {
      expect(service.estimateWalkingMinutes(300)).toBe(4);
    });

    it('0m → 0분', () => {
      expect(service.estimateWalkingMinutes(0)).toBe(0);
    });

    it('80m → 1분', () => {
      expect(service.estimateWalkingMinutes(80)).toBe(1);
    });
  });

  describe('distanceMeters', () => {
    it('같은 좌표는 0m', () => {
      expect(service.distanceMeters(37.5, 127.0, 37.5, 127.0)).toBe(0);
    });

    it('약 1km 거리', () => {
      // 서울 역삼역 → 선릉역 직선 약 950m
      const d = service.distanceMeters(37.5006, 127.0368, 37.5044, 127.0491);
      expect(d).toBeGreaterThan(900);
      expect(d).toBeLessThan(1200);
    });
  });

  describe('fetchDrivingMinutes', () => {
    it('성공 시 초를 분으로 올림 변환한다', async () => {
      jest.spyOn(axios, 'get').mockResolvedValueOnce({
        data: { routes: [{ summary: { duration: 1234 } }] },
      });
      const result = await service.fetchDrivingMinutes(37.5, 127.0, 37.51, 127.01);
      expect(result).toBe(Math.ceil(1234 / 60)); // 21
    });

    it('API 실패 시 null을 반환한다', async () => {
      jest.spyOn(axios, 'get').mockRejectedValueOnce(new Error('Network error'));
      const result = await service.fetchDrivingMinutes(37.5, 127.0, 37.51, 127.01);
      expect(result).toBeNull();
    });

    it('routes가 빈 배열이면 null을 반환한다', async () => {
      jest.spyOn(axios, 'get').mockResolvedValueOnce({ data: { routes: [] } });
      const result = await service.fetchDrivingMinutes(37.5, 127.0, 37.51, 127.01);
      expect(result).toBeNull();
    });
  });

  describe('getTravelTime', () => {
    it('walkingMinutes와 drivingMinutes를 함께 반환한다', async () => {
      jest.spyOn(axios, 'get').mockResolvedValueOnce({
        data: { routes: [{ summary: { duration: 180 } }] },
      });
      const result = await service.getTravelTime(37.5, 127.0, 37.5006, 127.0368);
      expect(result.walkingMinutes).toBeGreaterThan(0);
      expect(result.drivingMinutes).toBe(3); // Math.ceil(180/60)
    });
  });
});
