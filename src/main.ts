import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

try {
  await bootstrapApplication(AppComponent, {
    providers: []
  });
} catch (err) {
  console.error(err);
}
