import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Movie } from '../movies/entities/movie.entity';
import { WatchProgress } from '../watch-progress/entities/watch-progress.entity';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const getEnv = (key: string, fallback = ''): string =>
      (this.configService.get<string>(key) ?? fallback).trim();

    const nodeEnv = getEnv('NODE_ENV');
    const isDevelopment = nodeEnv === 'development' || nodeEnv === '';
    const isServerless = this.configService.get<string>('VERCEL') === '1';
    const syncEnabled = isDevelopment || getEnv('DATABASE_SYNC') === 'true';
    const poolSize = isDevelopment ? { max: 20, min: 5 } : { max: 5, min: 0 };

    // Serverless (Vercel): Neon khuyên dùng pooled (POSTGRES_URL). Local: DATABASE_URL hoặc tách biến.
    const databaseUrl = isServerless
      ? getEnv('POSTGRES_URL') || getEnv('POSTGRES_PRISMA_URL') || getEnv('DATABASE_URL')
      : getEnv('DATABASE_URL') || getEnv('POSTGRES_URL') || getEnv('POSTGRES_PRISMA_URL');

    const common = {
      type: 'postgres' as const,
      entities: [User, Movie, WatchProgress],
      synchronize: syncEnabled,
      logging: isDevelopment,
      extra: {
        max: isServerless ? 3 : poolSize.max,
        min: isServerless ? 0 : poolSize.min,
        idleTimeoutMillis: 30000,
        // Neon cold start có thể vài giây; serverless cần timeout cao hơn
        connectionTimeoutMillis: isServerless ? 10000 : 2000,
      },
    };

    if (databaseUrl) {
      const isNeon = databaseUrl.includes('neon.tech');
      const needsSsl =
        isNeon ||
        databaseUrl.includes('sslmode=require') ||
        databaseUrl.includes('ssl=true');
      return {
        ...common,
        url: databaseUrl,
        ssl: needsSsl ? { rejectUnauthorized: false } : false,
      };
    }

    const useSsl =
      getEnv('DATABASE_SSL') === 'false'
        ? false
        : nodeEnv === 'production' || getEnv('DATABASE_SSL') === 'true';
    const dbPort = Number.parseInt(getEnv('DATABASE_PORT', '5453'), 10);

    return {
      ...common,
      host: getEnv('DATABASE_HOST', 'localhost'),
      port: Number.isNaN(dbPort) ? 5453 : dbPort,
      username: getEnv('DATABASE_USER', 'movie_user'),
      password: getEnv('DATABASE_PASSWORD', 'movie_password'),
      database: getEnv('DATABASE_NAME', 'movie_db'),
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    };
  }
}
