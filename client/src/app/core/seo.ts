import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

/**
 * The public address of the site. Canonical links, Open Graph URLs and public/sitemap.xml use it.
 * occura.co is connected to the Cloudflare Worker; if the domain ever changes, update this
 * and the URLs in public/robots.txt and public/sitemap.xml together.
 */
export const SITE_URL = 'https://occura.co';

/** Canonical address for a router URL: no query or fragment, no trailing slash (matches Cloudflare's drop-trailing-slash). */
export function canonicalUrl(routerUrl: string): string {
  const path = routerUrl.split(/[?#]/)[0].replace(/\/+$/, '');
  return SITE_URL + (path || '/');
}

/**
 * Sets each page's title, meta description, canonical link and Open Graph tags
 * from its route, during prerender and in the browser.
 */
@Injectable({ providedIn: 'root' })
export class PageTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot);
    const url = canonicalUrl(snapshot.url);
    if (title) this.title.setTitle(title);

    let route = snapshot.root;
    while (route.firstChild) route = route.firstChild;
    const description = route.data['description'] as string | undefined;
    if (description) this.meta.updateTag({ name: 'description', content: description });

    this.setCanonical(url);

    // Open Graph: what chat apps and social sites show when a link is shared.
    this.meta.updateTag({ property: 'og:site_name', content: 'Occura' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: url });
    if (title) this.meta.updateTag({ property: 'og:title', content: title });
    if (description) this.meta.updateTag({ property: 'og:description', content: description });
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
