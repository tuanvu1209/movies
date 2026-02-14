import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchProgress } from './entities/watch-progress.entity';
import { WatchProgressService } from './watch-progress.service';
import { WatchProgressController } from './watch-progress.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WatchProgress])],
  controllers: [WatchProgressController],
  providers: [WatchProgressService],
  exports: [WatchProgressService],
})
export class WatchProgressModule {}
