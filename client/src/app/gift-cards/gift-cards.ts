import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Public, fully static guide: no database, so crawlers see all of it in the prerendered HTML. */
@Component({
  selector: 'app-gift-cards',
  imports: [RouterLink],
  templateUrl: './gift-cards.html',
})
export class GiftCards {}
