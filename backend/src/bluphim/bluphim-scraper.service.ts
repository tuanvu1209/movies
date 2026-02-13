import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface BluphimMovieInfo {
  title: string;
  thumbnail: string;
  m3u8Url: string;
  episodes: Array<{
    episode: number;
    url: string;
  }>;
}

@Injectable()
export class BluphimScraperService {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('BLUPHIM_BASE_URL') || 'https://bluphim.me';
  }

  async getMovieInfo(bluphimUrl: string, episode: number = 1): Promise<BluphimMovieInfo | null> {
    try {
      let url = `${this.baseUrl}/${bluphimUrl}`;

      if (!url.match(/\/tap-\d+/i) && episode > 0) {
        url = `${url}/tap-${episode}`;
      }

      if (!url.endsWith('/')) {
        url = `${url}/`;
      }

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
          'Referer': 'https://bluphim.me/',
        },
        timeout: 30000,
      });

      const $ = cheerio.load(response.data);

      let title = $('h1').first().text().trim();
      title = title.replace(/\s*-\s*Tập\s*\d+.*$/i, '').trim();
      if (!title) {
        title = $('meta[property="og:title"]').attr('content') ||
          $('.entry-title, .movie-title').first().text().trim() ||
          'Unknown Title';
      }

      const m3u8Url = this.extractM3U8Url($);

      const episodes = this.extractEpisodes($);

      return {
        title,
        thumbnail: $('meta[property="og:image"]').attr('content') || '',
        m3u8Url,
        episodes,
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      console.error('Error scraping bluphim:', error);
      }
      return null;
    }
  }

  async searchMovies(query: string): Promise<Array<{ title: string; url: string; thumbnail: string }>> {
    try {
      const searchUrl = `${this.baseUrl}/tim-kiem?keyword=${encodeURIComponent(query)}`;

      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
          'Referer': 'https://bluphim.me/',
        },
        timeout: 30000,
      });

      const $ = cheerio.load(response.data);
      const results: Array<{ title: string; url: string; thumbnail: string }> = [];

      $('.movie-item, .film-item, .item').each((_, el) => {
        const $el = $(el);
        const title = $el.find('.title, h3, a').first().text().trim();
        const link = $el.find('a').first().attr('href');
        const thumbnail = $el.find('img').first().attr('src') || '';

        if (title && link) {
          results.push({
            title,
            url: this.normalizeUrl(link),
            thumbnail: this.normalizeUrl(thumbnail),
          });
        }
      });

      return results;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      console.error('Error searching bluphim:', error);
      }
      return [];
    }
  }

  private extractM3U8Url($: cheerio.CheerioAPI): string {
    try {
      const scripts = $('script').toArray();
      
      for (const script of scripts) {
        const scriptContent = $(script).html() || '';
        
        const allSourcesMatch = scriptContent.match(/var\s+all_sources\s*=\s*\[(.*?)\]/s);
        if (allSourcesMatch) {
          const urlMatch = allSourcesMatch[1].match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/);
          if (urlMatch) {
            return urlMatch[1];
          }
        }
      }

      for (const script of scripts) {
        const scriptContent = $(script).html() || '';

        const m3u8Match = scriptContent.match(/https?:\/\/[^\s"']+\.m3u8[^\s"']*/g);
        if (m3u8Match && m3u8Match.length > 0) {
          return m3u8Match[0];
        }

        const videoMatch = scriptContent.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/);
        if (videoMatch) {
          return videoMatch[1];
        }
      }

      const dataUrl = $('[data-url], [data-src], [data-file]').first().attr('data-url') ||
        $('[data-url], [data-src], [data-file]').first().attr('data-src') ||
        $('[data-url], [data-src], [data-file]').first().attr('data-file');

      if (dataUrl && dataUrl.includes('.m3u8')) {
        return this.normalizeUrl(dataUrl);
      }

      return '';
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      console.error('Error extracting m3u8:', error);
      }
      return '';
    }
  }

  private extractEpisodes($: cheerio.CheerioAPI): Array<{ episode: number; url: string; title?: string }> {
    const episodes: Array<{ episode: number; url: string; title?: string }> = [];

    $('.episodes-grid .episode-item').each((_, el) => {
      const $el = $(el);
      const $link = $el.is('a') ? $el : $el.find('a').first();
      const episodeNumberText = $el.find('.episode-number').first().text().trim();
      
      const episodeMatch = episodeNumberText.match(/Tập\s*(\d+)/i);
      
      if (episodeMatch) {
        const episodeNum = parseInt(episodeMatch[1]);
        const url = $link.attr('href') || $el.attr('href') || '';

        if (episodeNum > 0) {
          const exists = episodes.find(ep => ep.episode === episodeNum);
          if (!exists) {
            episodes.push({
              episode: episodeNum,
              url: url ? this.normalizeUrl(url) : '',
              title: episodeNumberText,
            });
          }
        }
      }
    });

    if (episodes.length === 0) {
      $('a[href*="tap-"], a[href*="episode"], a[href*="ep-"]').each((_, el) => {
        const $el = $(el);
        const text = $el.text().trim();
        const episodeMatch = text.match(/Tập\s*(\d+)/i);

        if (episodeMatch) {
          const episodeNum = parseInt(episodeMatch[1]);
          const url = $el.attr('href') || '';

          if (episodeNum > 0) {
            const exists = episodes.find(ep => ep.episode === episodeNum);
            if (!exists) {
              episodes.push({
                episode: episodeNum,
                url: url ? this.normalizeUrl(url) : '',
                title: `Tập ${episodeNum}`,
              });
            }
          }
        }
      });
    }

    return episodes.sort((a, b) => a.episode - b.episode);
  }

  private normalizeUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return `https:${url}`;
    if (url.startsWith('/')) return `${this.baseUrl}${url}`;
    return `${this.baseUrl}/${url}`;
  }
}
