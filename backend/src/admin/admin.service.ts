import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminService {
  constructor(
    private usersService: UsersService,
  ) { }

  async getDashboardStats() {
    return {
      totalUsers: 0,
      premiumUsers: 0,
    };
  }

  async getAllUsers() {
    return [];
  }
}
