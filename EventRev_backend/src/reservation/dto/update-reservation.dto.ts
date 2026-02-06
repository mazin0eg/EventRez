import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReservationStatus } from '../entities/reservation.entity';

export class UpdateReservationDto {
  @ApiPropertyOptional({
    description: 'Updated number of tickets',
    example: 3,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Min(1)
  numberOfTickets?: number;

  @ApiPropertyOptional({
    description: 'Updated notes or special requests',
    example: 'Changed to VIP seating request',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Reservation status',
    enum: ReservationStatus,
    example: ReservationStatus.Confirmed,
  })
  @IsEnum(ReservationStatus)
  @IsOptional()
  status?: ReservationStatus;
}
