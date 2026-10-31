import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

/** The public address of the site. Canonical links and the sitemap use it. */
export const SITE_URL = 'https://occura.co';

/** Canonical address for a router URL: no query or fragment, no trailing slash (matches Cloudflare's drop-trailing-slash). */
export function canonicalUrl(routerUrl: string): string {
  const path = routerUrl.split(/[?#]/)[0].replace(/\/+$/, '');
  return SITE_URL + (path || '/');
}

/**
 * Sets each page's title, meta description and canonical link from its route,
 * during prerender and in the browser.
 */
@Injectable({ providedIn: 'root' })
export class PageTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot);
    if (title) this.title.setTitle(title);

    let route = snapshot.root;
    while (route.firstChild) route = route.firstChild;
    const description = route.data['description'] as string | undefined;
    if (description) this.meta.updateTag({ name: 'description', content: description });

    this.setCanonical(canonicalUrl(snapshot.url));
  }

  private setCanonical(href: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }
}
