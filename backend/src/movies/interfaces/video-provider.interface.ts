import { NavItem } from '../../shared/types/nav.types';
import { CategoryPageResult } from '../../shared/types/category.types';
import { SearchResult } from '../../shared/types/search.types';

export interface VideoProviderMovieInfo {
  title: string;
  m3u8Url: string;
  episodes?: Array<{
    episode: number;
    url: string;
    title?: string;
  }>;
}

export type VideoProviderHomepageData = Array<{ data: any[]; title: string }>;

/** Contract cho mọi site provider (bluphim, fptplay, ...). Chỉ khai báo switch case ở MovieProviderFactory. */
export interface IVideoProvider {
  getMovieInfo(url: string, episode?: number): Promise<VideoProviderMovieInfo | null>;
  getHomepage(): Promise<VideoProviderHomepageData | null>;
  /** Dữ liệu trang category (data + pagination), slug ví dụ: phim-bo, page: 1, 2, ... */
  getCategoryData(slug: string, page?: number): Promise<CategoryPageResult | null>;
  getSearch(query: string): Promise<SearchResult[]>;
  getNav(): Promise<NavItem[]>;
}
