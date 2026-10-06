// src/app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Alentah — Slow Journalism for Curious Minds",
    short_name: "Alentah",
    description:
      "An independent editorial publication covering technology, business, finance, lifestyle, culture, travel, health, science, and design — slow journalism for curious minds.",

    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",

    // Colors — matched to your globals.css theme tokens
    // --background: oklch(0.9821 0.005 80)  →  #FAF7F2  (warm cream)
    // --primary:    oklch(0.4341 0.0392 41.9938)  →  #6B4A2F  (warm brown)
    background_color: "#FAF7F2",
    theme_color: "#6B4A2F",

    lang: "en",
    dir: "ltr",

    categories: ["news", "magazines", "education", "books", "lifestyle"],

    icons: [
      {
        src: "/seo/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/seo/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/seo/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],

    screenshots: [
      {
        src: "/seo/screenshot-mobile.png",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow",
        label: "Alentah homepage on mobile",
      },
      {
        src: "/seo/screenshot-desktop.png",
        sizes: "1920x1080",
        type: "image/png",
        form_factor: "wide",
        label: "Alentah homepage on desktop",
      },
    ],

    shortcuts: [
      {
        name: "Saved Articles",
        short_name: "Saved",
        description: "Your reading list",
        url: "/saved",
        icons: [
          {
            src: "/seo/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Technology",
        short_name: "Technology",
        description: "Latest technology stories",
        url: "/technology",
        icons: [
          {
            src: "/seo/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
  };
}