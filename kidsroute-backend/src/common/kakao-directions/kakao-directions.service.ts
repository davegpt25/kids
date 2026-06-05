import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface TravelTime {
  walkingMinutes: number;
  drivingMinutes: number | null; // null = API 실패 시
}

@Injectable()
export class KakaoDirectionsService {
  private readonly logger = new Logger(KakaoDirectionsService.name);
  private readonly REST_KEY = process.env.KAKAO_REST_API_KEY ?? '';
  private readonly WALK_SPEED_MPM = 80;

  constructor() {
    if (!this.REST_KEY) {
      this.logger.error('KAKAO_REST_API_KEY is not set — driving times will always return null');
    }
  }

  distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  estimateWalkingMinutes(distanceM: number): number {
    if (distanceM === 0) return 0;
    return Math.ceil(distanceM / this.WALK_SPEED_MPM);
  }

  async fetchDrivingMinutes(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
  ): Promise<number | null> {
    try {
      const { data } = await axios.get(
        'https://apis-navi.kakaomobility.com/v1/directions',
        {
          params: {
            origin: `${originLng},${originLat}`,
            destination: `${destLng},${destLat}`,
            priority: 'RECOMMEND',
          },
          headers: { Authorization: `KakaoAK ${this.REST_KEY}` },
          timeout: 3000,
        },
      );
      const durationSec: number = data?.routes?.[0]?.summary?.duration;
      return durationSec != null ? Math.ceil(durationSec / 60) : null;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status && err.response.status < 500) {
        this.logger.error(`Kakao API client error ${err.response.status}: check API key and params`);
      } else {
        this.logger.warn(`Kakao Directions API 실패: ${(err as Error).message}`);
      }
      return null;
    }
  }

  async getTravelTime(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
  ): Promise<TravelTime> {
    const distM = this.distanceMeters(fromLat, fromLng, toLat, toLng);
    const [walkingMinutes, drivingMinutes] = await Promise.all([
      Promise.resolve(this.estimateWalkingMinutes(distM)),
      this.fetchDrivingMinutes(fromLat, fromLng, toLat, toLng),
    ]);
    return { walkingMinutes, drivingMinutes };
  }
}
