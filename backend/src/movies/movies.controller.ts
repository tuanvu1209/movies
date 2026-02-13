import {
  Controller,
  Get,
  Query,
  Param,
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

  @Get('category')
  @Header('Cache-Control', 'public, max-age=300')
  async getCategoryByQuery(
    @Query('slug') slug: string,
    @Query('page') pageStr: string,
    @Res() res: Response,
  ) {
    if (!slug) {
      throw new NotFoundException('slug is required');
    }
    const page = pageStr ? Math.max(1, parseInt(pageStr, 10) || 1) : 1;
    const result = await this.moviesService.getCategoryData(slug, page);
    return res.json(result ?? { data: [], pagination: undefined });
  }

  @Get('category/:slug')
  @Header('Cache-Control', 'public, max-age=300')
  async getCategoryBySlug(
    @Param('slug') slug: string,
    @Query('page') pageStr: string,
    @Res() res: Response,
  ) {
    const page = pageStr ? Math.max(1, parseInt(pageStr, 10) || 1) : 1;
    const result = await this.moviesService.getCategoryData(slug, page);
    return res.json(result ?? { data: [], pagination: undefined });
  }

  @Get('search')
  @Header('Cache-Control', 'public, max-age=120')
  async getSearch(
    @Query('q') q: string,
    @Res() res: Response,
  ) {
    let query = (q ?? '').trim();
    try {
      query = decodeURIComponent(query).trim();
    } catch {
      // keep as-is if not valid encoded (e.g. plain text)
    }
    if (query.length < 2) {
      return res.json([]);
    }
    const results = await this.moviesService.getSearch(query);
    return res.json(results);
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
