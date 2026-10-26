import { describe, it, expect } from 'vitest';
import { normalise, verifyQuotes } from '../shared/evidence.ts';

describe('Evidence Verification', () => {
  it('normalises text properly', () => {
    expect(normalise('  “Hello   World”—`code`!  ')).toBe('hello world-code');
  });

  it('matches exact quotes in source', () => {
    const source = 'The malloc call allocates count * sizeof(int) on the heap.';
    const res = verifyQuotes(['allocates count * sizeof(int)'], source);
    expect(res.verified).toEqual(['allocates count * sizeof(int)']);
    expect(res.rejected).toBe(0);
  });

  it('handles case, whitespace, backticks, and smart quotes', () => {
    const source = 'We must call `free(ids)` before returning from main.';
    const res = verifyQuotes(['“free(ids)” before returning'], source);
    expect(res.verified.length).toBe(1);
    expect(res.rejected).toBe(0);
  });

  it('matches ellipsis in order', () => {
    const source = 'First, we allocate memory for buffer. Later, we free the buffer.';
    const res = verifyQuotes(['allocate memory...free the buffer'], source);
    expect(res.verified.length).toBe(1);
    expect(res.rejected).toBe(0);
  });

  it('rejects ellipsis out of order', () => {
    const source = 'First, we allocate memory. Later, we free the buffer.';
    const res = verifyQuotes(['free the buffer...allocate memory'], source);
    expect(res.verified.length).toBe(0);
    expect(res.rejected).toBe(1);
  });

  it('rejects fabricated quotes', () => {
    const source = 'The quick brown fox jumps over the lazy dog.';
    const res = verifyQuotes(['The elephant jumps over the lazy dog'], source);
    expect(res.verified.length).toBe(0);
    expect(res.rejected).toBe(1);
  });

  it('rejects too-short quotes under 8 normalised chars', () => {
    const source = 'free(ids);';
    const res = verifyQuotes(['free'], source);
    expect(res.verified.length).toBe(0);
    expect(res.rejected).toBe(1);
  });

  it('deduplicates quotes and limits to max 3', () => {
    const source = 'The database connection pool saturated at 99% during peak hour.';
    const res = verifyQuotes([
      'connection pool saturated',
      'connection pool saturated',
      'saturated at 99%',
      'during peak hour',
      'connection pool',
    ], source);
    expect(res.verified.length).toBeLessThanOrEqual(3);
  });
});
