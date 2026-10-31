import { canonicalUrl } from './seo';

describe('canonicalUrl', () => {
  it('uses the bare domain for the home page', () => {
    expect(canonicalUrl('/')).toBe('https://occura.co/');
    expect(canonicalUrl('')).toBe('https://occura.co/');
  });

  it('drops trailing slashes, queries and fragments', () => {
    expect(canonicalUrl('/about')).toBe('https://occura.co/about');
    expect(canonicalUrl('/about/')).toBe('https://occura.co/about');
    expect(canonicalUrl('/about?ref=x#top')).toBe('https://occura.co/about');
  });
});
