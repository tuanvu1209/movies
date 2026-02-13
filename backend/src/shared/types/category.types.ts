import { HomepageData } from './homepage.types';

export interface CategoryPagination {
  currentPage: number;
  totalPages: number;
  prevPage: number | null;
  nextPage: number | null;
}

export interface CategoryPageResult {
  data: HomepageData;
  pagination?: CategoryPagination;
}
