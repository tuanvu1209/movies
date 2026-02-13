import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { MovieProviderFactory } from './movie-provider.factory';
import { BluphimProvider } from './providers/bluphim.provider';
import { BluphimModule } from '../bluphim/bluphim.module';
import { CacheService } from '../shared/cache/cache.service';

@Module({
  imports: [BluphimModule],
  controllers: [MoviesController],
  providers: [MoviesService, MovieProviderFactory, BluphimProvider, CacheService],
  exports: [MoviesService, MovieProviderFactory],
})
export class MoviesModule {}
