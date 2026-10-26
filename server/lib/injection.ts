/**
 * Scans student answer or follow-up reply for prompt injection attempts.
 * Returns true if the text looks like an attempt to instruct the evaluator. Pure.
 */
export function looksLikeInjection(text: string): boolean {
  if (!text) return false;

  const injectionPatterns: RegExp[] = [
    /ignore\s+(all\s+|any\s+)?(the\s+)?(previous|prior|above)\s+(instructions|rules|rubric)/i,
    /(give|award|assign|grade)\s+(me\s+|this\s+)?(a\s+)?(full|max(imum)?|perfect|top|100|4)\s*(score|marks|grade|points|level)?\b/i,
    /\b(system|developer)\s+prompt\b/i,
    /you\s+are\s+(now\s+)?(an?|the)\s+(grader|evaluator|ai|assistant)\b/i,
    /"?level"?\s*[:=]\s*4\b/i,
    /<\/?student_(answer|reply)>/i,
  ];

  // Specific false positive exclusions:
  // e.g. "We should ignore the noisy 21:00 data point"
  // e.g. "I'd give the client a full update at 14:45"
  for (const pattern of injectionPatterns) {
    if (pattern.test(text)) {
      return true;
    }
  }

  return false;
}
