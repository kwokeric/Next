import { generateKeyBetween } from "fractional-indexing";

// Sort key for a task being appended to the end of a sibling list.
export function keyForAppend(lastSiblingOrder: string | null): string {
  return generateKeyBetween(lastSiblingOrder, null);
}

// Sort key for a task moved between two siblings (either may be null for
// "moved to the start/end of the list").
export function keyForMove(
  prevOrder: string | null,
  nextOrder: string | null
): string {
  return generateKeyBetween(prevOrder, nextOrder);
}
