import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class LoginOtpDto {
    @ApiProperty({ })
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @ApiProperty({  })
  @IsNotEmpty()
  otp: string;
}
