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
}
