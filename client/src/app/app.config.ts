import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { TitleStrategy, provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { PageTitleStrategy } from './core/seo';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // The router reports scroll positions; CalmScrolling (core/scroll.ts) does the scrolling:
    // a smooth glide to the top for new pages, an instant return on Back and Forward.
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'disabled' })),
    provideClientHydration(),
    { provide: TitleStrategy, useClass: PageTitleStrategy },
    // Offline support for production builds. Registers once the app is idle (or after 30s),
    // so it never competes with the first page load.
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
