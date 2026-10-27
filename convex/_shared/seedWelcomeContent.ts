/** First-run demo seed — inserts a few attractive welcome pages into
 *  a freshly-created personal workspace. Fired ONCE per user from
 *  `ensurePersonalWorkspace` when the workspace is just being created
 *  (never on idempotent re-calls). Keeps the bar low — text-shape
 *  blocks only, no databases / no embedded media — so the seed is
 *  self-contained and won't drift if block-renderer plumbing changes.
 *
 *  Skipped when LAPIS_DISABLE_SEED is "1" — lets
 *  self-hosters opt out without forking. */

import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { uid } from "./uid";
import { newPageBlockFields, insertPageBlocks } from "./pageContent";

type Block = { id: string; type: string; text: string };

function p(text: string): Block { return { id: uid(), type: "paragraph", text }; }
function h2(text: string): Block { return { id: uid(), type: "h2", text }; }
function h3(text: string): Block { return { id: uid(), type: "h3", text }; }
function bullet(text: string): Block { return { id: uid(), type: "bullet", text }; }
function quote(text: string): Block { return { id: uid(), type: "quote", text }; }
function divider(): Block { return { id: uid(), type: "divider", text: "" }; }

const SEED_PAGES: Array<{ title: string; icon: string; blocks: Block[] }> = [
  {
    title: "👋 Welcome to Lapis",
    icon: "👋",
    blocks: [
      p("Lapis is your flexible workspace for notes, plans, and shared knowledge. Shape it around the way you think and work."),
      h2("What you can do here"),
      bullet("**Write** pages with rich blocks — headings, lists, quotes, code, math, callouts."),
      bullet("**Organise** with nested sub-pages + drag-and-drop reorder."),
      bullet("**Database views** — Table, Board (kanban), List, Gallery, Calendar, Feed."),
      bullet("**Share** publicly with optional password + indexable toggle."),
      bullet("**Collaborate** — invite teammates to a workspace; comments + @mentions + snapshots."),
      bullet("**Bring AI** — first-class MCP endpoint for Claude / ChatGPT / Cursor (Settings → MCP)."),
      h2("Open the side menu →"),
      p("Hover the sidebar to see all your pages. Click `+` to add new ones. Drag to reorder. Right-click for more actions."),
      quote("Tip: press `/` inside any block to open the slash menu — every block type, one keystroke away."),
    ],
  },
  {
    title: "✨ Try the slash menu",
    icon: "✨",
    blocks: [
      p("This page is your playground. Edit, delete, reorganise — your data is yours."),
      h2("Keystrokes worth learning"),
      bullet("`/` — slash menu (block-type picker)"),
      bullet("`**bold**`, `_italic_`, `~~strike~~`, `` `code` ``, `$math$`, `[label](url)` — inline markdown shortcuts (the decorator renders them live, source stays plain)"),
      bullet("`⌘K` — command palette (everything, fast)"),
      bullet("`⌘/` — show every keyboard shortcut"),
      h2("Try this"),
      p("Click the end of this paragraph, hit Enter, type `/heading 2` then Enter — instant heading."),
      h3("Like this one"),
      p("Or type `/database` to embed a Table / Board / Gallery view inline."),
      divider(),
      p("When you're done exploring, delete this page (sidebar → ⋯ → Move to trash) or keep it as a cheat sheet."),
    ],
  },
  {
    title: "🚀 Self-hosting & next steps",
    icon: "🚀",
    blocks: [
      p("Make this workspace yours. Organise your work, adjust your setup, and invite people when you are ready."),
      h2("Three deployment lanes"),
      bullet("**Convex Cloud** — fastest, free tier covers small teams."),
      bullet("**Self-hosted Docker** — your VPS + Postgres + S3 (optional)."),
      bullet("**Your Lapis deployment** — use Convex Cloud or self-host with Docker."),
      p("Setup instructions: `DEPLOY.md` in the project repository."),
      h2("Get involved"),
      bullet("Help and contribution guidance: see `CONTRIBUTING.md` in the project repository."),
      bullet("For security disclosures, follow the private reporting instructions in `SECURITY.md`."),
      h2("Looking for the UI primitives only?"),
      p("Lapis can exchange workspace content with Notion when you need to move existing work."),
    ],
  },
];

export async function seedWelcomeContent(
  ctx: MutationCtx,
  userId: Id<"users">,
  workspaceId: Id<"workspaces">,
): Promise<void> {
  // Opt-out env var lets self-hosters disable the seed without forking.
  // Convex env vars are env-injected via `bunx convex env set`.
  if (process.env.LAPIS_DISABLE_SEED === "1" || process.env.SILONG_DISABLE_SEED === "1") return;

  const now = Date.now();
  for (const page of SEED_PAGES) {
    const pageId = await ctx.db.insert("pages", {
      userId,
      workspaceId,
      parentId: null,
      title: page.title,
      icon: page.icon,
      cover: null,
      ...newPageBlockFields(page.blocks),
      favorite: false,
      trashed: false,
      isPublic: false,
      searchText: `${page.title} ${page.blocks.map((b) => b.text).join(" ")}`,
      createdAt: now,
      updatedAt: now,
    });
    await insertPageBlocks(ctx, pageId, page.blocks);
  }
}
