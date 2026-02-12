import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Movie } from '../movies/entities/movie.entity';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isDevelopment = this.configService.get<string>('NODE_ENV') === 'development';
    
    return {
      type: 'postgres',
      host: this.configService.get<string>('DATABASE_HOST') || 'localhost',
      port: this.configService.get<number>('DATABASE_PORT') || 5453,
      username: this.configService.get<string>('DATABASE_USER') || 'movie_user',
      password: this.configService.get<string>('DATABASE_PASSWORD') || 'movie_password',
      database: this.configService.get<string>('DATABASE_NAME') || 'movie_db',
      entities: [User, Movie],
      synchronize: isDevelopment,
      logging: isDevelopment,
      extra: {
        max: 20, // Maximum number of connections in the pool
        min: 5, // Minimum number of connections in the pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      },
    };
  }
}
