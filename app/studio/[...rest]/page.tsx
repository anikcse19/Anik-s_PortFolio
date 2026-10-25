import { notFound } from "next/navigation";

/** Unknown studio URLs render the studio's own 404 (inside the studio shell) instead of the portfolio's. */
export default function StudioCatchAll() {
  notFound();
}
