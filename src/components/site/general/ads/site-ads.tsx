// src/components/site/ads/site-ads.tsx

import { AdsterraBanner, AdsterraNative } from "./adsterra-ads";

// Set to true to show ads, false to hide all of them
export const ADS_ENABLED = true;

export function NativeAd() {
  if (!ADS_ENABLED) return null;

  return (
    <AdsterraNative
      scriptSrc="https://bauval.org/21/99db2505d5e64478607c86860c3d0456"
      containerId="container-99db2505d5e64478607c86860c3d0456"
      className="my-8"
    />
  );
}

export function Banner300x250() {
  if (!ADS_ENABLED) return null;

  return (
    <AdsterraBanner
      adKey="7b83293bde7a97ac5b1736a5da7634c2"
      invokeSrc="https://bauval.org/22/7b83293bde7a97ac5b1736a5da7634c2"
      width={300}
      height={250}
      className="my-2"
    />
  );
}

export function Banner728x90() {
  if (!ADS_ENABLED) return null;

  return (
    <AdsterraBanner
      adKey="79942c642085e587cd56f60528fce94c"
      invokeSrc="https://bauval.org/22/79942c642085e587cd56f60528fce94c"
      width={728}
      height={90}
      className="my-8 hidden md:block"
    />
  );
}