export interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  backdrop: string;
  genres: string[];
  duration: number;
  releaseDate: string;
  rating: number;
  viewCount: number;
  videoUrl?: string;
  trailerUrl?: string;
  isFeatured: boolean;
  isPremium: boolean;
  cast?: string[];
  directors?: string[];
  createdAt: string;
  updatedAt: string;
  episode?: string;
  url?: string;
  quality?: string;
}
