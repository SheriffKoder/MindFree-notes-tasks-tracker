/**
 * @file entities/activity/editor/lib/toggle-chip-value.ts
 * Multi-select chip toggle that never empties the selection.
 */

/**
 * Adds or removes `value` from `selected`. Refuses to remove the last item so
 * schedule configs stay schema-valid (non-empty arrays for weekly/monthly/yearly).
 */
export function toggleChipValue(
  selected: readonly string[],
  value: string,
): string[] {
  if (selected.includes(value)) {
    if (selected.length <= 1) {
      return [...selected];
    }

    return selected.filter((entry) => entry !== value);
  }

  return [...selected, value];
}
