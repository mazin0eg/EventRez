import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secret123', description: 'Password (min 6 characters)', minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
