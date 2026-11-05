import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  type ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

/**
 * Replaces app.config.ts in the `site` build (angular.json fileReplacements),
 * the public portfolio served by the Worker. It only calls its own
 * same-origin `/api/public`, so it skips `provideMfHttpClient()` and its host
 * plumbing (encrypted storage, device detection) to keep the bundle small.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
  ],
};
