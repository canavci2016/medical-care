export class UrlHelper {
  static canonicalUrl(path = '/'): string {
    const baseUrl = (process.env.APP_URL || 'https://hairresult.com').replace(
      /\/+$/,
      '',
    );
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return baseUrl + normalizedPath;
  }
}
