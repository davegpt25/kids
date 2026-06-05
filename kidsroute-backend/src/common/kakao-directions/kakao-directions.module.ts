import { Module } from '@nestjs/common';
import { KakaoDirectionsService } from './kakao-directions.service';

@Module({
  providers: [KakaoDirectionsService],
  exports: [KakaoDirectionsService],
})
export class KakaoDirectionsModule {}
