import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable, catchError, of } from 'rxjs';

import {
  EMPTY_PORTFOLIO,
  PORTFOLIO_PUBLIC_API,
} from '../constants/portfolio.constants';
import type { PublicPortfolio } from '../interfaces/portfolio.interface';

declare global {
  interface Window {
    /** Injected into index.html by the Worker to skip the first request. */
    jmPortfolioData?: PublicPortfolio;
  }
}

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly http = inject(HttpClient);

  /**
   * Content embedded by the Worker when present, otherwise `/api/public`.
   * Never fails: without content the page shows its "coming soon" panel.
   */
  load(): Observable<PublicPortfolio> {
    const embedded = globalThis.window?.jmPortfolioData;
    if (embedded) {
      return of(embedded);
    }
    return this.http
      .get<PublicPortfolio>(PORTFOLIO_PUBLIC_API)
      .pipe(catchError(() => of(EMPTY_PORTFOLIO)));
  }
}
