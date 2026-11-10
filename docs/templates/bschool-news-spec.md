# BSchool News page: redesign spec

Every design and copy decision is made here. Implement it exactly. If something
cannot be built as written, stop and report it instead of designing an alternative.

Files: `site/src/pages/news/index.astro`, `site/src/pages/news/[archive].astro`,
`site/src/components/NewsBrowser.astro`, `site/src/components/NewsNav.astro`.
Data comes from `site/src/data/news-archive.ts`. Do not change `news.json`,
`scripts/sync-news.mjs`, or anything else in the news pipeline.

## Who it is for

An MBA student on a phone, ten minutes before a mock interview. They want to know
what happened, what they will be asked about it, and whether they could answer.

## Page structure, top to bottom

**1. Dark plate** (`docs/templates/new-page.astro.txt`, seed `news`, `<Base immersive grain={false}>`)
- H1: `What will they ask you about today?`
- Paragraph: `A daily business-news digest for Indian B-school interviews. Every story comes with the angle an interviewer is likely to push on.`
- Stat line, `--tldr-dim`, .9375rem: `{N} stories today · {total} in the archive`. If there are no stories dated today, use the latest date: `{N} stories on {date}`.
- Right side of the plate, from 48rem up: `<Crew who="kiki" mood="listen" />`, 7rem, with a `.crew-say` bubble: `I read the business pages so you can pretend you did.` Parent needs `on-plate`. Hidden below 48rem.
- Keep the page `<title>`, description, keywords and `pageType` exactly as they are.

**2. Function doors**: the `.doors` pattern from the homepage, one door per category plus All, each with its count. Accent per category:
Consulting `--hanko`, Finance `--ochre`, Marketing `--mizu`, Operations `--moss`, Product Management `--indigo`. All uses `--ink`. No icons. The second line of each door:
- All: `Everything, newest first`
- Consulting: `Frameworks and client problems`
- Finance: `Markets, deals and numbers`
- Marketing: `Brands, pricing and consumers`
- Operations: `Supply chains and unit economics`
- Product Management: `Users, metrics and trade-offs`

**3. Toolbar**: search input (`.find input` styling) and the existing sort select, on one row, sticky at the top of the screen while scrolling, on `--paper` with a bottom `--border`. A toggle button styled `.linkish`, text `Test me: hide the angles`, and when on, `Show the angles`.

**4. Days**
- Group by day, newest first. Reuse the existing grouping.
- From 64rem up, a two-column grid: day label in a 13.5rem sticky left column, cards on the right. Below 64rem the label sits above its cards.
- Label: day in Inter 800 1.25rem, `Tuesday, 10 November`, then count in `--ink-soft`. A thin gold seam runs down the left column, `--ochre`, 2px.
- The first day shows its first story as a lead card spanning the full width. All others are a grid: 3 columns at 84rem and up, 2 at 48rem, 1 below.

**5. Card**, top to bottom:
1. Meta row: category dot in its accent, category name, date. .8125rem, 600, sentence case. Remove the uppercase letter-spaced treatment.
2. Headline: Inter 700, 1.125rem, 1.25 line height. On the lead card, Newsreader 500, clamp(1.625rem, 3vw, 2.25rem).
3. Summary: .9375rem, `--ink-soft`, clamped to 4 lines.
4. Angle panel, always the visual focus. Background: the category's wash at the card's bottom. Left border 2px `--ochre`. Label `They will push on`, Inter 700 .8125rem. Angle text in Newsreader 1.0625rem, `--ink`.
5. Source link, if the data has one, `.linkish` at .875rem.

Card background `--card`, 1px `--border`, radius `14px 14px 14px 3px`. Hover: border takes the category accent. No lift, no shadow, no per-card animation.

**6. Test me mode**: when on, each angle panel shows `What would they ask you about this?` in Newsreader and a button `Show the angle`. Pressing it reveals that angle and adds the story to `waibi:news:practised` using the `store` pattern. A practised card shows a `.q__flag` reading `Practised`. Toolbar shows `{n} practised` when n is above zero.

**7. Empty search**: `<Crew who="oops" mood="shrug" />` at 4.5rem and `Nothing matches that. Try a company name, or clear the search.`

**8. Archive pages** use the same plate, doors, toolbar and cards. H1 stays the archive's existing heading. Skip the lead card.

## Acceptance

- `npm --prefix site run build` passes.
- No horizontal scroll at 320, 390, 768, 1024, 1440, 1920.
- No hex colours added. All text at least 4.5:1, or 3:1 at large sizes, in light, OS dark and toggle dark. Category accents as small text on `--paper` often fail in light: use `--ink` text with an accent dot instead.
- Test me works with a keyboard, and the page works with JavaScript off (angles visible, toggle hidden).
- Reduced motion shows no movement.
