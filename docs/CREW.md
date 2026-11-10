# The crew: how they work now

Written 2026-11-11. This replaces the "5-crew Bayesian ML terrarium" described in
`HANDOFF_TERRARIUM_ENGINE.md`, `CREW-TERRARIUM-SPEC.md` and
`KINTSUGI-PLAYABLE-TERRARIUM.md`. Those files describe code that no longer exists.

## The one rule

The crew react to things that are true about the reader: they broke a claim, they
mended it, they skimmed, they reached the sources, they left and came back, they
finished. Nothing happens on a timer by itself. An idle page shows no motion and
speaks no lines.

They also never float over text. A character sits in a fixed place in the layout,
and what they say is set in a slot in that layout, in the serif, like any other
line on the page.

## Where they appear

| Place | Who | What sets it off |
|---|---|---|
| Homepage hero, the seat at the end of the cue row | Oops at rest, with his hammer | Clicking the plate: Oops swings, and the claim breaks and **stays broken** |
| Same seat | Tsugi | The reader holds the plate to pour the gold, and the finding is written in as it fills. After 2.4 s with no pour, Tsugi mends it instead. Only a repair the reader did gets a line, and only that one is counted (`waibi:mended`) |
| Same seat | Kiki | A returning visitor with pieces newer than their last visit: "{n} new since you were last here" |
| Article, the contents seam (wide screens) | The piece's cast character (`pickCrew`) | Stands on the tip of the gold seam, driven by the same `--seam` value that draws it. Skimming at over 3 screens/s, reaching `#sources`, coming back after 90 s away, or sitting still for 75 s (tea, no line) |
| Article, the closing plate | The same character | Once the shard lands in the bowl and the piece is in `waibi:read`: the real count, "{n} of {total} in your bowl" |
| Article credit | The same character | Static: "On this piece / Uso doubts / one joke line" |
| Homepage question list, beside the bowl | Each piece's cast character | Previewing a question (hover or keyboard focus) shows who is on it: "With Uso, who doubts." The same character the reader then meets inside |
| Article, "Next question" | The next piece's cast character | Static, beside the link: the reader is handed from one character to the next |
| Article, contents seam | The piece's character | Following "Pick up where you left off": "Right where you left it." |

## Scenes on the edge (homepage)

The broken gold edge between the plate and the paper is the crew's stage
(`site/src/scripts/edge-scenes.ts`). Characters stand on the line itself, which
sits in empty space on every screen size, so nothing covers a word, and taps
pass straight through. The stage clips sideways only, so walking off an end
never scrolls the page.

| Scene | Who | What happens |
|---|---|---|
| `surf` | Kiki | Rides a gold shard the length of the seam, tilting with its slope; the seam glows behind her |
| `gild` | Tsugi | After a mend, hops down from the seat and repaints the seam as he walks it, then takes a bow |
| `tumble` | Oops | After a strike (always the first one, then about a third of the time), hops down from the seat, runs across the plate, catches a foot on the steepest step and goes over the edge; climbs back into the seat later |
| `inspect` | Uso | Walks in, holds the loupe to the seam, is not convinced, leaves |
| `ledger` | Fude | Walks out, writes the visit down on the seam, walks back |

When they play: about 2 s after landing if the edge is on screen, when the edge
is scrolled into view, after a strike or a mend, and after 14 s of quiet with
the edge visible. One at a time, at most four per page view, with a 16 s gap
between ambient scenes (replies to a strike or mend skip the gap). Ambient
scenes give way for 6 s after the reader touches the plate. The site remembers
which scenes this visitor has seen (`waibi:scenes`), so a return visit brings
someone new. Reduced motion hides the stage's actors entirely.

Cue buttons, auto-play, keyboard use and reduced motion never leave a claim
broken. Only a pointer click on the plate does.

## Casting

`pickCrew()` in `crew.ts` scores each piece's words against each character's job:
title words count 4, the question 2, keywords 1, and near-ties rotate by slug. Failures,
autopsies, flaws and attacks go to Oops; claims, hype and grading go to Uso; cost and
tokens go to Kiki; agents and protocols go to Fude; models, benchmarks and basics go to Tsugi.

## Files

- `site/src/lib/crew.ts`: the drawings (5 bodies × 16 moods) and `pickCrew()`.
- `site/src/lib/crew-lines.ts`: **everything the crew say**. Edit the voice here.
  Lines are jokes about the crew, never claims about an article.
- `site/src/lib/crew-director.ts`: restraint. A quiet gap between lines, a budget
  per page view, once-only and cooldown rules. Pure, with no DOM.
- `site/src/lib/crew-actor.ts`: the browser side, covering moods, gaze, the in-layout
  speech slot, and optional walking. Its loop only runs while something moves.
- `site/src/components/CrewActor.astro`: renders every mood a character needs at
  build time; the browser only switches between them.
- `site/scripts/test-crew.mjs`: runs first in `npm run build`. It checks the
  director's rules against hand-worked timelines and that every line fills cleanly.

## Changing things

- New line: add it to `crew-lines.ts`. The build fails if it has a `{hole}` no
  page fills or runs past 80 characters.
- New moment: add it to `Moment` in `crew-lines.ts`, give it a rule in the page's
  `createDirector({ rules })`, and call it only from a real reader event.
- New mood in a seat: add it to the `moods` list of that `<CrewActor>`.
