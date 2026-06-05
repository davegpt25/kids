import { IsArray, ValidateNested, IsString, IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class NotificationSettingDto {
  @IsString()
  academyId: string;

  @IsBoolean()
  enabled: boolean;

  @IsOptional()
  @IsNumber()
  minutesBefore?: number;
}

export class PushSettingsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NotificationSettingDto)
  notifications: NotificationSettingDto[];
}
