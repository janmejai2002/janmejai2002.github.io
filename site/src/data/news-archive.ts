import news from './news.json';

export type NewsItem = {
  headline: string;
  date: string;
  category: string;
  summary: string;
  angle: string;
  source: string | null;
};

export const allNews = (news as NewsItem[]).slice().sort((a, b) => b.date.localeCompare(a.date));

export const catSlug = (c: string) => c.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export const categories = [...new Set(allNews.map((i) => i.category))].sort();

// A month with a handful of stories would be a thin page; those stories are
// still reachable through their function's archive.
const monthCounts = allNews.reduce<Record<string, number>>((acc, i) => {
  const m = i.date.slice(0, 7);
  acc[m] = (acc[m] ?? 0) + 1;
  return acc;
}, {});
export const months = Object.keys(monthCounts)
  .filter((m) => monthCounts[m] >= 10)
  .sort((a, b) => b.localeCompare(a));

export const monthLabel = (m: string) =>
  new Date(`${m}-01T00:00:00Z`).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
