import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Movie } from '../movies/entities/movie.entity';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const getEnv = (key: string, fallback = ''): string =>
      (this.configService.get<string>(key) ?? fallback).trim();

    const nodeEnv = getEnv('NODE_ENV');
    const isDevelopment = nodeEnv === 'development' || nodeEnv === '';
    const isServerless = this.configService.get<string>('VERCEL') === '1';
    const poolSize = isDevelopment ? { max: 20, min: 5 } : { max: 5, min: 0 };
    // Chỉ bật SSL khi production hoặc khi có DATABASE_SSL=true (VD: Vercel/cloud). DATABASE_SSL=false để tắt.
    const useSsl =
      getEnv('DATABASE_SSL') === 'false'
        ? false
        : nodeEnv === 'production' || getEnv('DATABASE_SSL') === 'true';
    const dbPort = Number.parseInt(getEnv('DATABASE_PORT', '5453'), 10);
    
    return {
      type: 'postgres',
      host: getEnv('DATABASE_HOST', 'localhost'),
      port: Number.isNaN(dbPort) ? 5453 : dbPort,
      username: getEnv('DATABASE_USER', 'movie_user'),
      password: getEnv('DATABASE_PASSWORD', 'movie_password'),
      database: getEnv('DATABASE_NAME', 'movie_db'),
      entities: [User, Movie],
      synchronize: isDevelopment,
      logging: isDevelopment,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      extra: {
        // Keep DB connections low in production/serverless to avoid exhausting limits.
        max: isServerless ? 3 : poolSize.max,
        min: isServerless ? 0 : poolSize.min,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      },
    };
  }
}
