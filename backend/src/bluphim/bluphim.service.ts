import { Injectable } from '@nestjs/common';
import { BluphimScraperService, BluphimMovieInfo } from './bluphim-scraper.service';
import { BluphimHomepageService } from './bluphim-homepage.service';
import { HomepageData } from '../shared/types/homepage.types';

@Injectable()
export class BluphimService {
  constructor(
    private bluphimScraper: BluphimScraperService,
    private bluphimHomepage: BluphimHomepageService,
  ) {}

  async getMovieInfo(bluphimUrl: string, episode: number = 1): Promise<BluphimMovieInfo | null> {
    return this.bluphimScraper.getMovieInfo(bluphimUrl, episode);
  }

  async getHomepage(): Promise<HomepageData | null> {
    return this.bluphimHomepage.getHomepageData();
  }
}
