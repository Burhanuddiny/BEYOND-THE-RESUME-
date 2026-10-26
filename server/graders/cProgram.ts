import type { RubricCriterion } from '../../shared/types.ts';
import type { Checkpoint } from '../lib/checkpoints.ts';

export interface Grader {
  taskId: string;
  version: number;
  referenceNotes: string;
  checkpoints: Checkpoint[];
  modelAnswer: string;
  followUp: {
    persona: string;
    brief: string;
    fallbackMessage: string;
    criterion: RubricCriterion;
    referenceNotes: string;
  };
}

export const C_PROGRAM_GRADER: Grader = {
  taskId: 'debug-c-program',
  version: 1,
  referenceNotes: `Bugs a correct answer identifies:
1. malloc(count * sizeof(char)) allocates 1 byte per element; storing int (usually 4 bytes)
   writes past the buffer: heap buffer overflow, undefined behaviour, can corrupt the heap.
   Fix: malloc((size_t)count * sizeof(int)) or sizeof *id_buffer.
2. Loop \`i <= count\` runs one past the end: reads list[count] and writes id_buffer[count],
   both out of bounds. Fix: i < count.
3. malloc result is never checked for NULL.
4. NULL \`list\` is not checked (count <= 0 is already handled).
5. main() never calls free(ids): memory leak; across 100k requests the process runs out of
   memory. The caller owns the buffer and must free it.
Strong answers also note: the SIGSEGV is intermittent because heap overflow is undefined
behaviour (it may corrupt allocator metadata and crash later); size_t cast / overflow of
count * sizeof(int) for very large counts; documenting ownership in a comment; const input.`,
  checkpoints: [
    {
      id: 'alloc-size',
      pillar: 'technical',
      label: 'Spotted the sizeof(char) allocation bug',
      patterns: [/sizeof\s*\(\s*int\s*\)/i, /sizeof\s*\(?\s*\*\s*\w+\s*\)?/],
    },
    {
      id: 'off-by-one',
      pillar: 'technical',
      label: 'Fixed the off-by-one loop bound',
      patterns: [/\bi\s*<\s*count\b/, /off[- ]by[- ]one/i],
    },
    {
      id: 'malloc-null',
      pillar: 'edgeCases',
      label: 'Checked malloc for NULL',
      patterns: [/\w+\s*==\s*NULL/, /!\s*id_buffer\b/, /malloc[\s\S]{0,60}(fail|null)/i],
    },
    {
      id: 'input-guard',
      pillar: 'edgeCases',
      label: 'Guarded against a NULL input list',
      patterns: [/list\s*==\s*NULL/, /NULL\s*==\s*list/, /!\s*list\b/],
    },
    {
      id: 'free',
      pillar: 'technical',
      label: 'Made the caller free the buffer',
      patterns: [/^\s*free\s*\(\s*\w+\s*\)\s*;/m, /(call|calls|calling|must|should)\s+`?free\b/i],
    },
    {
      id: 'ub-explained',
      pillar: 'problemSolving',
      label: 'Explained why it crashes (out-of-bounds / heap overflow)',
      patterns: [
        /out[- ]of[- ]bounds/i,
        /buffer overflow|heap (corruption|overflow)|overrun/i,
        /undefined behaviou?r/i,
      ],
    },
  ],
  modelAnswer: `1. IDENTIFIED BUGS:
a) Size calculation: \`malloc(count * sizeof(char))\` allocates only 1 byte per element instead of \`sizeof(int)\` (typically 4 bytes). Writing integers causes heap buffer overflow.
b) Off-by-one loop: \`for (int i = 0; i <= count; i++)\` accesses index \`list[3]\` and writes to \`id_buffer[3]\`, which is outside bounds (valid indices are 0 to count-1).
c) Unchecked malloc: The code does not check if \`malloc\` returns NULL when memory is exhausted.
d) Memory Leak: In \`main()\`, \`ids\` is allocated on heap but never released with \`free(ids)\`.

2. CORRECTED CODE:
#include <stdio.h>
#include <stdlib.h>

int* extract_transaction_ids(const Transaction* list, int count) {
    if (list == NULL || count <= 0) {
        return NULL;
    }

    int* id_buffer = (int*)malloc((size_t)count * sizeof(int));
    if (id_buffer == NULL) {
        // Handle allocation failure gracefully
        return NULL;
    }

    for (int i = 0; i < count; i++) {
        id_buffer[i] = list[i].id;
    }

    return id_buffer;
}

3. CALLER RESPONSIBILITY:
The caller must verify the returned pointer is not NULL, process the data, and explicitly call \`free(ids)\` once processing is complete.`,
  followUp: {
    persona: `A calm, precise senior backend engineer who is doing the code review on your fix before it ships. Friendly but does not let things slide.`,
    brief: `Ask one code-review question about a gap that is genuinely present in the candidate's fix. Prefer, in order: integer overflow in count * sizeof(int) for very large counts; what the function returns and who frees memory on an error path; behaviour when list is NULL but count > 0. If their fix already covers all three, ask how they would prove the fix in CI (for example AddressSanitizer or Valgrind).`,
    fallbackMessage: `Thanks, the allocation fix looks right. One thing before I approve: what happens in your version if count is huge, say 1.5 billion? Is count * sizeof(int) still safe on our 32-bit build, and what would you change?`,
    criterion: {
      id: 'followup',
      criterion: 'Code-review follow-up',
      description: 'Answers the reviewer precisely: names the real risk and proposes a concrete, correct guard or verification step.',
      pillar: 'edgeCases',
    },
    referenceNotes: `Good replies: check count against SIZE_MAX / sizeof(int) (or use calloc, which checks the multiplication) before allocating; return NULL and document it; caller checks for NULL; mention AddressSanitizer/Valgrind in CI to catch regressions. Weak replies: "it's fine", or vague "add error handling" without specifics.`,
  },
};
