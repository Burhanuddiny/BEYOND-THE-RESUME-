export type Severity = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';

/** Writes one JSON line that Cloud Logging parses (severity + message + fields). */
export function log(
  severity: Severity,
  message: string,
  fields: Record<string, unknown> = {},
): void {
  process.stdout.write(
    JSON.stringify({
      severity,
      message,
      ...fields,
      time: new Date().toISOString(),
    }) + '\n',
  );
}
