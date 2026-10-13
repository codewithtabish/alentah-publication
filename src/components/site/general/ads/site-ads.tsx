// src/components/site/general/ads/site-ads.tsx

import { AdsterraBanner, AdsterraNative } from "./adsterra-ads";

// Set to true to show ads, false to hide all of them
export const ADS_ENABLED = true;

/* =========================================================
   300x250 UNITS
   Add every real 300x250 key you created in Adsterra.
   Each in-article slot rotates through these keys, so with
   N keys you can render up to N unique 300x250 ads on a
   single page.

   Replace each PASTE_ entry with a real key from the
   Adsterra dashboard. Entries still starting with PASTE_
   are ignored.
   ========================================================= */

const BANNER_300x250_KEYS = [
  "7b83293bde7a97ac5b1736a5da7634c2", // slot 1 (your existing key)
  "PASTE_300x250_KEY_2",              // slot 2 → replace
  "PASTE_300x250_KEY_3",              // slot 3 → replace
  "PASTE_300x250_KEY_4",              // slot 4 → replace
].filter((key) => !key.startsWith("PASTE_"));

/* =========================================================
   728x90 UNITS
   Same idea — add more keys if you have them.
   ========================================================= */

const BANNER_728x90_KEYS = [
  "79942c642085e587cd56f60528fce94c", // slot 1 (your existing key)
  "PASTE_728x90_KEY_2",               // slot 2 → replace
].filter((key) => !key.startsWith("PASTE_"));

/* =========================================================
   NATIVE UNITS
   Each native unit comes from Adsterra as a script-src +
   container-id pair. Add more pairs if you have them.
   ========================================================= */

const NATIVE_UNITS: { scriptSrc: string; containerId: string }[] = [
  {
    scriptSrc: "https://bauval.org/21/99db2505d5e64478607c86860c3d0456",
    containerId: "container-99db2505d5e64478607c86860c3d0456",
  },
  // Add more native units below (uncomment + paste your own):
  // {
  //   scriptSrc: "https://bauval.org/21/PASTE_SECOND_NATIVE_HASH",
  //   containerId: "container-PASTE_SECOND_NATIVE_HASH",
  // },
  // {
  //   scriptSrc: "https://bauval.org/21/PASTE_THIRD_NATIVE_HASH",
  //   containerId: "container-PASTE_THIRD_NATIVE_HASH",
  // },
];

/* =========================================================
   NATIVE
   `variant` picks which native unit to render.
   With only 1 unit configured, all native slots try the
   same unit — Adsterra will only fill the first one.
   Add more NATIVE_UNITS to see multiple native ads.
   ========================================================= */

export function NativeAd({ variant = 0 }: { variant?: number }) {
  if (!ADS_ENABLED) return null;
  if (NATIVE_UNITS.length === 0) return null;

  const unit = NATIVE_UNITS[variant % NATIVE_UNITS.length];

  return (
    <AdsterraNative
      scriptSrc={unit.scriptSrc}
      containerId={unit.containerId}
      className="my-8"
    />
  );
}

/* =========================================================
   300x250
   `variant` picks which 300x250 key to render.
   Different keys do NOT block each other on Adsterra, so
   several 300x250 slots can render on the same page.
   ========================================================= */

export function Banner300x250({ variant = 0 }: { variant?: number }) {
  if (!ADS_ENABLED) return null;
  if (BANNER_300x250_KEYS.length === 0) return null;

  const key = BANNER_300x250_KEYS[variant % BANNER_300x250_KEYS.length];

  return (
    <AdsterraBanner
      adKey={key}
      invokeSrc={`https://bauval.org/22/${key}`}
      width={300}
      height={250}
      className="my-2"
    />
  );
}

/* =========================================================
   728x90
   `variant` picks which 728x90 key to render.
   ========================================================= */

export function Banner728x90({ variant = 0 }: { variant?: number }) {
  if (!ADS_ENABLED) return null;
  if (BANNER_728x90_KEYS.length === 0) return null;

  const key = BANNER_728x90_KEYS[variant % BANNER_728x90_KEYS.length];

  return (
    <AdsterraBanner
      adKey={key}
      invokeSrc={`https://bauval.org/22/${key}`}
      width={728}
      height={90}
      className="my-8 hidden md:block"
    />
  );
}