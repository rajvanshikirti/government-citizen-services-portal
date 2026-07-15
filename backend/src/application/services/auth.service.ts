import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma';
import { jwtService } from '../../infrastructure/services/jwt.service';
import { AppError, UnauthorizedError, ValidationError } from '../../domain/entities/errors';

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  aadhaarNumber?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new ValidationError('Email already registered');

    if (input.aadhaarNumber) {
      const existingAadhaar = await prisma.user.findUnique({
        where: { aadhaarNumber: input.aadhaarNumber },
      });
      if (existingAadhaar) throw new ValidationError('Aadhaar number already registered');
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        aadhaarNumber: input.aadhaarNumber,
        role: Role.CITIZEN,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    const tokens = jwtService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, ...tokens };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValid = await bcrypt.compare(input.password, user.password);
    if (!isValid) throw new UnauthorizedError('Invalid credentials');

    const tokens = jwtService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, ...tokens };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        aadhaarNumber: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new AppError(404, 'User not found');
    return user;
  }

  async updateProfile(userId: string, data: Partial<RegisterInput & { address?: string; city?: string; state?: string; pincode?: string }>) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        aadhaarNumber: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        role: true,
        updatedAt: true,
      },
    });

    return user;
  }
}

export const authService = new AuthService();
