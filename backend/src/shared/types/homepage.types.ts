export interface HomepageMovie {
  title: string;
  url: string;
  thumbnail: string;
  quality?: string;
  episode?: string;
  rating?: number;
  viewCount?: string;
}

export interface HomepageCategory {
  data: HomepageMovie[];
  title: string;
}

export type HomepageData = HomepageCategory[];
