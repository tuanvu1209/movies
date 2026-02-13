import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BluphimService } from './bluphim.service';
import { BluphimScraperService } from './bluphim-scraper.service';
import { BluphimHomepageService } from './bluphim-homepage.service';
import { BluphimSearchService } from './bluphim-search.service';

@Module({
  imports: [ConfigModule],
  providers: [BluphimService, BluphimScraperService, BluphimHomepageService, BluphimSearchService],
  exports: [BluphimService],
})
export class BluphimModule {}
