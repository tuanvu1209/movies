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

export interface IVideoProvider {
  getMovieInfo(url: string, episode?: number): Promise<VideoProviderMovieInfo | null>;
  getHomepage(): Promise<VideoProviderHomepageData | null>;
}
