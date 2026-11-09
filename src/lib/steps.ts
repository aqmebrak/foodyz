/** Steps are stored as one string, separated by blank lines. */
export function splitSteps(instructions: string): string[] {
  return instructions
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function joinSteps(steps: string[]): string {
  return steps
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Pasted text containing blank lines becomes several steps: the current step is
 * replaced by the first chunk, the rest are inserted after it. Returns null
 * when the paste has no blank line (let the browser paste normally).
 */
export function pasteIntoSteps(
  steps: string[],
  index: number,
  pasted: string,
): { steps: string[]; focusIndex: number } | null {
  const chunks = splitSteps(pasted);
  if (chunks.length < 2) return null;
  const next = [...steps];
  next.splice(index, 1, ...chunks);
  return { steps: next, focusIndex: index + chunks.length - 1 };
}
