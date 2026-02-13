import { Injectable } from '@nestjs/common';
import { IVideoProvider, VideoProviderMovieInfo, VideoProviderHomepageData } from '../interfaces/video-provider.interface';
import { BluphimService } from '../../bluphim/bluphim.service';

@Injectable()
export class BluphimProvider implements IVideoProvider {
  constructor(private readonly bluphimService: BluphimService) {}

  async getMovieInfo(url: string, episode: number = 1): Promise<VideoProviderMovieInfo | null> {
    return this.bluphimService.getMovieInfo(url, episode);
  }

  async getHomepage(): Promise<VideoProviderHomepageData | null> {
    return this.bluphimService.getHomepage();
  }

  async getCategoryData(slug: string, page?: number) {
    return this.bluphimService.getCategoryData(slug, page ?? 1);
  }

  async getSearch(query: string) {
    return this.bluphimService.getSearch(query);
  }

  async getNav() {
    return this.bluphimService.getNav();
  }
}
