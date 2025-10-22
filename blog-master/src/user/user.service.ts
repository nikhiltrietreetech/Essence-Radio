import { Injectable, BadRequestException } from '@nestjs/common';

import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  async sendOtp(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.user.upsert({
      where: { email },
      update: { otp, otpExpiry: expiry },
      create: { email, fullname: '', mobile: '', otp, otpExpiry: expiry },
    });

    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp}`,
    });

    return { message: 'OTP sent to email' };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('User not found');
    if (user.otp !== otp) throw new BadRequestException('Invalid OTP');
   if (!user.otpExpiry || user.otpExpiry < new Date()) {
  throw new BadRequestException('OTP expired');
}

    await this.prisma.user.update({ where: { email }, data: { otp: null, otpExpiry: null } });
    return { message: 'OTP verified' };
  }

  async register(data: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    await this.prisma.user.update({
      where: { email: data.email },
      data: { fullname: data.fullname, mobile: data.mobile, password: hashedPassword },
    });
    return { message: 'User registered successfully' };
  }

  async loginPassword(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) throw new BadRequestException('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new BadRequestException('Invalid credentials');

    const token = this.jwtService.sign({ userId: user.id, email: user.email });
    return { message: 'Login successful', token };
  }

  async loginOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.otp !== otp) throw new BadRequestException('Invalid OTP');
   if (!user.otpExpiry || user.otpExpiry < new Date()) {
  throw new BadRequestException('OTP expired');
}

    const token = this.jwtService.sign({ userId: user.id, email: user.email });
    await this.prisma.user.update({ where: { email }, data: { otp: null, otpExpiry: null } });

    return { message: 'Login successful', token };
  }
}
