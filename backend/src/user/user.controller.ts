import { Body, Controller, Post, Get, Param, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  registerUser(@Body() userData: CreateUserDto) {
    return this.userService.registerUser(userData);
  }
  @Post('login')
loginUser(@Body() loginData: { email: string; password: string }) {
  return this.userService.loginUser(loginData);
}
  @Get()
getAllUsers() {
  return this.userService.getAllUsers();
}
@Get('profile/me')
@UseGuards(JwtAuthGuard)
getMyProfile(@Req() req: any) {
  return req.user;
}
@Get(':id')
getUserById(@Param('id') id: string) {
  return this.userService.getUserById(id);
}
}
