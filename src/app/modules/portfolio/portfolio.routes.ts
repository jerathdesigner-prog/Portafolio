// A host never runs this remote's `polyfills`, so the exposed entry installs
// Temporal itself (only where the browser lacks it, e.g. Safari/iOS).
import 'temporal-polyfill/global';
import type { Routes } from '@angular/router';

/**
 * The public portfolio, mounted at `/` by app.routes.ts. Not exposed to a
 * federation host: it is served by the Cloudflare Worker as a standalone app.
 */
export const PortfolioRoutes: Routes = [
  {
    loadComponent: () =>
      import('./pages/portfolio-home/portfolio-home.page').then(
        (m) => m.PortfolioHomePage,
      ),
    path: '',
    title: 'Jerath Moreira — Diseño & Dirección Creativa',
  },
];
