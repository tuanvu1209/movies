import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Request,
  Res,
  UseGuards
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { AdminService } from './admin.service';
import { AdminGuard } from './guards/admin.guard';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) { }

  @Get('login')
  @Render('admin/login')
  async loginPage() {
    return {};
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }, @Res() res: Response) {
    try {
      const user = await this.authService.validateUser(body.email, body.password);
      if (!user) {
        return res.render('admin/login', { error: 'Invalid credentials' });
      }

      const fullUser = await this.usersService.findById(user.id);
      if (!fullUser || !fullUser.isAdmin) {
        return res.render('admin/login', { error: 'Admin access required' });
      }

      const loginResult = await this.authService.login(user);
      res.cookie('token', loginResult.access_token, { httpOnly: true });
      res.redirect('/admin');
    } catch (error) {
      return res.render('admin/login', { error: 'Login failed' });
    }
  }

  @Get('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('token');
    res.redirect('/admin/login');
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Render('admin/dashboard')
  async dashboard(@Request() req) {
    const stats = await this.adminService.getDashboardStats();
    return {
      title: 'Dashboard',
      user: req.user,
      stats,
      isDashboard: true,
    };
  }


  @Get('users')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Render('admin/users')
  async users(@Request() req) {
    const users = await this.adminService.getAllUsers();
    return {
      title: 'Users',
      user: req.user,
      users: users.map((u) => {
        const { password, ...user } = u;
        return user;
      }),
      isUsers: true,
    };
  }

}
