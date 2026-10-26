/**
 * The public origin, defined once.
 *
 * Vercel serves the site on www and 308-redirects the apex to it, so an
 * absolute URL built on the apex (`https://tameeresehat.com/...`) points at a
 * redirect rather than at a page. Canonicals, Open Graph, JSON-LD and the
 * sitemap must all agree on the host that actually answers with a 200.
 */
export const SITE_URL = "https://www.tameeresehat.com";
