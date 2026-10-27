"use client";

import { Component, useState, type ReactNode } from "react";
import { AlertTriangle, Check, Copy } from "lucide-react";
import { Button } from "@/shared/ui/button";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

/** Fleet-standard detection ladder for `/setup` (mirrors the template
 *  fleet's SetupHealth): 1) NEXT_PUBLIC_CONVEX_URL present? 2) backend
 *  functions deployed? (the wizard's first query throws if not — caught
 *  by the boundary). Both failure states render plain-language fixes so
 *  a cloner never has to dig through docs. */
export function SetupGate({ children }: { children: ReactNode }) {
  if (!CONVEX_URL || CONVEX_URL.includes("placeholder")) {
    return (
      <Warn title="Connect your database (Convex)">
        <p className="text-sm text-muted-foreground">
          The site does not have your database URL yet. In <b>Vercel → Settings →
          Environment Variables</b>, add these two values, then <b>redeploy</b>:
        </p>
        <EnvBlock />
        <p className="text-xs text-muted-foreground">
          Need these values? Create a project at{" "}
          <a className="underline" href="https://convex.dev" target="_blank" rel="noreferrer">convex.dev</a>{" "}
          — find the URL under Settings and the deploy key under Settings → Deploy Keys.
        </p>
      </Warn>
    );
  }
  return <BackendBoundary>{children}</BackendBoundary>;
}

class BackendBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <Warn title="Backend functions are not deployed">
          <p className="text-sm text-muted-foreground">
            The database is connected, but its functions are missing (error{" "}
            <code>Server Error</code>). Make sure <b>CONVEX_DEPLOY_KEY</b>{" "}
            is set in Vercel, then <b>redeploy</b>. The build will push the
            functions and tables to Convex.
          </p>
          <EnvBlock />
          <Button size="sm" variant="outline" className="w-fit" onClick={() => location.reload()}>
            Check again
          </Button>
        </Warn>
      );
    }
    return this.props.children;
  }
}

function Warn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border p-5">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
      <div className="flex flex-col gap-2">
        <p className="font-medium">{title}</p>
        {children}
      </div>
    </div>
  );
}

function EnvBlock() {
  const text = "NEXT_PUBLIC_CONVEX_URL\nCONVEX_DEPLOY_KEY";
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs">
        <code>
          NEXT_PUBLIC_CONVEX_URL = https://your-project.convex.cloud{"\n"}
          CONVEX_DEPLOY_KEY = (deploy key production)
        </code>
      </pre>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => {
          void navigator.clipboard?.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="absolute right-2 top-2 size-7 text-muted-foreground"
        aria-label="Copy variable names"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </Button>
    </div>
  );
}
