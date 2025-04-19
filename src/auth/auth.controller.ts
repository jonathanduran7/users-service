import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('validate')
  async validate(@Body() loginDto: LoginDto) {
    console.log('loginDto in users-service', loginDto);
    return this.authService.validateUser(loginDto.email, loginDto.password);
  }
} 