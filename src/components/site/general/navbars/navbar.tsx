// src/components/site/general/navbars/navbar.tsx
// ============================================================
// Navbar — ALENTAH
// Server component fetches categories via existing getCategories().
// Client component handles interactivity.
// ============================================================

import { Suspense } from "react";
import { NavbarClient, NavbarSkeleton } from "./navbar-client";
import { getCategories } from "@/actions/category/get-categories";

// ============================================================
// SERVER — reuses getCategories() (no new action)
// ============================================================

export function Navbar() {
  return (
    <Suspense fallback={<NavbarSkeleton />}>
      <NavbarData />
    </Suspense>
  );
}

async function NavbarData() {
  const result = await getCategories();

  // If auth fails or there's an error, render the navbar with no categories.
  // The rest of the navbar (logo, login, theme toggle) still works.
  const categories = result.success ? result.categories : [];

  return <NavbarClient categories={categories} />;
}