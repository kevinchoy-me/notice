import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Public, fully static guide: no database, so crawlers see all of it in the prerendered HTML. */
@Component({
  selector: 'app-guide',
  imports: [RouterLink],
  templateUrl: './guide.html',
})
export class Guide {}
