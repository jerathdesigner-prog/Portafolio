/** Public content served by the Worker (`GET /api/public`). */
export interface PublicPortfolio {
  media: PortfolioMedia[];
  projects: PortfolioProject[];
  services: PortfolioServiceItem[];
}

export interface PortfolioServiceItem {
  coverMediaId?: null | string;
  id: string;
  order?: number;
  slug?: string;
  subtitle?: string;
  tag?: string;
  title: string;
}

export interface PortfolioProject {
  coverMediaId?: null | string;
  description?: string;
  id: string;
  media?: PortfolioProjectMedia[];
  order?: number;
  serviceId: string;
  tag?: string;
  title: string;
}

export interface PortfolioProjectMedia {
  layout?: string;
  mediaId: string;
}

export interface PortfolioMedia {
  id: string;
  kind: 'audio' | 'image' | 'video' | string;
  url: string;
}
