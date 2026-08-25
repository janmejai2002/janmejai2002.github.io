# Lessons

The running notes file. Read it at the start of a session; add to it as you go.

**Convention:** one lesson per entry, a one-line summary as the heading, then
why it mattered. Record confirmed approaches as well as corrections. Don't
record what the repo or git history already says. Update an existing entry
rather than adding a near-duplicate, and delete an entry that turns out to be
wrong.

`docs/HANDOFF.md` §6 holds the older consolidated gotchas about this machine and
this build. New lessons go here.

---

## The Bash tool's cygwin failure is intermittent, not permanent

It failed for entire sessions on 24–25 Aug 2026 and worked for an entire session
on 26 Aug. Every handoff until now recorded it as simply broken, which cost real
time working around a tool that was fine. Try it once; fall back to PowerShell if
it dies. Even when Bash works, `git` under it occasionally fails with "the paging
file is too small" — just re-run.

## A spec that gets quietly contradicted is worse than one that gets changed

`docs/ARTWORK.md` is strict about restraint. When a request arrives that conflicts
with it — as the owner's "make it exciting" brief does — the move is to revise the
spec deliberately with the owner, not to ship work that violates it and leave the
document standing as a lie. The spec's value is that it can be trusted.

## Build assertions earn their keep; do not relax them under deadline

The 160-character description cap rejected the rewritten
`how-this-blog-builds-itself` frontmatter on 26 Aug 2026. The right response was
to write a shorter description, which took a minute. The tempting response — widen
the cap — would have removed the only thing standing between the site and a
truncated search result. Same for `check-build.mjs`. These have now each caught
real defects more than once.

## Verify rendered output, not source, after editing article markdown

Inline SVG in markdown fails in a way that leaves the container intact and guts
the contents, so a source diff looks perfect. After editing any article with
diagrams, count `<text>` nodes and grep for escaped markup (`&lt;svg`) in
`dist/`, not in the `.md`. That check caught nothing on 26 Aug — which is the
point; it is cheap and it is the only way to know.

## The owner works in Notion, so failures must surface in Notion

Not in an Actions log, not in a red build badge. This was learned once already
with the publish pipeline's blocked-reason writeback, and it generalises: an
error message delivered where the person isn't looking is not error handling.
Applies to anything new that can fail unattended.

## Unattended automation may only use credentials that cannot expire

The standing architectural rule on this project. It is why `talks-writer` reads
public captions anonymously instead of using NotebookLM, and it is why IndexNow
(a static key file, no login, no token) fits this system so well. It has thrown
out more otherwise-good designs here than any question about model choice.

## An automated PR branch will destroy anything a human adds to it

`publish-from-notion` polls twice an hour and `peter-evans/create-pull-request`
resets `notion/approved-articles` from main on every run. Artwork or a TL;DR
committed to that branch survives only until the next poll, for as long as the
Notion rows are still approved and unpublished. The durable move is to put
additions on `main`, and the real fix is to generate them before the PR is opened
so the branch never needs a human commit at all. Generalises: any branch a bot
owns is a branch a human should not commit to.

## A catch block can hide that a feature never worked at all

`publish-article.mjs` used `api()` for its tell-Notion write-back without ever
importing it. Every call threw `ReferenceError: api is not defined` — inside a
try/catch whose message ("could not update Notion for …") made the failure look
like a transient API problem instead of dead code. The write-back machinery was
documented, reasoned about, and load-bearing in the docs, and had never once
run. When a catch prints a generic message, log `err.message` verbatim and read
it once from a real run before trusting the feature exists.

## Check what the pipeline generates, not just that it generated something

The first two articles through the publish pipeline both shipped a body `# H1`
duplicating the frontmatter title the layout already renders, and neither carried
the `Executive TL;DR` its own writer prompt requires. The build passed and
`check-build` passed, because neither asserts on those. A green pipeline says the
plumbing works, not that the output is right.

