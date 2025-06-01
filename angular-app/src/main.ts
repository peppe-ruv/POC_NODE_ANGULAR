import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module'; // Still using AppModule to bootstrap

// If AppModule was to be removed and AppComponent bootstrapped directly (Angular 15+):
// import { bootstrapApplication } from '@angular/platform-browser';
// import { AppComponent } from './app/app.component';
// import { provideRouter } from '@angular/router';
// import { routes } from './app/app-routing.module'; // Assuming routes are exported
// import { provideHttpClient } from '@angular/common/http';

// bootstrapApplication(AppComponent, {
//   providers: [
//     provideRouter(routes), // Provide router configuration
//     provideHttpClient()    // Provide HttpClient
//     // Other global providers
//   ]
// }).catch(err => console.error(err));

// Sticking with AppModule-based bootstrap for now as it's less disruptive from previous step
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
