import { Injectable } from '@nestjs/common';
import { MovieProviderFactory } from './movie-provider.factory';
import { VideoProviderMovieInfo, VideoProviderHomepageData } from './interfaces/video-provider.interface';
import { CategoryPageResult } from '../shared/types/category.types';
import { SearchResult } from '../shared/types/search.types';
import { CacheService } from '../shared/cache/cache.service';

@Injectable()
export class MoviesService {
  constructor(
    private readonly providerFactory: MovieProviderFactory,
    private readonly cacheService: CacheService,
  ) {}

  async getMovieInfo(url: string, episode: number = 1): Promise<VideoProviderMovieInfo | null> {
    const cacheKey = `movie:${url}:${episode}`;
    const cached = this.cacheService.get<VideoProviderMovieInfo>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const provider = this.providerFactory.getProvider();
    const result = await provider.getMovieInfo(url, episode);
    
    if (result) {
      // Cache for 10 minutes
      this.cacheService.set(cacheKey, result, 600);
    }
    
    return result;
  }

  async getHomepage(): Promise<VideoProviderHomepageData | null> {
    const cacheKey = 'homepage';
    const cached = this.cacheService.get<VideoProviderHomepageData>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const provider = this.providerFactory.getProvider();
    const result = await provider.getHomepage();
    
    if (result) {
      // Cache for 5 minutes
      this.cacheService.set(cacheKey, result, 300);
    }
    
    return result;
  }

  async getCategoryData(slug: string, page: number = 1): Promise<CategoryPageResult | null> {
    const cacheKey = `category:${slug}:${page}`;
    const cached = this.cacheService.get<CategoryPageResult>(cacheKey);
    if (cached) return cached;

    const provider = this.providerFactory.getProvider();
    const result = await provider.getCategoryData(slug, page);
    if (result?.data?.length || result?.pagination) {
      this.cacheService.set(cacheKey, result, 300);
    }
    return result ?? null;
  }

  async getSearch(query: string): Promise<SearchResult[]> {
    const trimmed = query?.trim() ?? '';
    if (trimmed.length < 2) return [];
    const cacheKey = `search:${trimmed.toLowerCase()}`;
    const cached = this.cacheService.get<SearchResult[]>(cacheKey);
    if (cached) return cached;

    const provider = this.providerFactory.getProvider();
    const result = await provider.getSearch(trimmed);
    if (result?.length) {
      this.cacheService.set(cacheKey, result, 120);
    }
    return result ?? [];
  }
}
