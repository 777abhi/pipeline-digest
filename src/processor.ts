import stripAnsi from 'strip-ansi';

export interface Snippet {
  keyword: string;
  snippet: string;
}

export function processLogs(rawLog: string): { cleanLog: string; snippets: Snippet[] } {
  // Strip ANSI color codes
  const cleanLog = stripAnsi(rawLog);

  // Smart failure highlighting
  const keywords = ['FAILED', 'ERROR', 'Exception', 'Exit Code:'];
  const lines = cleanLog.split('\n');
  const snippets: Snippet[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Check if the line matches any keyword (case-insensitive or sensitive, let's do case-insensitive for robustness)
    const upperLine = line.toUpperCase();
    const matchedKeyword = keywords.find(k => upperLine.includes(k.toUpperCase()));

    if (matchedKeyword) {
      // Extract up to 20 surrounding lines (10 before, 10 after to make 20 total context lines, or 20 before and 20 after.
      // The requirement was "20 lines", which I interpret as 20 lines of context. Let's do 10 before and 10 after).
      const startIdx = Math.max(0, i - 10);
      const endIdx = Math.min(lines.length - 1, i + 10);

      const snippetLines = lines.slice(startIdx, endIdx + 1);
      snippets.push({
        keyword: matchedKeyword,
        snippet: snippetLines.join('\n'),
      });

      // To avoid massive duplication if there are multiple errors close together, we could skip ahead.
      // However, it's safer to just collect them, maybe jump ahead by `10` lines to avoid overlapping the exact same error context immediately.
      i = endIdx;
    }
  }

  return { cleanLog, snippets };
}
