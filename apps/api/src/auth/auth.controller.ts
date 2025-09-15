import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { AuthService, RequestPasswordResetDto, ResetPasswordDto } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Request password reset token',
    description: 'Railway-compatible password reset. Provide email and phone number to receive reset token.' 
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        phoneNumber: { type: 'string' }
      },
      required: ['email', 'phoneNumber']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Reset token generated successfully',
    schema: {
      type: 'object',
      properties: {
        resetToken: { type: 'string' },
        message: { type: 'string' },
        expiresAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found with provided email and phone combination' })
  async requestPasswordReset(@Body() requestDto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(requestDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Reset password using token',
    description: 'Use the reset token from request-password-reset to set a new password' 
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        resetToken: { type: 'string' },
        newPassword: { type: 'string', minLength: 8 }
      },
      required: ['email', 'resetToken', 'newPassword']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  async getProfile(@Request() req: any) {
    return this.authService.findById(req.user.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        phoneNumber: { type: 'string' },
        bio: { type: 'string' },
        location: { type: 'string' },
        website: { type: 'string' },
        showEmail: { type: 'boolean' },
        showPhone: { type: 'boolean' },
        showLocation: { type: 'boolean' }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  async updateProfile(@Request() req: any, @Body() updateData: any) {
    return this.authService.updateProfile(req.user.id, updateData);
  }
}
