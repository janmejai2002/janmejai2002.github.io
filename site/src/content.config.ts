import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/blog',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  // The `image()` helper resolves paths relative to the markdown file and hands
  // back real dimensions, which is what lets <Image> reserve space up front.
  schema: ({ image }) =>
    z
      .object({
        title: z.string().max(70),
        description: z.string().max(160),
        pubDate: z.coerce.date(),
        // Which theme this belongs to. The index filters on it and each theme
        // has its own research routine feeding the Notion radar.
        //   technical — how AI actually works and breaks
        //   business  — what it means for consulting, marketing, strategy
        //   basics    — AI explained simply, trends, and the setups I build
        // Defaults to technical, which is what every pre-theme post is.
        track: z.enum(['technical', 'business', 'basics']).default('technical'),
        // The question the piece answers, in the reader's own words. Printed
        // above the title and on the index card.
        question: z.string().max(120).optional(),
        updatedDate: z.coerce.date().optional(),
        keywords: z.array(z.string()).default([]),
        draft: z.boolean().default(false),
        readingTime: z.string().optional(),
        // Back-reference to the Article Production row this came from. It is
        // what lets close-loop.mjs find the Notion row again after a deploy.
        notionId: z.string().optional(),

        // Artwork ships as a light/dark pair so nothing carries a baked-in
        // background into the wrong theme. See docs/ARTWORK.md.
        heroImage: image().optional(),
        heroImageDark: image().optional(),
        heroAlt: z.string().optional(),
        // Optional caption printed under the hero. Not a substitute for alt.
        heroCaption: z.string().optional(),
        // A 1200x630 raster for social cards. Falls back to the site default.
        ogImage: image().optional(),
      })
      // Alt text is not optional when there is an image to describe. Making this
      // a schema error rather than a lint rule means an inaccessible post cannot
      // reach the build at all.
      .superRefine((data, ctx) => {
        if (data.heroImage && !data.heroAlt?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['heroAlt'],
            message: 'heroAlt is required whenever heroImage is set.',
          });
        }
        if (data.heroImageDark && !data.heroImage) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['heroImageDark'],
            message: 'heroImageDark needs a heroImage to pair with.',
          });
        }
      }),
});

export const collections = { blog };
