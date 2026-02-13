export interface MovieInfo {
  title: string;
  description: string;
  thumbnail: string;
  backdrop: string;
  genres: string[];
  rating: number;
  duration: number;
  releaseDate: string;
  m3u8Url: string;
  viewCount?: number;
  episodes?: Array<{
    episode: number;
    url: string;
    title?: string;
  }>;
}
