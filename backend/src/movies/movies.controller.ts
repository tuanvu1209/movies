import {
  Controller,
  Get,
  Query,
  NotFoundException,
  Header,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { MoviesService } from './movies.service';

@Controller('api/movies')
export class MoviesController {
  constructor(
    private readonly moviesService: MoviesService,
  ) {}

  @Get('homepage')
  @Header('Cache-Control', 'public, max-age=300')
  async getHomepage(@Res() res: Response) {
    const data = await this.moviesService.getHomepage();
    if (!data) {
      throw new NotFoundException('Could not fetch homepage data');
    }
    return res.json(data);
  }

  @Get('info')
  @Header('Cache-Control', 'public, max-age=600')
  async getMovieInfo(
    @Query('url') url: string,
    @Query('episode') episode?: string,
    @Res() res?: Response,
  ) {
    if (!url) {
      throw new NotFoundException('URL is required');
    }
    const episodeNum = episode ? parseInt(episode, 10) : 1;
    const movieInfo = await this.moviesService.getMovieInfo(url, episodeNum);
    if (!movieInfo) {
      throw new NotFoundException('Could not fetch movie info');
    }
    if (res) {
      return res.json(movieInfo);
    }
    return movieInfo;
  }
}
