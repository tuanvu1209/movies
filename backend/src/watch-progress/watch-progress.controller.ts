import { Controller, Get, Put, Body, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WatchProgressService } from './watch-progress.service';

@Controller('api/watch-progress')
@UseGuards(JwtAuthGuard)
export class WatchProgressController {
  constructor(private readonly watchProgressService: WatchProgressService) {}

  @Get('list')
  async getList(@Request() req: { user: { id: string } }) {
    const list = await this.watchProgressService.getList(req.user.id);
    return list;
  }

  @Get()
  async getOne(
    @Request() req: { user: { id: string } },
    @Query('movieId') movieId: string,
  ) {
    if (!movieId) return null;
    return this.watchProgressService.getOne(req.user.id, movieId);
  }

  @Put()
  async save(
    @Request() req: { user: { id: string } },
    @Body()
    body: {
      movieId: string;
      episode: number;
      currentTimeSeconds: number;
      title?: string;
      thumbnail?: string;
      durationSeconds?: number;
    },
  ) {
    const { movieId, episode, currentTimeSeconds, title, thumbnail, durationSeconds } = body;
    if (!movieId || typeof episode !== 'number') return;
    await this.watchProgressService.save(req.user.id, movieId, episode, currentTimeSeconds ?? 0, {
      title,
      thumbnail,
      durationSeconds,
    });
  }
}
