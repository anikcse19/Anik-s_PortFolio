"use client";

import { useCallback, useEffect, useState } from "react";

type Path = (string | number)[];

/** Immutable deep set: returns a copy of `obj` with `value` at `path`. */
export function setIn<T>(obj: T, path: Path, value: unknown): T {
  if (!path.length) return value as T;
  const [head, ...rest] = path;
  const source = (obj ?? (typeof head === "number" ? [] : {})) as Record<string | number, unknown>;
  const copy = (Array.isArray(source) ? [...source] : { ...source }) as Record<string | number, unknown>;
  copy[head] = setIn(source[head], rest, value);
  return copy as T;
}

export function getIn(obj: unknown, path: Path): unknown {
  return path.reduce<unknown>((acc, key) => (acc == null ? undefined : (acc as Record<string | number, unknown>)[key]), obj);
}

/**
 * Minimal controlled-form state for the admin editors: deep updates by path,
 * server-provided field errors keyed by dotted path, and dirty tracking with a
 * "leave page?" guard so unsaved edits aren't lost.
 */
export function useForm<T>(initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);

  // Warn before leaving the page only while there are unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const set = useCallback((path: Path, next: unknown) => {
    setValue((prev) => setIn(prev, path, next));
    setDirty(true);
    const key = path.join(".");
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  }, []);

  const error = useCallback(
    (path: Path) => {
      const key = path.join(".");
      return errors[key];
    },
    [errors],
  );

  /** Errors at or below a path (e.g. to flag a collapsed section). */
  const hasErrorsUnder = useCallback(
    (path: Path) => {
      const prefix = path.join(".");
      return Object.keys(errors).some((k) => k === prefix || k.startsWith(`${prefix}.`));
    },
    [errors],
  );

  const reset = useCallback((next: T) => {
    setValue(next);
    setDirty(false);
    setErrors({});
  }, []);

  return { value, set, setValue, errors, setErrors, error, hasErrorsUnder, dirty, setDirty, reset };
}

export type FormApi<T> = ReturnType<typeof useForm<T>>;
