import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { LoginOtpDto } from './dto/login-otp.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('send-otp')
  sendOtp(@Body() body: SendOtpDto) {
    return this.userService.sendOtp(body.email);
  }

  @Post('verify-otp')
  verifyOtp(@Body() body: VerifyOtpDto) {
    return this.userService.verifyOtp(body.email, body.otp);
  }

  @Post('register')
  register(@Body() body: CreateUserDto) {
    return this.userService.register(body);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.userService.loginPassword(body.email, body.password);
  }

  @Post('login-otp')
  loginOtp(@Body() body: LoginOtpDto) {
    return this.userService.loginOtp(body.email, body.otp);
  }
}
