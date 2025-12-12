import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

import { Public } from '../decorators/public.decorator';
import { CreateAuthDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/signin.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @Public()
  @Post('signup')
  async signUp(@Body() dto: CreateAuthDto) {
    return this.authService.SignUp(dto);
  }

  @ApiOperation({ summary: 'Authenticate user and get access token' })
  @Public()
  @Post('signin')
  async signIn(@Body() dto: LoginDto) {
    return this.authService.SignIn(dto);
  }
}
