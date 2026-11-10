/**
 * Everything the crew say, in one place, so the voice can be edited without
 * touching any code. {n}-style holes are filled with real numbers by the page.
 *
 * The rule from DESIGN-SYSTEM.md holds: lines are jokes about the crew, never
 * factual claims about an article. A line may point at the page ("the short
 * version is up top"), but it never vouches for what the page says.
 */
import type { Who } from './crew';

export type Moment =
  | 'mended-reader' // the reader poured the gold on a homepage claim
  | 'strike-again'  // the reader has broken three claims in a row
  | 'new-since'     // there are pieces newer than this reader's last visit
  | 'skim'          // the reader is racing through an article
  | 'sources'       // the reader reached the sources
  | 'back'          // the reader left the tab for a while and came back
  | 'resume'        // the reader followed "pick up where you left off"
  | 'finished'      // the reader reached the end, at a reading pace
  | 'quick';        // the reader reached the end very quickly

type Lines = Partial<Record<Who, string[]>> & { any?: string[] };

export const LINES: Record<Moment, Lines> = {
  'mended-reader': {
    tsugi: [
      'Steady hand. I will tell people I did that.',
      'That seam is yours now.',
      'Not bad. The gold always goes on thicker than you think.',
    ],
  },
  'strike-again': {
    oops: ['In my defence, they were like that when I got here.'],
  },
  'new-since': {
    kiki: ['{n} new since you were last here.'],
  },
  skim: {
    tsugi: ['Slow down. The gold is still wet.'],
    oops: ['Careful, I dropped something back there.'],
    kiki: ['I listened so you can skim. The short version is up top.'],
    fude: ['I wrote all of that, you know.'],
    uso: ['Skimming? I would at least check the denominators.'],
  },
  sources: {
    tsugi: ['Here is where the gold came from.'],
    oops: ['If something broke, the receipt is down here.'],
    kiki: ['This is where I did my listening.'],
    fude: ['The receipts. I kept all of them.'],
    uso: ['Do not take my word for it. I never do.'],
  },
  back: {
    any: ['Oh. You are back.', 'I kept your place.', 'Your tea went cold.'],
  },
  resume: {
    any: ['Right where you left it.'],
  },
  finished: {
    tsugi: ['Mended. That is {n} of {total} in your bowl.'],
    oops: ['Nothing broke! {n} of {total} in your bowl.'],
    kiki: ['{n} of {total} heard. I will keep listening.'],
    fude: ['Logged: {n} of {total} pieces in your bowl.'],
    uso: ['You read to the end. Suspicious. {n} of {total}.'],
  },
  quick: {
    any: ['That was quick. I will count it anyway: {n} of {total}.'],
  },
};

export function linesFor(moment: Moment, who: Who): string[] {
  const set = LINES[moment];
  return set[who] ?? set.any ?? [];
}

/** The one-word job each character does, for credits and the crew page. */
export const JOB: Record<Who, string> = {
  tsugi: 'mends',
  oops: 'breaks things',
  kiki: 'listens',
  fude: 'writes it down',
  uso: 'doubts',
};
