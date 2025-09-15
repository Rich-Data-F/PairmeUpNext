import { IsEmail, IsString, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }
  )
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+?[\d\s\-\(\)]+$/, {
    message: 'Please enter a valid phone number',
  })
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;
}

export class RequestPasswordResetDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  phoneNumber: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  resetToken: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }
  )
  newPassword: string;
}

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+?[\d\s\-\(\)]+$/, {
    message: 'Please enter a valid phone number',
  })
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  website?: string;

  @IsOptional()
  showEmail?: boolean;

  @IsOptional()
  showPhone?: boolean;

  @IsOptional()
  showLocation?: boolean;
}
