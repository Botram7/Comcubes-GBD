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
  employeeCount: string | null;
  revenueEstimate: string | null;
  foundedYear: number | null;
  companySize: string | null;
  specializationTags: string | null;
  verificationStatus: string | null;
  countryName?: string; // Optional - only present in geography API responses
  regionName?: string; // Optional - only present in geography API responses
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
