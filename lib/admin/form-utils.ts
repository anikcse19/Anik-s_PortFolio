/**
 * Projects a stored document onto the editable input shape: keeps only keys the
 * editor knows about, falling back to the editor defaults for missing fields.
 */
export function toInput<T extends Record<string, unknown>>(empty: T, doc: Record<string, unknown>): T {
  const out = { ...empty } as Record<string, unknown>;
  for (const key of Object.keys(empty)) {
    const value = doc[key];
    if (value !== undefined && value !== null) out[key] = value;
    else if (value === null && empty[key] === null) out[key] = null;
  }
  return out as T;
}
