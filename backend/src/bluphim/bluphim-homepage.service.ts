import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { HomepageData, HomepageMovie } from '../shared/types/homepage.types';
import { CategoryPageResult, CategoryPagination } from '../shared/types/category.types';

export interface Category {
  name: string;
  slug: string;
  url: string;
}

@Injectable()
export class BluphimHomepageService {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('BLUPHIM_BASE_URL') || 'https://bluphim.me';
  }

  async getHomepageData(): Promise<HomepageData | null> {
    return this.getPageData(this.baseUrl);
  }

  /** Lấy dữ liệu trang category (phim-bo, phim-le, ...), có phân trang phim-bo/page/2/. */
  async getCategoryData(slug: string, page: number = 1): Promise<CategoryPageResult | null> {
    const path = slug.replace(/^\//, '').replace(/\/$/, '');
    if (!path) return null;
    const url = page > 1 ? `${this.baseUrl}/${path}/page/${page}/` : `${this.baseUrl}/${path}/`;
    return this.getCategoryPageData(url);
  }

  private async getCategoryPageData(url: string): Promise<CategoryPageResult | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        timeout: 30000,
      });

      const $ = cheerio.load(response.data);
      const sections: HomepageData = [];

      const categoryTitle = $('h1').first().text().trim() || 'Danh sách phim';

      const $moviesGrid = $('.movies-grid');
      if ($moviesGrid.length) {
        const movies = this.extractMoviesFromContainer($, $moviesGrid.first(), 0);
        if (movies.length > 0) {
          sections.push({ title: categoryTitle, data: movies });
        }
      }

      const pagination = this.parsePagination($);

      if (sections.length === 0 && !pagination) return null;
      return {
        data: sections.length > 0 ? sections : [],
        ...(pagination && { pagination }),
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error scraping bluphim category:', url, error);
      }
      return null;
    }
  }

  /** Parse nav.navigation.pagination .nav-links để lấy currentPage, totalPages, prev, next. */
  private parsePagination($: cheerio.CheerioAPI): CategoryPagination | null {
    const $nav = $('.navigation.pagination .nav-links');
    if (!$nav.length) return null;

    let currentPage = 1;
    let totalPages = 1;
    let prevPage: number | null = null;
    let nextPage: number | null = null;
    const pageNumbers: number[] = [];

    const extractPageFromHref = (href: string): number | null => {
      const match = href.match(/\/page\/(\d+)\/?/);
      return match ? parseInt(match[1], 10) : null;
    };

    $nav.find('a.page-numbers, span.page-numbers').each((_, el) => {
      const $el = $(el);
      const href = $el.attr('href') || '';
      const text = $el.text().trim();

      if ($el.hasClass('current')) {
        const n = parseInt(text, 10);
        if (!isNaN(n)) currentPage = n;
        return;
      }
      if ($el.hasClass('dots')) return;
      if ($el.hasClass('prev')) {
        const n = extractPageFromHref(href);
        if (n != null) prevPage = n;
        return;
      }
      if ($el.hasClass('next')) {
        const n = extractPageFromHref(href);
        if (n != null) nextPage = n;
        return;
      }
      const n = parseInt(text, 10);
      if (!isNaN(n)) pageNumbers.push(n);
      else {
        const fromHref = extractPageFromHref(href);
        if (fromHref != null) pageNumbers.push(fromHref);
      }
    });

    if (pageNumbers.length > 0) {
      totalPages = Math.max(totalPages, ...pageNumbers);
    }
    if (prevPage == null && currentPage > 1) {
      prevPage = currentPage - 1;
    }
    if (nextPage == null && currentPage < totalPages) {
      nextPage = currentPage + 1;
    }

    return {
      currentPage,
      totalPages,
      prevPage: prevPage && prevPage >= 1 ? prevPage : null,
      nextPage: nextPage && nextPage <= totalPages ? nextPage : null,
    };
  }

  private async getPageData(url: string): Promise<HomepageData | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        timeout: 30000,
      });

      const $ = cheerio.load(response.data);
      const sections: HomepageData = [];
      const seenTitles = new Set<string>();

      $('.section-title-main').each((_, el) => {
        const sectionTitle = $(el).text().trim();
        if (!sectionTitle || seenTitles.has(sectionTitle)) return;

        seenTitles.add(sectionTitle);

        const $sectionTitleEl = $(el);
        const $container = $sectionTitleEl.closest('.col-inner, .container, section');

        const $moviesSection = $container.find('.movies-section, .grid').first();
        
        let $moviesContainer: cheerio.Cheerio<cheerio.Element> = $moviesSection;
        if (!$moviesContainer.length) {
          const $sectionTitleContainer = $sectionTitleEl.closest('.section-title-container, .container');
          $moviesContainer = $sectionTitleContainer.nextAll('.movies-section, .grid, .text').first();
          if (!$moviesContainer.length) {
            $moviesContainer = $container as cheerio.Cheerio<cheerio.Element>;
          }
        }

        const movies = this.extractMoviesFromContainer($, $moviesContainer, 20);

        if (movies.length > 0) {
          sections.push({ title: sectionTitle, data: movies });
        }
      });

      // Trang category: không có .section-title-main, chỉ có .movies-grid với .movie-card-2
      if (sections.length === 0) {
        const $moviesGrid = $('.movies-grid');
        if ($moviesGrid.length) {
          const movies = this.extractMoviesFromContainer($, $moviesGrid.first(), 0);
          if (movies.length > 0) {
            sections.push({ title: 'Danh sách phim', data: movies });
          }
        }
      }

      return sections.length > 0 ? sections : null;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error scraping bluphim page:', url, error);
      }
      return null;
    }
  }

  private extractMoviesFromContainer($: cheerio.CheerioAPI, $container: cheerio.Cheerio<cheerio.Element>, limit: number = 20): HomepageMovie[] {
    const movies: HomepageMovie[] = [];
    const seenUrls = new Set<string>();

    $container.find('.movie-card-2').each((_, cardEl) => {
      if (limit > 0 && movies.length >= limit) return false;

      const $card = $(cardEl);
      const movie = this.extractMovieFromCard($, $card);
      
      if (movie && !seenUrls.has(movie.url)) {
        seenUrls.add(movie.url);
        movies.push(movie);
      }
    });

    return movies;
  }

  private extractMovieFromCard($: cheerio.CheerioAPI, $card: cheerio.Cheerio<cheerio.Element>): HomepageMovie | null {
    const $poster = $card.find('.movie-poster');
    const $link = $poster.find('a.stretched-link, a').first();
    let href = $link.attr('href') || '';

    if (!href) return null;

    if (href.startsWith('https://bluphim.me/') || href.startsWith('http://bluphim.me/')) {
      href = href.replace(/^https?:\/\/bluphim\.me\//, '').replace(/\/$/, '');
    }

    const title = $link.attr('aria-label') ||
      $poster.find('img').attr('title') ||
      $poster.find('img').attr('alt') ||
      $card.find('.movie-title a').text().trim() ||
      $link.text().trim() ||
      '';

    const thumbnail = $poster.find('img').attr('src') ||
      $poster.find('img').attr('data-src') ||
      $poster.find('img').attr('data-lazy-src') ||
      '';

    const quality = $poster.find('.badge.quality-badge').text().trim() || '';

    const episode = $poster.find('.badge.episode-badge').text().trim() || '';

    const viewCountText = $poster.find('.badge.view-count').text().trim();
    const viewCountMatch = viewCountText.match(/Lượt xem:\s*([\d.]+[K]?)/);
    const viewCount = viewCountMatch ? viewCountMatch[1] : '';

    const ratingText = $poster.find('.rating-badge, .rating, .star').text().trim();
    const rating = this.parseRating(ratingText);

    if (!title || !href) return null;

    return {
      title,
      url: href,
      thumbnail: this.normalizeUrl(thumbnail),
      quality,
      episode,
      rating,
      viewCount,
    };
  }

  private normalizeUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return `https:${url}`;
    if (url.startsWith('/')) return `${this.baseUrl}${url}`;
    return `${this.baseUrl}/${url}`;
  }

  private parseRating(ratingText: string): number {
    if (!ratingText) return 0;

    const match = ratingText.match(/(\d+\.?\d*)/);
    if (match) {
      const rating = parseFloat(match[1]);
      return rating > 10 ? rating / 10 : rating;
    }

    const starCount = (ratingText.match(/\u2605/g) || []).length;
    if (starCount > 0) {
      return starCount;
    }

    return 0;
  }
}
