// src/components/site/general/ads/site-ads.tsx

import { AdsterraBanner, AdsterraNative } from "./adsterra-ads";

// Set to true to show ads, false to hide all of them
export const ADS_ENABLED = true;

/* =========================================================
   300x250 UNITS
   ========================================================= */

const BANNER_300x250_KEYS = [
  "7b83293bde7a97ac5b1736a5da7634c2", // slot 1 (existing)
  "PASTE_300x250_KEY_2",              // slot 2 → replace
  "PASTE_300x250_KEY_3",              // slot 3 → replace
  "PASTE_300x250_KEY_4",              // slot 4 → replace
].filter((key) => !key.startsWith("PASTE_"));

/* =========================================================
   728x90 UNITS
   ========================================================= */

const BANNER_728x90_KEYS = [
  "79942c642085e587cd56f60528fce94c", // slot 1 (existing)
  "PASTE_728x90_KEY_2",               // slot 2 → replace
].filter((key) => !key.startsWith("PASTE_"));

/* =========================================================
   160x600 UNITS  (wide skyscraper — desktop sidebar)
   ========================================================= */

const BANNER_160x600_KEYS = [
  "96bc6d9a36df183a6c834391b2ba9609", // slot 1 (new)
  "PASTE_160x600_KEY_2",              // slot 2 → replace
].filter((key) => !key.startsWith("PASTE_"));

/* =========================================================
   320x50 UNITS  (mobile leaderboard)
   ========================================================= */

const BANNER_320x50_KEYS = [
  "feb2d0a32e69abfc081ce321596cf3bf", // slot 1 (new)
  "PASTE_320x50_KEY_2",               // slot 2 → replace
].filter((key) => !key.startsWith("PASTE_"));

/* =========================================================
   NATIVE UNITS
   ========================================================= */

const NATIVE_UNITS: { scriptSrc: string; containerId: string }[] = [
  {
    scriptSrc: "https://bauval.org/21/99db2505d5e64478607c86860c3d0456",
    containerId: "container-99db2505d5e64478607c86860c3d0456",
  },
  // Add more native units below:
  // {
  //   scriptSrc: "https://bauval.org/21/PASTE_SECOND_NATIVE_HASH",
  //   containerId: "container-PASTE_SECOND_NATIVE_HASH",
  // },
];

/* =========================================================
   NATIVE
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

/* =========================================================
   160x600 (wide skyscraper — desktop only)
   ========================================================= */

export function Banner160x600({ variant = 0 }: { variant?: number }) {
  if (!ADS_ENABLED) return null;
  if (BANNER_160x600_KEYS.length === 0) return null;

  const key = BANNER_160x600_KEYS[variant % BANNER_160x600_KEYS.length];

  return (
    <AdsterraBanner
      adKey={key}
      invokeSrc={`https://bauval.org/22/${key}`}
      width={160}
      height={600}
      className="my-4 hidden lg:block"
    />
  );
}

/* =========================================================
   320x50 (mobile leaderboard — mobile only)
   ========================================================= */

export function Banner320x50({ variant = 0 }: { variant?: number }) {
  if (!ADS_ENABLED) return null;
  if (BANNER_320x50_KEYS.length === 0) return null;

  const key = BANNER_320x50_KEYS[variant % BANNER_320x50_KEYS.length];

  return (
    <AdsterraBanner
      adKey={key}
      invokeSrc={`https://bauval.org/22/${key}`}
      width={320}
      height={50}
      className="my-4 md:hidden"
    />
  );
}