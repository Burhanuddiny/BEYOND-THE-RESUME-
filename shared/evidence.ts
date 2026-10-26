/**
 * Normalises text for fuzzy, punctuation-insensitive quote verification.
 * Rules: Unicode NFKC, lowercase, remove quotes and backticks, en/em dash to '-',
 * collapse whitespace, trim, strip punctuation.
 */
export function normalise(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u2018\u2019\u201A\u201B']/g, '')
    .replace(/[\u201C\u201D\u201E\u201F"]/g, '')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[.,;:!?-]+|[.,;:!?-]+$/g, '')
    .trim();
}

/**
 * Verifies that quotes from the model genuinely occur in the source text.
 * Handles ellipsis splitting ('...' or '…'), order matching, minimum length (8 chars),
 * deduplication, and at most 3 verified quotes.
 */
export function verifyQuotes(
  quotes: string[],
  source: string,
): { verified: string[]; rejected: number } {
  const normSource = normalise(source);
  if (!normSource || !quotes || quotes.length === 0) {
    return { verified: [], rejected: quotes ? quotes.length : 0 };
  }

  const verified: string[] = [];
  let rejected = 0;

  for (const rawQuote of quotes) {
    if (!rawQuote || typeof rawQuote !== 'string') {
      rejected++;
      continue;
    }

    // Split on ellipsis: ... or …
    const parts = rawQuote.split(/\.{3,}|…/).map((p) => normalise(p)).filter(Boolean);

    if (parts.length === 0) {
      rejected++;
      continue;
    }

    // Every part must be at least 8 chars after normalisation
    const allValidLength = parts.every((p) => p.length >= 8);
    if (!allValidLength) {
      rejected++;
      continue;
    }

    // Check that each part appears in normSource in order
    let searchFrom = 0;
    let matched = true;

    for (const part of parts) {
      const idx = normSource.indexOf(part, searchFrom);
      if (idx === -1) {
        matched = false;
        break;
      }
      searchFrom = idx + part.length;
    }

    if (matched) {
      // Clean display quote (trimmed)
      const cleanQuote = rawQuote.trim();
      if (!verified.includes(cleanQuote)) {
        if (verified.length < 3) {
          verified.push(cleanQuote);
        }
      }
    } else {
      rejected++;
    }
  }

  return { verified, rejected };
}
