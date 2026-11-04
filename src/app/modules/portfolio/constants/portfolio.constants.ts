import type { PublicPortfolio } from '../interfaces/portfolio.interface';

/** Same-origin Worker endpoint with the published services and projects. */
export const PORTFOLIO_PUBLIC_API = '/api/public';

/** Caption under a service cover when the service has no `tag`. */
export const DEFAULT_SERVICE_CAPTION = 'EXPLORACIÓN VISUAL';

/** A caption equal to this tag is hidden (legacy rule, data untouched). */
export const HIDDEN_SERVICE_CAPTION = 'ENFOQUE';

export const EMPTY_PORTFOLIO: PublicPortfolio = {
  media: [],
  projects: [],
  services: [],
};
