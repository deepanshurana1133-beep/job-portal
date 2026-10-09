import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoginDto } from '../auth/dto/login.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Types } from 'mongoose';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  registerUser(@Body() userData: CreateUserDto) {
    return this.userService.registerUser(userData);
  }
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  loginUser(@Body() loginData: LoginDto) {
    return this.userService.loginUser(loginData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('recruiter')
  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  getMyProfile(@Req() req: { user: { userId: string } }) {
    return this.userService.getUserById(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUserById(
    @Param('id') id: string,
    @Req() req: { user: { userId: string } },
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('User not found');
    }
    if (!new Types.ObjectId(id).equals(new Types.ObjectId(req.user.userId))) {
      throw new ForbiddenException('You can only view your own profile');
    }

    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
