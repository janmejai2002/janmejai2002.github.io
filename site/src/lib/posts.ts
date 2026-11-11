/**
 * Newest post first. Same-day posts (pubDate is a date, no time) are ordered by
 * publishedAt, the timestamp publish-article.mjs writes, so a freshly published
 * article leads its day instead of landing wherever its slug sorts. Posts
 * without publishedAt (older ones) follow, then reverse slug as the last resort.
 */
type Dated = { id: string; data: { pubDate: Date; publishedAt?: Date } };

export const newestFirst = (a: Dated, b: Dated) =>
  b.data.pubDate.valueOf() - a.data.pubDate.valueOf() ||
  (b.data.publishedAt?.valueOf() ?? 0) - (a.data.publishedAt?.valueOf() ?? 0) ||
  b.id.localeCompare(a.id);
