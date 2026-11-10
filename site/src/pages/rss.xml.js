import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
  // Feed readers resolve nothing against the site, so root-relative links and
  // images have to be absolute in the full text.
  const origin = context.site.href.replace(/\/$/, "");
  const absolute = (html) => html.replace(/(href|src)="\/(?!\/)/g, `$1="${origin}/`);
  return rss({
    title: "wAIbi-sabi",
    description: "Applied-AI articles that start from a real question and cite their sources.",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id.replace(/\.md$/, "")}/`,
      content: post.rendered?.html ? absolute(post.rendered.html) : undefined,
    })),
    customData: `<language>en-in</language>`,
  });
}
