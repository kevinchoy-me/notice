import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Public, fully static page: no database, so crawlers see all of it in the prerendered HTML. */
@Component({
  selector: 'app-about',
  imports: [RouterLink],
  templateUrl: './about.html',
})
export class About {}
