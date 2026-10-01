import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ApiBody } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiBody({
    schema: {
      examples: {
        user: {
          summary: 'role User',
          value: {
            email: 'eisaokh@gmail.com',
            password: '123456789',
          },
        },
        admin: {
          summary: 'role Admin',
          value: {
            email: 'eisaokh2@gmail.com',
            password: '123456789',
          },
        },
      },
    },
  })
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
