import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BluphimService } from './bluphim.service';
import { BluphimScraperService } from './bluphim-scraper.service';
import { BluphimHomepageService } from './bluphim-homepage.service';

@Module({
  imports: [ConfigModule],
  providers: [BluphimService, BluphimScraperService, BluphimHomepageService],
  exports: [BluphimService],
})
export class BluphimModule {}
