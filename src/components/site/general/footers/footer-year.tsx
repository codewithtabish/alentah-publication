"use client";

// ============================================================
// FooterYear — ALENTAH
// Renders the current year AFTER mount (client only).
// Avoids Next.js prerender-time evaluation of `new Date()`.
// ============================================================

import { useEffect, useState } from "react";

export function FooterYear() {
  const [year, setYear] = useState<string | null>(null);

  useEffect(() => {
    setYear(String(new Date().getFullYear()));
  }, []);

  // During prerender + first paint: render a stable placeholder
  // so the layout doesn't shift and Next.js doesn't complain.
  if (year === null) {
    return <span aria-hidden="true">&nbsp;</span>;
  }

  return <>{year}</>;
}

export default FooterYear;