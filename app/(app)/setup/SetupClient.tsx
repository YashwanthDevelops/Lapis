"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, Circle, Crown, Database, LogIn, Rocket, UserPlus } from "lucide-react";
import { api } from "@convex/_generated/api";
import { Button } from "@/shared/ui/button";
import { useAdminRole } from "@/shared/hooks/useAdminRole";

/** First-run onboarding wizard — same flow as the rest of the template
 *  fleet: the first visitor creates an account, claims ownership
 *  (superadmin), seeds the demo data, and lands in the workspace. Once a
 *  superadmin exists the wizard collapses into a plain sign-in pointer. */
export function SetupClient() {
  const router = useRouter();
  const { signedIn, loading, isSuperAdmin, claimableSuperAdmin, claim } = useAdminRole();
  const setupStatus = useQuery(api.setup.status);
  const seedAll = useMutation(api.setup.seedAll);
  const [claiming, setClaiming] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedNote, setSeedNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const step1Done = signedIn;
  const step2Done = isSuperAdmin;
  const step3Done = !!setupStatus?.seeded;
  const claimedByOther = signedIn && !isSuperAdmin && !claimableSuperAdmin;

  const onClaim = async () => {
    setClaiming(true);
    setError(null);
    try {
      await claim();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not claim ownership. Try again.");
    } finally {
      setClaiming(false);
    }
  };

  const onSeed = async () => {
    setSeeding(true);
    setError(null);
    try {
      const res = await seedAll({});
      setSeedNote(
        res.alreadySeeded
          ? `Template gallery refreshed (${res.gallery.updated} templates).`
          : `${res.gallery.inserted} templates and a sample workspace (${res.showcase?.insertedPages ?? 0} pages, ${res.showcase?.insertedDatabases ?? 0} databases) were added.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load sample data. Try again.");
    } finally {
      setSeeding(false);
    }
  };

  if (loading || setupStatus === undefined) {
    return <div className="h-40 animate-pulse rounded-xl border bg-muted/30" />;
  }

  return (
    <div className="space-y-6">
      {setupStatus?.authReady === false && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
          <p className="font-medium">Authentication keys are not configured</p>
          <p className="mt-1 text-muted-foreground">
            The Convex backend needs a JWT signing key before email sign-up can
            work. For Convex Cloud, make sure your deploy key can write
            environment variables and redeploy:
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-muted-foreground">
            <li>
              <a className="underline" href="https://dashboard.convex.dev" target="_blank" rel="noreferrer">dashboard.convex.dev</a>{" "}
              → your project → <b>Production</b> → Settings → Deploy Keys →
              create a key with <b>deploy + env:view + env:write</b> capabilities{" "}
              (or full access) using a team admin account.
            </li>
            <li>In Vercel, replace <b>CONVEX_DEPLOY_KEY</b> under Settings → Environment Variables.</li>
            <li><b>Redeploy</b> to provision the authentication keys during the build.</li>
          </ol>
        </div>
      )}
      <ol className="space-y-4">
        <Step done={step1Done} title="1. Create an account">
          <p className="text-sm text-muted-foreground">
            Sign up with an email and password, or Google if it is configured.
          </p>
          {!step1Done && (
            <Button asChild size="sm" className="mt-1 gap-2">
              <Link href="/auth"><UserPlus className="size-4" /> Sign up / Sign in</Link>
            </Button>
          )}
        </Step>

        <Step done={step2Done} title="2. Claim ownership">
          <p className="text-sm text-muted-foreground">
            The first visitor becomes the superadmin and gets full control of this workspace.
          </p>
          {signedIn && claimableSuperAdmin && (
            <Button size="sm" onClick={onClaim} disabled={claiming} className="mt-1 gap-2">
              <Crown className="size-4" />
              {claiming ? "Claiming…" : "Claim ownership"}
            </Button>
          )}
          {claimedByOther && (
            <p className="text-sm text-amber-600">
              This workspace already has an owner. Ask the superadmin for access.
            </p>
          )}
        </Step>

        <Step done={step3Done} title="3. Add sample data">
          <p className="text-sm text-muted-foreground">
            Add 26+ templates (CRM, sprint planning, budgets, and more) plus a
            sample workspace with pages, databases, and every view type.
          </p>
          {step2Done && !step3Done && (
            <Button size="sm" onClick={onSeed} disabled={seeding} className="mt-1 gap-2">
              <Database className="size-4" />
              {seeding ? "Adding sample data…" : "Add sample data"}
            </Button>
          )}
          {!step2Done && !step3Done && (
            <p className="text-xs text-muted-foreground">
              Claim ownership first. Only the owner or an admin can add sample data.
            </p>
          )}
          {seedNote && <p className="text-sm text-green-600">{seedNote}</p>}
        </Step>

        <Step done={step2Done && step3Done} title="4. Open your workspace">
          <p className="text-sm text-muted-foreground">
            Your block editor, databases, and sharing tools are ready to use.
          </p>
        </Step>
      </ol>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2 border-t pt-4">
        <Button
          variant={step2Done ? "default" : "outline"}
          className="gap-2"
          onClick={() => router.push("/dashboard")}
        >
          <Rocket className="size-4" /> Open workspace
        </Button>
        {!signedIn && (
          <Button asChild variant="ghost" className="gap-2">
            <Link href="/auth"><LogIn className="size-4" /> I already have an account</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function Step({ done, title, children }: { done: boolean; title: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      {done
        ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" />
        : <Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />}
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        {children}
      </div>
    </li>
  );
}
