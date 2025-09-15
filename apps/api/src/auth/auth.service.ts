import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
}

export interface RequestPasswordResetDto {
  email: string;
  phoneNumber: string;
}

export interface ResetPasswordDto {
  email: string;
  resetToken: string;
  newPassword: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create user with password (for NextAuth.js credentials provider)
   */
  async createUser(createUserDto: CreateUserDto) {
    const { email, password, name, phoneNumber } = createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phoneNumber,
        isVerified: false,
        trustLevel: 'new',
        verificationBadge: null,
      },
    });

    return this.sanitizeUser(user);
  }

  /**
   * Verify user credentials (for NextAuth.js credentials provider)
   */
  async verifyCredentials(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.sanitizeUser(user);
  }

  /**
   * Railway-compatible password reset - no email sending
   * User provides email + phone number to get reset token
   */
  async requestPasswordReset(requestDto: RequestPasswordResetDto) {
    const { email, phoneNumber } = requestDto;

    // Find user with both email and phone
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        phoneNumber,
      },
    });

    if (!user) {
      throw new NotFoundException(
        'No user found with the provided email and phone number combination'
      );
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiry: resetTokenExpiry,
      },
    });

    return {
      resetToken,
      message: 'Password reset token generated. Use this token to reset your password.',
      expiresAt: resetTokenExpiry,
    };
  }

  /**
   * Reset password using token
   */
  async resetPassword(resetDto: ResetPasswordDto) {
    const { resetToken, newPassword, email } = resetDto;

    // Find user with valid reset token
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        passwordResetToken: resetToken,
        passwordResetExpiry: {
          gt: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
        lastPasswordChange: new Date(),
      },
    });

    return {
      message: 'Password reset successful. You can now login with your new password.',
    };
  }

  /**
   * Get user by ID (for NextAuth.js)
   */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return this.sanitizeUser(user);
  }

  /**
   * Get user by email (for NextAuth.js)
   */
  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return this.sanitizeUser(user);
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateData: any) {
    // Remove sensitive fields that shouldn't be updated via this endpoint
    const { 
      password, 
      email, 
      isVerified, 
      verificationBadge, 
      trustLevel, 
      passwordResetToken,
      passwordResetExpiry,
      ...allowedData 
    } = updateData;

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...allowedData,
        lastActiveAt: new Date(),
      },
    });

    return this.sanitizeUser(user);
  }

  /**
   * Remove sensitive fields from user object
   */
  private sanitizeUser(user: any) {
    const { password, passwordResetToken, passwordResetExpiry, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
