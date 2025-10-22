import { IsEmail, IsNotEmpty, } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class SendOtpDto {
  @IsNotEmpty()
  @ApiProperty({})
  @IsEmail()
  email: string;
}
