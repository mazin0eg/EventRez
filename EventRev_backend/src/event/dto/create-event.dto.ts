import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  IsInt,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    description: 'Title of the event',
    example: 'Annual Tech Conference 2026',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the event',
    example:
      'Join us for the biggest tech conference of the year featuring keynotes, workshops, and networking opportunities.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Start date and time of the event (ISO 8601 format)',
    example: '2026-03-15T09:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiPropertyOptional({
    description: 'End date and time of the event (ISO 8601 format)',
    example: '2026-03-15T18:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Location where the event will be held',
    example: 'Convention Center, 123 Main Street, Paris',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({
    description: 'ID of the user organizing the event',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  organizerId?: number;

  @ApiPropertyOptional({
    description: 'ID of the category for this event',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of attendees for the event',
    example: 100,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({
    description: 'Whether the event is published and visible to users',
    example: false,
  })
  @IsOptional()
  isPublished?: boolean;
}
