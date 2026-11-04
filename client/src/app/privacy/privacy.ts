import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TIP_URL } from '../core/support';

/** Public, fully static page: no database, so crawlers see all of it in the prerendered HTML. */
@Component({
  selector: 'app-privacy',
  imports: [RouterLink],
  templateUrl: './privacy.html',
})
export class Privacy {
  /** The tip line below only appears once a tip link exists. */
  protected readonly hasTipLink = !!TIP_URL;
}
