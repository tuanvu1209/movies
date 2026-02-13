import { Injectable } from '@nestjs/common';
import { MovieProviderFactory } from '../movies/movie-provider.factory';
import { NavItem } from '../shared/types/nav.types';
import { CacheService } from '../shared/cache/cache.service';

@Injectable()
export class NavService {
  constructor(
    private readonly providerFactory: MovieProviderFactory,
    private readonly cacheService: CacheService,
  ) {}

  async getNav(): Promise<NavItem[]> {
    const cacheKey = 'nav';
    const cached = this.cacheService.get<NavItem[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const provider = this.providerFactory.getProvider();
    const result = await provider.getNav();

    if (result?.length) {
      this.cacheService.set(cacheKey, result, 600);
    }

    return result ?? [];
  }
}
