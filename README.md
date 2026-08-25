# wAIbi-sabi

Applied-AI journal by Janmejai Singh Minhas, plus an interview-prep news archive.
Built with Astro 5. Content is controlled from Notion.

## Develop

```
cd site
npm install
npm run dev      # http://localhost:4321
npm run build    # → site/dist
```

## Structure

- `site/src/content/blog/` — articles (Markdown, schema-validated)
- `site/src/data/news.json` — interview news archive, synced from Notion
- `site/src/pages/news/` — card archive with filter/sort/search
- `wabi-sabi-template.html` — original design reference

## Sync the news archive

```
node scripts/sync-news.mjs
```

Requires the Notion DB to be shared with the integration holding `NOTION_TOKEN`.

## Notion control plane

- **AI Blog OS Pipeline** — radar ideas with a 100-word pitch; you set Interest Rating + Remarks
- **Article Production** — approved ideas promoted here and drafted

Two scheduled tasks drive it: `daily-ai-seo-radar` (7:10am) and `ai-article-writer` (every 4h).
