import type { Routes } from '@angular/router';

// Standalone-dev routing: mirrors how the host mounts the exposed routes
// (typeRemote 'module' -> loadChildren). The host uses the manifest `path`;
// here the module is served under the same kind of prefix.
export const routes: Routes = [
  {
    loadChildren: () =>
      import('./modules/template/template.routes').then(
        (m) => m.TemplateRoutes,
      ),
    path: 'template',
  },
  { path: '', pathMatch: 'full', redirectTo: 'template' },
];
