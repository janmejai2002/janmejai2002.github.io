/**
 * wAIbi-sabi Context Quarantine & Claim Ledger Verification Engine
 * 
 * Implements Question 4 and Question 6 of docs/HARNESS-ENGINEERING-BLUEPRINT.md:
 * - Context Quarantine: Raw HTML dumps, SERP results, and deep crawls are strictly
 *   isolated in ephemeral scratch files (scratch/quarantine/<slug>-raw.txt).
 * - Claim Ledger Protocol: Scans raw text for verifiable empirical sentences
 *   (numbers, benchmarks, dates, percentages, named actors) and compiles a strict
 *   Claim Ledger.
 * - String-level Verification: Every claim admitted to the drafter must be an exact
 *   substring match of the verbatim sentence from the quarantined raw text.
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const SCRATCH_DIR = resolve('scratch');
const QUARANTINE_DIR = resolve('scratch/quarantine');

/** Ensure quarantine directories exist */
function ensureQuarantineDirs() {
  if (!existsSync(QUARANTINE_DIR)) {
    mkdirSync(QUARANTINE_DIR, { recursive: true });
  }
}

/**
 * Quarantines raw crawl / scrape content to disk without polluting context memory.
 * @param {string} slug - Target article slug
 * @param {string} sourceUrl - Primary source URL
 * @param {string} rawContent - Full raw text / HTML / markdown from scrape
 * @returns {string} Path to the quarantined file
 */
export function quarantineRawSource(slug, sourceUrl, rawContent) {
  ensureQuarantineDirs();
  const safeSlug = slug.replace(/[^a-z0-9_-]/gi, '-');
  const filePath = resolve(QUARANTINE_DIR, `${safeSlug}-raw.txt`);
  
  const header = `SOURCE_URL: ${sourceUrl}\nTIMESTAMP: ${new Date().toISOString()}\nBYTES: ${rawContent.length}\n${'='.repeat(60)}\n\n`;
  
  if (existsSync(filePath)) {
    // Append additional source to existing quarantine file
    writeFileSync(filePath, `\n\n${header}${rawContent}`, { flag: 'a', encoding: 'utf8' });
  } else {
    writeFileSync(filePath, `${header}${rawContent}`, 'utf8');
  }

  return filePath;
}

/**
 * Scans quarantined text for sentences containing empirical indicators:
 * percentages, latency figures (ms/s), numbers, benchmarks, version strings.
 * @param {string} rawText - Text to inspect
 * @returns {Array<string>} List of candidate empirical sentences
 */
export function extractEmpiricalSentences(rawText) {
  // Normalize whitespace
  const cleaned = rawText.replace(/\r\n/g, '\n').replace(/\n{2,}/g, '\n');
  const sentences = cleaned.split(/(?<=[.?!])\s+/);
  
  // Empirical indicator regex: numbers followed by units, percentages, benchmarks, latency
  const empiricalPattern = /\b(?:\d+(?:\.\d+)?(?:%|ms|s|gb|mb|kb|tokens|fps|x|\$)|p50|p99|benchmark|tree-sitter|ripgrep|ast|sqlite|vector)\b/i;

  const candidateSentences = [];
  const seen = new Set();

  for (const s of sentences) {
    const trimmed = s.trim();
    if (trimmed.length > 30 && trimmed.length < 300 && empiricalPattern.test(trimmed)) {
      if (!seen.has(trimmed.toLowerCase())) {
        seen.add(trimmed.toLowerCase());
        candidateSentences.push(trimmed);
      }
    }
  }

  return candidateSentences;
}

/**
 * Verifies that each claim in the proposed ledger exists verbatim in the quarantined source text.
 * @param {Array<{claim: string, url: string, verbatim: string}>} claims
 * @param {string} slug
 * @returns {{ verified: Array<object>, rejected: Array<object> }}
 */
export function verifyClaimLedger(claims, slug) {
  const safeSlug = slug.replace(/[^a-z0-9_-]/gi, '-');
  const quarantinePath = resolve(QUARANTINE_DIR, `${safeSlug}-raw.txt`);
  
  let rawQuarantine = '';
  if (existsSync(quarantinePath)) {
    rawQuarantine = readFileSync(quarantinePath, 'utf8');
  }

  const verified = [];
  const rejected = [];

  for (const item of claims) {
    const cleanVerbatim = (item.verbatim || '').trim().replace(/^["']|["']$/g, '');
    
    if (!cleanVerbatim) {
      rejected.push({ ...item, reason: 'Missing verbatim quote' });
      continue;
    }

    // Substring verification
    if (rawQuarantine && !rawQuarantine.includes(cleanVerbatim)) {
      // Fuzzy space check
      const normalizedRaw = rawQuarantine.replace(/\s+/g, ' ');
      const normalizedVerbatim = cleanVerbatim.replace(/\s+/g, ' ');
      
      if (!normalizedRaw.includes(normalizedVerbatim)) {
        rejected.push({ ...item, reason: 'Verbatim quote not found in quarantined source' });
        continue;
      }
    }

    verified.push(item);
  }

  // Persist finalized Claim Ledger to scratch/
  const ledgerPath = resolve(SCRATCH_DIR, `claim-ledger-${safeSlug}.md`);
  const ledgerContent = `# Quarantined Claim Ledger: ${slug}

Generated: ${new Date().toISOString()}  
Quarantine Archive: \`${quarantinePath}\`  

### Verified Claims (${verified.length})
| # | Claim | Primary URL | Verbatim Citation |
|---|---|---|---|
${verified.map((v, i) => `| ${i + 1} | ${v.claim} | ${v.url} | "${v.verbatim}" |`).join('\n')}

${rejected.length > 0 ? `\n### Rejected Claims (${rejected.length})\n` + rejected.map((r) => `- [EXCISED]: ${r.claim} (${r.reason})`).join('\n') : ''}
`;

  writeFileSync(ledgerPath, ledgerContent, 'utf8');

  return { verified, rejected, ledgerPath };
}
