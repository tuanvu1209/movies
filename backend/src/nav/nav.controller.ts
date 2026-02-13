import { Controller, Get, Header } from '@nestjs/common';
import { NavService } from './nav.service';

@Controller(['api/nav', 'nav'])
export class NavController {
  constructor(private readonly navService: NavService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=600')
  async getNav() {
    return this.navService.getNav();
  }
}
