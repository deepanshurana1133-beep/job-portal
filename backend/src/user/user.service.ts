import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const newUser = new this.userModel({
    name: userData.name,
    email: userData.email.toLowerCase(),
    password: hashedPassword,
    role: 'job_seeker',
    });

    try {
    const savedUser = await newUser.save();
    return this.toPublicUser(savedUser);
    } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 11000
    ) {
      throw new ConflictException('An account with this email already exists');
    }
    throw error;
    }
  }

  async getAllUsers() {
    const users = await this.userModel.find().select('-password').exec();
    return users;
  }

  async getUserById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
    throw new NotFoundException('User not found');
    }
    return user;
  }

  async findUserByEmail(email: string) {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password')
      .exec();
  }

  async loginUser(loginData: { email: string; password: string }) {
    const user = await this.findUserByEmail(loginData.email);
    if (!user || !(await bcrypt.compare(loginData.password, user.password))) {
    throw new UnauthorizedException('Invalid email or password');
    }

    return {
    message: 'Login successful',
    userId: user._id,
    email: user.email,
    };
  }

  private toPublicUser(user: UserDocument) {
    const { password: _password, ...publicUser } = user.toObject();
    return publicUser;
  }
}
