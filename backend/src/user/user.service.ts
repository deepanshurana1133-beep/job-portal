import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async registerUser(userData: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) {
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const newUser = new this.userModel({
    ...userData,
    password: hashedPassword,
  });


    const savedUser = await newUser.save();
  const { password, ...userResponse } = savedUser.toObject();

return userResponse;
}
async getAllUsers() {
  const users = await this.userModel.find().select('-password');
  return users;
}
async getUserById(id: string) {
  const user = await this.userModel.findById(id).select('-password');

  return user;
}
async findUserByEmail(email: string) {
  return this.userModel.findOne({ email });
}
async loginUser(loginData: { email: string; password: string }) {
  const user = await this.userModel.findOne({
    email: loginData.email,
  });

  if (!user) {
    throw new UnauthorizedException('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(
    loginData.password,
    user.password,
  );

  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid email or password');
  }

  return {
    message: 'Login successful',
    userId: user._id,
    email: user.email,
  };
}
}
