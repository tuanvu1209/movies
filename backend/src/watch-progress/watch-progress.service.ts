import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatchProgress } from './entities/watch-progress.entity';

const MAX_LIST_SIZE = 30;

export interface WatchProgressDto {
  movieId: string;
  episode: number;
  currentTimeSeconds: number;
  updatedAt: number;
  title?: string;
  thumbnail?: string;
  durationSeconds?: number;
}

@Injectable()
export class WatchProgressService {
  constructor(
    @InjectRepository(WatchProgress)
    private readonly repo: Repository<WatchProgress>,
  ) {}

  async getList(userId: string): Promise<WatchProgressDto[]> {
    const rows = await this.repo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
      take: MAX_LIST_SIZE,
    });
    return rows.map((r) => ({
      movieId: r.movieId,
      episode: r.episode,
      currentTimeSeconds: r.currentTimeSeconds,
      updatedAt: typeof r.updatedAt === 'string' ? parseInt(r.updatedAt, 10) : Number(r.updatedAt),
      title: r.title ?? undefined,
      thumbnail: r.thumbnail ?? undefined,
      durationSeconds: r.durationSeconds ?? undefined,
    }));
  }

  async getOne(userId: string, movieId: string): Promise<{ episode: number; currentTimeSeconds: number } | null> {
    const row = await this.repo.findOne({
      where: { userId, movieId },
    });
    if (!row) return null;
    return {
      episode: row.episode,
      currentTimeSeconds: Math.max(0, row.currentTimeSeconds),
    };
  }

  async save(
    userId: string,
    movieId: string,
    episode: number,
    currentTimeSeconds: number,
    meta?: { title?: string; thumbnail?: string; durationSeconds?: number },
  ): Promise<void> {
    const updatedAt = Date.now();
    const existing = await this.repo.findOne({ where: { userId, movieId } });
    const payload = {
      episode,
      currentTimeSeconds: Math.max(0, Math.floor(currentTimeSeconds)),
      updatedAt: String(updatedAt),
      title: meta?.title ?? null,
      thumbnail: meta?.thumbnail ?? null,
      durationSeconds: meta?.durationSeconds ?? null,
    };
    if (existing) {
      await this.repo.update({ id: existing.id }, payload);
    } else {
      await this.repo.insert({
        userId,
        movieId,
        ...payload,
      });
    }
  }
}
