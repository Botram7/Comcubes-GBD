export interface Sector {
  id: number;
  name: string;
}

export interface Industry {
  id: number;
  name: string;
  sectorName: string;
}

export interface Company {
  id: number;
  name: string;
  websiteUrl: string | null;
  industryName: string;
  sectorName: string;
}

export interface SearchResults {
  sectors: Sector[];
  industries: Industry[];
  companies: Company[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
