import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SearchResult } from '../shared/types/search.types';

interface FlatsomeSuggestion {
  type: string;
  id: number;
  value: string;
  url: string;
  img?: string;
  price?: string;
}

interface FlatsomeSearchResponse {
  suggestions?: FlatsomeSuggestion[];
}

@Injectable()
export class BluphimSearchService {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('BLUPHIM_BASE_URL') || 'https://bluphim.me';
  }

  /** Gọi flatsome_ajax_search_products, trả về danh sách gợi ý (title, url slug, thumbnail). */
  async search(query: string): Promise<SearchResult[]> {
    const trimmed = query?.trim();
    if (!trimmed || trimmed.length < 2) {
      return [];
    }
    try {
      const url = `${this.baseUrl}/wp-admin/admin-ajax.php`;
      const response = await axios.get<FlatsomeSearchResponse>(url, {
        params: {
          action: 'flatsome_ajax_search_products',
          query: trimmed,
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': `${this.baseUrl}/`,
        },
        timeout: 10000,
      });

      const suggestions = response.data?.suggestions ?? [];
      const results: SearchResult[] = [];

      for (const item of suggestions) {
        const href = item.url || '';
        if (!href || !item.value) continue;
        let slug = '';
        try {
          const path = new URL(href).pathname.replace(/^\/|\/$/g, '');
          if (path) slug = path;
        } catch {
          continue;
        }
        results.push({
          title: item.value,
          url: slug,
          thumbnail: item.img || '',
        });
      }

      return results;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Bluphim search error:', error);
      }
      return [];
    }
  }
}
