import type { Routes } from '@angular/router';

// The portfolio is the whole site. `modules/template` stays as the
// front-template reference module (exposed to a host, not routed here).
export const routes: Routes = [
  {
    loadChildren: () =>
      import('./modules/portfolio/portfolio.routes').then(
        (m) => m.PortfolioRoutes,
      ),
    path: '',
  },
  { path: '**', redirectTo: '' },
];
