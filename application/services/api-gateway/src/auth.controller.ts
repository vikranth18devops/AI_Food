import { Controller, Post, Body, Get, UseGuards, Req, HttpCode, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { loadAppConfig } from '@foodlens/shared-config';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiResponse } from '@foodlens/shared-types';

const config = loadAppConfig();
const authServiceUrl = config.authServiceUrl || 'http://localhost:3001';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthGatewayController {
  constructor(private readonly httpService: HttpService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @SwaggerResponse({ status: 201, description: 'User created successfully' })
  async register(@Body() body: any): Promise<ApiResponse> {
    try {
      const res = await firstValueFrom(this.httpService.post(`${authServiceUrl}/auth/register`, body));
      return { success: true, data: res.data, message: 'Registration successful' };
    } catch (err: any) {
      const status = err.response?.status || 500;
      const errorData = err.response?.data || { message: 'Auth service failure' };
      throw new HttpException({ success: false, error: { code: 'REGISTRATION_FAILED', message: errorData.message } }, status);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with credentials' })
  async login(@Body() body: any): Promise<ApiResponse> {
    try {
      const res = await firstValueFrom(this.httpService.post(`${authServiceUrl}/auth/login`, body));
      return { success: true, data: res.data, message: 'Login successful' };
    } catch (err: any) {
      const status = err.response?.status || 401;
      const errorData = err.response?.data || { message: 'Invalid email or password' };
      throw new HttpException({ success: false, error: { code: 'INVALID_CREDENTIALS', message: errorData.message } }, status);
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() body: any): Promise<ApiResponse> {
    try {
      const res = await firstValueFrom(this.httpService.post(`${authServiceUrl}/auth/refresh`, body));
      return { success: true, data: res.data };
    } catch (err: any) {
      const status = err.response?.status || 401;
      throw new HttpException({ success: false, error: { code: 'REFRESH_FAILED', message: 'Token refresh failed' } }, status);
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log out user and revoke refresh token' })
  async logout(@Body() body: any): Promise<ApiResponse> {
    try {
      const res = await firstValueFrom(this.httpService.post(`${authServiceUrl}/auth/logout`, body));
      return { success: true, data: res.data };
    } catch (err: any) {
      return { success: true, message: 'Logged out' };
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current logged-in user profile' })
  async getProfile(@Req() req: any): Promise<ApiResponse> {
    try {
      const res = await firstValueFrom(
        this.httpService.get(`${authServiceUrl}/auth/me`, {
          headers: { 'x-user-id': req.user.userId },
        })
      );
      return { success: true, data: res.data };
    } catch (err: any) {
      throw new HttpException({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User profile fetch failed' } }, 404);
    }
  }
}
