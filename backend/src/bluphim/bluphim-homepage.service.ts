import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { HomepageData, HomepageMovie } from '../shared/types/homepage.types';

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
    try {
      const response = await axios.get(this.baseUrl, {
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

        const movies = this.extractMoviesFromContainer($, $moviesContainer);

        if (movies.length > 0) {
          sections.push({ title: sectionTitle, data: movies });
        }
      });

      return sections.length > 0 ? sections : null;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      console.error('Error scraping bluphim homepage:', error);
      }
      return null;
    }
  }

  private extractMoviesFromContainer($: cheerio.CheerioAPI, $container: cheerio.Cheerio<cheerio.Element>, limit: number = 20): HomepageMovie[] {
    const movies: HomepageMovie[] = [];
    const seenUrls = new Set<string>();

    $container.find('.movie-card-2').each((_, cardEl) => {
      if (movies.length >= limit) return false;

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
