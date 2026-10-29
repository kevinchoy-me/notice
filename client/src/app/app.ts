import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly links = [
    { path: '/', label: 'Home' },
    { path: '/subscriptions', label: 'Subscriptions' },
    { path: '/insights', label: 'Insights' },
  ];
}
