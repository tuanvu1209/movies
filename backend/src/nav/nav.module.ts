import { Module } from '@nestjs/common';
import { NavService } from './nav.service';
import { NavController } from './nav.controller';
import { MoviesModule } from '../movies/movies.module';
import { CacheService } from '../shared/cache/cache.service';

@Module({
  imports: [MoviesModule],
  controllers: [NavController],
  providers: [NavService, CacheService],
  exports: [NavService],
})
export class NavModule {}
