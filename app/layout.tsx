import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter, Fraunces } from "next/font/google";
import RootProviders from "./providers";
import { HeadHints } from "@/shared/components/HeadHints";
import { InstallPrompt } from "@/shared/components/InstallPrompt";
import { AnalyticsBeacon } from "@/shared/components/AnalyticsBeacon";
import { GoogleAnalytics } from "@/shared/components/GoogleAnalytics";
import "./globals.css";
import { siteUrlFromEnv } from "@/shared/lib/siteUrl";
import { BRAND_STORAGE_MIGRATION_SCRIPT } from "@/shared/lib/brandStorage";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  // Single variable font file covers every weight 100-900 — saves the
  // multi-weight preload bandwidth and silences the "preloaded but not
  // used within a few seconds" browser warning that fires when one
  // weight's woff2 isn't touched in first paint.
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fraunces",
  display: "swap",
  // Opt-in only — applied per-page via `font: "serif"` user setting and
  // a handful of marketing surfaces. Preloading it on every route burns
  // bandwidth + trips the "preloaded but not used" browser warning on
  // typical sans-only pages (dashboard, inbox, settings, …).
  preload: false,
});

// Resolved from env so clones get their OWN absolute og/canonical URLs
// without forking: NEXT_PUBLIC_SITE_URL, else Vercel's auto-injected
// VERCEL_PROJECT_PRODUCTION_URL / VERCEL_URL. The localhost fallback only
// applies to a local build with no env at all — it must never be a real
// third-party domain, or a clone would advertise someone else's site as
// its canonical URL.
const SITE_URL = siteUrlFromEnv() ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lapis — Your workspace for clearer work",
    template: "%s · Lapis",
  },
  description:
    "An open-source workspace for personal and team productivity. Organize ideas, projects, and structured information with flexible pages, databases, sharing, and integrations.",
  authors: [{ name: "Lapis" }],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
    other: [{ rel: "mask-icon", url: "/logo-mark-fill-black.svg", color: "#315cf5" }],
  },
  appleWebApp: {
    capable: true,
    title: "Lapis",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "Lapis — Your workspace for clearer work",
    description: "A flexible workspace for notes, projects, databases, and the work that connects them.",
    type: "website",
    url: SITE_URL,
    siteName: "Lapis",
    images: [{ url: "/banner-dark.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lapis — Your workspace for clearer work",
    description: "Bring notes, projects, and team knowledge together in one flexible workspace.",
    images: ["/banner-dark.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#315cf5" },
    { media: "(prefers-color-scheme: dark)", color: "#111a30" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${fraunces.variable}`}>
      <HeadHints />
      <body>
        <Script id="lapis-storage-migration" strategy="beforeInteractive">
          {BRAND_STORAGE_MIGRATION_SCRIPT}
        </Script>
        <div id="root">
          <RootProviders>
            <Suspense fallback={null}>{children}</Suspense>
          </RootProviders>
        </div>
        <InstallPrompt />
        {/* Cookieless visitor beacon + GA4 — both self-skip /dashboard and
            non-page routes, so analytics load only on public
            marketing/share/site traffic. */}
        <Suspense fallback={null}>
          <AnalyticsBeacon />
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
