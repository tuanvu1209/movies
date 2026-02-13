import { Injectable } from '@nestjs/common';
import { BluphimScraperService, BluphimMovieInfo } from './bluphim-scraper.service';
import { BluphimHomepageService } from './bluphim-homepage.service';
import { BluphimSearchService } from './bluphim-search.service';
import { HomepageData } from '../shared/types/homepage.types';
import { NavItem } from '../shared/types/nav.types';
import { CategoryPageResult } from '../shared/types/category.types';
import { SearchResult } from '../shared/types/search.types';

@Injectable()
export class BluphimService {
  constructor(
    private bluphimScraper: BluphimScraperService,
    private bluphimHomepage: BluphimHomepageService,
    private bluphimSearch: BluphimSearchService,
  ) {}

  async getMovieInfo(bluphimUrl: string, episode: number = 1): Promise<BluphimMovieInfo | null> {
    return this.bluphimScraper.getMovieInfo(bluphimUrl, episode);
  }

  async getHomepage(): Promise<HomepageData | null> {
    return this.bluphimHomepage.getHomepageData();
  }

  async getCategoryData(slug: string, page: number = 1): Promise<CategoryPageResult | null> {
    return this.bluphimHomepage.getCategoryData(slug, page);
  }

  async getSearch(query: string): Promise<SearchResult[]> {
    return this.bluphimSearch.search(query);
  }

  /** Nav menu data (title + url) from site header. */
  async getNav(): Promise<NavItem[]> {
    return [
      { title: 'Trang Chủ', url: 'https://bluphim.me/' },
      {
        title: 'Thể Loại',
        url: '#',
        children: [
          { title: 'Bí Ẩn', url: 'https://bluphim.me/bi-an/' },
          { title: 'Chính Kịch', url: 'https://bluphim.me/chinh-kich/' },
          { title: 'Cổ Trang', url: 'https://bluphim.me/co-trang/' },
          { title: 'Gia Đình', url: 'https://bluphim.me/gia-dinh/' },
          { title: 'Hài Hước', url: 'https://bluphim.me/hai-huoc/' },
          { title: 'Hành Động', url: 'https://bluphim.me/hanh-dong/' },
          { title: 'Hình Sự', url: 'https://bluphim.me/hinh-su/' },
          { title: 'Khoa Học', url: 'https://bluphim.me/khoa-hoc/' },
          { title: 'Kinh Dị', url: 'https://bluphim.me/kinh-di/' },
          { title: 'Phiêu Lưu', url: 'https://bluphim.me/phieu-luu/' },
          { title: 'Tâm Lý', url: 'https://bluphim.me/tam-ly/' },
          { title: 'Tình Cảm', url: 'https://bluphim.me/tinh-cam/' },
          { title: 'Viễn Tưởng', url: 'https://bluphim.me/vien-tuong/' },
        ],
      },
      {
        title: 'Quốc Gia',
        url: '#',
        children: [
          { title: 'Trung Quốc', url: 'https://bluphim.me/country/trung-quoc/' },
          { title: 'Hàn Quốc', url: 'https://bluphim.me/country/han-quoc/' },
          { title: 'Âu Mỹ', url: 'https://bluphim.me/country/au-my/' },
        ],
      },
      { title: 'Phim bộ', url: 'https://bluphim.me/phim-bo/' },
      { title: 'Phim lẻ', url: 'https://bluphim.me/phim-le/' },
      { title: 'Phim chiếu rạp', url: 'https://bluphim.me/phim-chieu-rap/' },
      { title: 'Hoạt Hình', url: 'https://bluphim.me/hoat-hinh/' },
    ];
  }
}
