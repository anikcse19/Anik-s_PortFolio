import { IBM_Plex_Mono, IBM_Plex_Sans, Instrument_Sans, JetBrains_Mono, Newsreader, Schibsted_Grotesk } from "next/font/google";

/**
 * Typography presets (selected in Admin › Appearance). Fonts are self-hosted by
 * next/font; only the default preset is preloaded, the others load on demand.
 */
export const schibsted = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-schibsted", display: "swap" });
export const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });
export const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  preload: false,
  style: ["normal", "italic"],
});
export const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap", preload: false });
export const plexSans = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-plex-sans", display: "swap", preload: false });
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  display: "swap",
  preload: false,
});

export const fontVariables = [schibsted, jetbrains, newsreader, instrument, plexSans, plexMono].map((f) => f.variable).join(" ");
