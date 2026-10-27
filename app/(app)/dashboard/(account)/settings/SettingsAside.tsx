"use client";

/** Right-column context panel for the settings page.
 *  Per-section: quick help, related links, discovery URLs, status.
 *  Hidden on mobile/tablet; appears at lg+ where the 3rd column fits. */

import type { ComponentType } from "react";
import Link from "next/link";
import {
  ExternalLink, HelpCircle, KeyRound, Plug, FileText, Save, User,
  Palette, Webhook, LifeBuoy, ShieldCheck, Sparkles, Bot,
} from "lucide-react";
import type { SettingsKey } from "./SettingsSidebar";
import { mcpUrl } from "@/shared/lib/siteUrl";

type Tip = { icon: ComponentType<{ className?: string }>; label: string; href?: string; external?: boolean };

type AsideContent = {
  title: string;
  blurb: string;
  tips?: Tip[];
  links?: { label: string; href: string; external?: boolean }[];
};

const ASIDE: Record<SettingsKey, AsideContent> = {
  workspace: {
    title: "About workspaces",
    blurb: "Workspaces are collaboration boundaries. Each user gets a personal workspace and can join others by invitation.",
    tips: [
      { icon: User, label: "The workspace slug appears in share URLs" },
      { icon: ShieldCheck, label: "Owners can transfer or delete a workspace" },
    ],
  },
  appearance: {
    title: "Theme and density",
    blurb: "The theme applies across the dashboard. Density controls row height in the sidebar and list views.",
    tips: [
      { icon: Palette, label: "System mode follows your operating system preference" },
    ],
  },
  ai: {
    title: "Bring your own AI keys",
    blurb: "Add your own key here if the admin key runs out of quota or you want a premium model. Personal keys are private; workspace keys are shared with members.",
    tips: [
      { icon: KeyRound, label: "Plain-text keys are encrypted before storage (AES-GCM-256)" },
      { icon: Bot, label: "Key priority: personal preferOwn → shared workspace → admin fallback" },
      { icon: ShieldCheck, label: "Workspace keys require the owner or editor role" },
    ],
    links: [
      { label: "OpenRouter API keys", href: "https://openrouter.ai/keys", external: true },
      { label: "Anthropic console", href: "https://console.anthropic.com/settings/keys", external: true },
      { label: "OpenAI platform", href: "https://platform.openai.com/api-keys", external: true },
    ],
  },
  pages: {
    title: "Editor and sort defaults",
    blurb: "New defaults apply to pages you create from now on. Existing pages are unchanged.",
    tips: [
      { icon: FileText, label: "Default sorting applies to the side navigation, not database views" },
    ],
  },
  backup: {
    title: "Export + import",
    blurb: "JSON exports include your pages, databases, views, snapshots, share links, and wiki data. Imports remap IDs automatically.",
    tips: [
      { icon: Save, label: "Imports are safe to repeat. Conflicting slugs are skipped; other data is preserved." },
      { icon: ShieldCheck, label: "Limits: 8 MB JSON, 50 MB ZIP, and 3 imports per minute" },
    ],
  },
  "mcp-apps": {
    title: "MCP — Model Context Protocol",
    blurb: "Connect AI clients such as ChatGPT, Claude, and Cursor to your workspace with OAuth 2.1 + PKCE or a static bearer token.",
    tips: [
      { icon: ShieldCheck, label: "Tokens are scoped per user; clients can only access your pages" },
      { icon: Sparkles, label: "Tools: pages_list, pages_search, pages_get, pages_create, pages_append_markdown" },
    ],
    links: [
      { label: "/.well-known/oauth-authorization-server", href: "/.well-known/oauth-authorization-server", external: true },
      { label: "/.well-known/oauth-protected-resource", href: "/.well-known/oauth-protected-resource", external: true },
      { label: "MCP spec (modelcontextprotocol.io)", href: "https://modelcontextprotocol.io/specification/2025-11-25", external: true },
    ],
  },
  mcp: {
    title: "Script tokens (lps_)",
    blurb: "Use bearer tokens with scripts, Claude Desktop, or Cursor. The plain-text token is shown only once when created, so store it securely.",
    tips: [
      { icon: KeyRound, label: "Max 10 token aktif per user" },
      { icon: ShieldCheck, label: "Only the SHA-256 hash is stored; revoke tokens anytime" },
    ],
    links: [
      { label: "MCP server URL", href: mcpUrl() ?? "#", external: true },
    ],
  },
  webhooks: {
    title: "Outbound webhooks",
    blurb: "Send events to your URL as signed HMAC-SHA256 POST requests to sync data with external systems.",
    tips: [
      { icon: Webhook, label: "Events: page.created / page.updated / page.deleted" },
      { icon: ShieldCheck, label: "Delivery log retain 30 hari" },
    ],
  },
  tickets: {
    title: "Bug + feature requests",
    blurb: "Tickets go to the admin queue. Admin replies appear here.",
    tips: [
      { icon: LifeBuoy, label: "Priority low/med/high — admin override on review" },
    ],
  },
};

export function SettingsAside({ k }: { k: SettingsKey }) {
  const content = ASIDE[k];
  if (!content) return null;
  return (
    <aside className="space-y-4 xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto xl:scrollbar-thin xl:pr-1">
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-start gap-2">
          <HelpCircle className="size-4 mt-0.5 text-muted-foreground shrink-0" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">{content.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{content.blurb}</p>
          </div>
        </div>
        {content.tips && content.tips.length > 0 && (
          <ul className="space-y-2 pt-2 border-t border-border">
            {content.tips.map((t, i) => {
              const Icon = t.icon;
              return (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Icon className="size-3.5 mt-0.5 shrink-0 text-foreground/60" />
                  <span>{t.label}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {content.links && content.links.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Links</h3>
          <ul className="space-y-1.5">
            {content.links.map((l) => (
              <li key={l.href}>
                {l.external ? (
                  <a href={l.href} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-foreground/80 hover:text-foreground underline underline-offset-4">
                    <ExternalLink className="size-3" /> {l.label}
                  </a>
                ) : (
                  <Link href={l.href} className="inline-flex items-center gap-1 text-xs text-foreground/80 hover:text-foreground underline underline-offset-4">
                    {l.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-[10px] text-muted-foreground/70 pl-1">
        Need more help? <Link href="/dashboard/settings?s=tickets" className="underline underline-offset-4">Open a ticket</Link>.
      </p>
    </aside>
  );
}
