import type { PublicTask } from '../types.ts';

export const C_PROGRAM_TASK: PublicTask = {
  id: 'debug-c-program',
  version: 1,
  code: 'TASK-C01',
  title: 'Debug a C Program',
  subtitle: 'Dynamic Buffer Allocation & Segmentation Fault',
  difficulty: 'Intermediate',
  category: 'Systems & Core Programming',
  estimatedMinutes: 20,
  objective: 'Identify memory leak vulnerabilities and pointer misuse causing crashes in high-throughput data ingestion, explain the root cause, and write fixed code.',
  context: 'You are on the backend platform engineering team at FinStream. A client reporting tool written in C intermittently crashes with SIGSEGV (segmentation fault) under high request volumes. The intern who wrote this snippet has left the team, and you need to review the code, pinpoint both the crash and memory leakage, and provide a clean fix.',
  scenarioDetail: 'The following function `process_transactions` dynamically allocates a buffer for an array of transaction IDs, appends incoming items, and returns the pointer. However, QA reports that after 100k requests, the server process runs out of RAM, and sometimes crashes when zero transactions are passed.',
  codeSnippet: {
    filename: 'transaction_buffer.c',
    language: 'c',
    code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    int id;
    double amount;
    char status[16];
} Transaction;

// Function under review:
int* extract_transaction_ids(Transaction* list, int count) {
    if (count <= 0) {
        return NULL;
    }

    int* id_buffer = (int*)malloc(count * sizeof(char)); 

    for (int i = 0; i <= count; i++) {
        id_buffer[i] = list[i].id;
    }

    return id_buffer;
}

int main() {
    Transaction txs[3] = {
        {101, 249.50, "SETTLED"},
        {102, 120.00, "PENDING"},
        {103, 850.75, "SETTLED"}
    };

    int* ids = extract_transaction_ids(txs, 3);
    for (int i = 0; i < 3; i++) {
        printf("Transaction ID: %d\\n", ids[i]);
    }

    return 0;
}`,
  },
  instructions: [
    'Pinpoint at least 3 critical bugs or memory safety issues in the snippet provided.',
    'Explain the exact root cause of the SIGSEGV / out-of-bounds access in the loop.',
    'Explain why `sizeof(char)` in `malloc` causes heap corruption when storing `int` values.',
    'Provide your corrected version of `extract_transaction_ids` with proper boundary checks and memory safety.',
    'Note what the caller responsibility must be regarding deallocation (`free`).',
  ],
  rubric: [
    {
      id: 'technical-accuracy',
      criterion: 'Technical Accuracy',
      description: 'Correct identification of `sizeof(int)` vs `sizeof(char)` and loop off-by-one `i <= count`.',
      pillar: 'technical',
    },
    {
      id: 'problem-solving',
      criterion: 'Problem-Solving',
      description: 'Systematic root-cause explanation of memory buffer overrun and SIGSEGV behavior.',
      pillar: 'problemSolving',
    },
    {
      id: 'edge-case-handling',
      criterion: 'Edge-Case Handling',
      description: 'Guards against NULL input pointers, zero count, and checking `malloc` return for NULL.',
      pillar: 'edgeCases',
    },
    {
      id: 'code-quality',
      criterion: 'Code Quality & Cleanliness',
      description: 'Readable, ANSI C compliant solution with explicit deallocation guidance.',
      pillar: 'technical',
    },
  ],
  hints: [
    'Read the function the way the caller will use it: what could they pass in?',
    'Check every size and every loop bound against the type being stored.',
    'For each allocation, ask who is responsible for releasing it.',
  ],
  answerOutline: `1. ISSUES FOUND AND ROOT CAUSE:
- 

2. CORRECTED CODE:


3. NOTES FOR THE CALLER:
- `,
  stakeholder: {
    name: 'Priya Raman',
    role: 'Senior Backend Engineer, FinStream',
  },
};
