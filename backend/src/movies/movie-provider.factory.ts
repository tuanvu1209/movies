import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IVideoProvider } from './interfaces/video-provider.interface';
import { BluphimProvider } from './providers/bluphim.provider';

@Injectable()
export class MovieProviderFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly bluphimProvider: BluphimProvider,
  ) {}

  getProvider(): IVideoProvider {
    const provider = this.configService.get<string>('VIDEO_PROVIDER', 'bluphim');
    
    switch (provider.toLowerCase()) {
      case 'bluphim':
        return this.bluphimProvider;
      default:
        return this.bluphimProvider;
    }
  }
}
