import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  // 📧 Nodemailer transporter setup
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 🔹 Send OTP
  async sendOtp(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

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

    return { message: 'OTP sent to email successfully' };
  }

  // 🔹 Verify OTP
  async verifyOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('User not found');
    if (user.otp !== otp) throw new BadRequestException('Invalid OTP');
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    await this.prisma.user.update({
      where: { email },
      data: { otp: null, otpExpiry: null },
    });

    return { message: 'OTP verified successfully' };
  }

  // 🔹 Register User
  async register(data: CreateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new BadRequestException('Email not verified. Please request OTP first.');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    await this.prisma.user.update({
      where: { email: data.email },
      data: {
        fullname: data.fullname,
        mobile: data.mobile,
        password: hashedPassword,
      },
    });

    return { message: 'User registered successfully' };
  }

  // 🔹 Login using Email & Password
  async loginPassword(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) throw new BadRequestException('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new BadRequestException('Invalid credentials');

    const token = this.jwtService.sign({ userId: user.id, email: user.email });

    // Save token in DB (for session tracking)
    await this.prisma.user.update({
      where: { id: user.id },
      data: { currentToken: token },
    });

    return { message: 'Login successful', token, user };
  }

  // 🔹 Login using OTP
  async loginOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('User not found');
    if (user.otp !== otp) throw new BadRequestException('Invalid OTP');
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    const token = this.jwtService.sign({ userId: user.id, email: user.email });
    await this.prisma.user.update({
      where: { email },
      data: { otp: null, otpExpiry: null, currentToken: token },
    });

    return { message: 'Login successful', token, user };
  }

  // ✅ LOGOUT (Invalidate user session)
  async logout(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Remove saved token
    await this.prisma.user.update({
      where: { id: userId },
      data: { currentToken: null },
    });

    return { message: 'Logout successful' };
  }

  // ✅ CRUD Operations
  async create(data: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (exists) throw new BadRequestException('User already exists');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: { ...data, password: hashedPassword },
    });

    return { message: 'User created successfully', user };
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { id: 'desc' },
      select: { id: true, fullname: true, email: true, mobile: true, createdAt: true },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, data: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (data.password) data.password = await bcrypt.hash(data.password, 10);

    const updated = await this.prisma.user.update({
      where: { id },
      data,
    });

    return { message: 'User updated successfully', updated };
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }
}
