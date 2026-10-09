import { Body, Controller, Post, Get, Param, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { LoginDto } from '../auth/dto/login.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  registerUser(@Body() userData: CreateUserDto) {
    return this.userService.registerUser(userData);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  loginUser(@Body() loginData: LoginDto) {
    return this.userService.loginUser(loginData);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('recruiter')
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  getMyProfile(@Req() req: { user: unknown }) {
    return req.user;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('recruiter')
  getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }
}
