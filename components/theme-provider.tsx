"use client";

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

/**
 * next-themes injects an inline script that applies the theme before first paint.
 * It only needs to run from the server-rendered HTML; on the client we mark it as
 * non-executable so React 19.2 doesn't warn about rendering a <script> element.
 * (The script element has suppressHydrationWarning, so the differing `type` is safe.)
 */
const scriptProps = { type: typeof window === "undefined" ? "text/javascript" : "text/plain" } as const;

export function ThemeProvider(props: ThemeProviderProps) {
  return <NextThemesProvider scriptProps={scriptProps} {...props} />;
}
