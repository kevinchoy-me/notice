import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

/** Sets each page's title and meta description from its route, during prerender and in the browser. */
@Injectable({ providedIn: 'root' })
export class PageTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot);
    if (title) this.title.setTitle(title);

    let route = snapshot.root;
    while (route.firstChild) route = route.firstChild;
    const description = route.data['description'] as string | undefined;
    if (description) this.meta.updateTag({ name: 'description', content: description });
  }
}
