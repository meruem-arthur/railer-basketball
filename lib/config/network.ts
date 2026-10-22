/**
 * The UMaT SRID SRC family of sites. Addresses come from env vars so they can change without code edits;
 * the defaults are the production subdomains.
 */
export type NetworkKey = "src" | "sports" | "railers";

export const NETWORK: { key: NetworkKey; label: string; href: string }[] = [
  { key: "src", label: "UMaT SRC", href: process.env.NEXT_PUBLIC_SRC_URL || "https://www.umatsridsrc.com" },
  { key: "sports", label: "SRC Sports", href: process.env.NEXT_PUBLIC_SPORTS_URL || "https://sports.umatsridsrc.com" },
  { key: "railers", label: "SRID Railers", href: process.env.NEXT_PUBLIC_RAILERS_URL || "https://railers.umatsridsrc.com" },
];

/** Everything except this site. */
export const OTHER_SITES = NETWORK.filter((n) => n.key !== "railers");
