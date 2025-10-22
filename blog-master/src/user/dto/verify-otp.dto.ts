import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class VerifyOtpDto {
   @ApiProperty({  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
 @ApiProperty({  })
  @IsNotEmpty()
  otp: string;
}
