import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({
    description: 'ID of the event to reserve',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  eventId: number;

  @ApiPropertyOptional({
    description: 'Number of tickets to reserve',
    example: 2,
    default: 1,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Min(1)
  numberOfTickets?: number = 1;

  @ApiPropertyOptional({
    description: 'Additional notes or special requests for the reservation',
    example: 'I need wheelchair accessibility',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
