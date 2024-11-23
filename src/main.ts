import { bootstrapApplication } from '@angular/platform-browser';
import { ServiceWorkerModule, provideServiceWorker } from '@angular/service-worker';
import { importProvidersFrom, isDevMode } from '@angular/core';
import { MainComponent } from './app/main/main.component';

bootstrapApplication(MainComponent, {
  providers: [provideServiceWorker('ngsw-worker.js', {
              enabled: !isDevMode(),
              registrationStrategy: 'registerWhenStable:30000'
            })]
});