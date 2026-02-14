import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MoviesModule } from './movies/movies.module';
import { AdminModule } from './admin/admin.module';
import { NavModule } from './nav/nav.module';
import { WatchProgressModule } from './watch-progress/watch-progress.module';
import { DatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    AuthModule,
    UsersModule,
    MoviesModule,
    AdminModule,
    NavModule,
    WatchProgressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
