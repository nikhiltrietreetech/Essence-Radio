import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { LoginOtpDto } from './dto/login-otp.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 🔹 Send OTP
  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP to user email' })
  sendOtp(@Body() body: SendOtpDto) {
    return this.userService.sendOtp(body.email);
  }

  // 🔹 Verify OTP
  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP sent to email' })
  verifyOtp(@Body() body: VerifyOtpDto) {
    return this.userService.verifyOtp(body.email, body.otp);
  }

  // 🔹 Register User
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() body: CreateUserDto) {
    return this.userService.register(body);
  }

  // 🔹 Login using password
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  login(@Body() body: LoginDto) {
    return this.userService.loginPassword(body.email, body.password);
  }

  // 🔹 Login using OTP
  @Post('login-otp')
  @ApiOperation({ summary: 'Login using OTP' })
  loginOtp(@Body() body: LoginOtpDto) {
    return this.userService.loginOtp(body.email, body.otp);
  }
  @Post('logout/:id')
  @ApiOperation({ summary: 'Logout user and invalidate token' })
  @ApiParam({ name: 'id', type: Number })
  logout(@Param('id', ParseIntPipe) id: number) {
    return this.userService.logout(id);
  }
  // ✅ CRUD Operations Below

  // 🔹 Get all users
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  findAll() {
    return this.userService.findAll();
  }

  // 🔹 Get single user by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  // 🔹 Update user by ID
  @Put(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', type: Number })
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateUserDto) {
    return this.userService.update(id, body);
  }

  // 🔹 Delete user by ID
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
