<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# NOTE: Environment variables must be kept in .env / .env.local and NEVER committed to git.
# Refer to .env.example for required variable definitions.

<!-- VERCEL BEST PRACTICES START -->
## Best practices for developing on Vercel

These defaults are optimized for AI coding agents (and humans) working on apps that deploy to Vercel.

- Treat Vercel Functions as stateless + ephemeral (no durable RAM/FS, no background daemons), use Blob or marketplace integrations for preserving state
- Edge Functions (standalone) are deprecated; prefer Vercel Functions
- Don't start new projects on Vercel KV/Postgres (both discontinued); use Marketplace Redis/Postgres instead
- Store secrets in Vercel Env Variables; not in git or `NEXT_PUBLIC_*`
- Provision Marketplace native integrations with `vercel integration add` (CI/agent-friendly)
- Sync env + project settings with `vercel env pull` / `vercel pull` when you need local/offline parity
- Use `waitUntil` for post-response work; avoid the deprecated Function `context` parameter
- Set Function regions near your primary data source; avoid cross-region DB/service roundtrips
- Tune Fluid Compute knobs (e.g., `maxDuration`, memory/CPU) for long I/O-heavy calls (LLMs, APIs)
- Use Runtime Cache for fast **regional** caching + tag invalidation (don't treat it as global KV)
- Use Cron Jobs for schedules; cron runs in UTC and triggers your production URL via HTTP GET
- Use Vercel Blob for uploads/media; Use Edge Config for small, globally-read config
- If a deployment URL returns a Vercel Deployment Protection 401/403, retry the same URL with `vercel curl <url>`; don't disable protection or manage bypass secrets manually
- Add OpenTelemetry via `@vercel/otel` on Node; don't expect OTEL support on the Edge runtime
- Enable Web Analytics + Speed Insights early
- Use AI Gateway for model routing, set AI_GATEWAY_API_KEY, using a model string (e.g. 'anthropic/claude-sonnet-4.6'), Gateway is already default in AI SDK
  needed. Always curl https://ai-gateway.vercel.sh/v1/models first; never trust model IDs from memory
- For durable agent loops or untrusted code: use Workflow (pause/resume/state) + Sandbox; use Vercel MCP for secure infra access
<!-- VERCEL BEST PRACTICES END -->

<!-- HOUSE RULES START -->

## House rules

Read `docs/conventions.md` before changing code. The short version:

- **Forms use `react-hook-form`.** One `useForm` per form. A multi-step wizard is one form whose fields are grouped per step — never one form per step. Validate the current step with `form.trigger([...fields])` on Next.
- **Never lose a draft.** Persist to localStorage keyed by form name, restore on mount, clear after a successful submit. Exclude passwords, tokens, card data, and health screening answers.
- **Server state uses TanStack Query.** No `useEffect` + `fetch` + `useState`. `useEffect` remains correct for non-data side effects (listeners, measurements, third-party widgets).
- **No garbage code.** Delete dead code instead of commenting it out; no `any` to dodge a type problem; name things with the vocabulary in `GLOSSARY.md`.
- **Comment the why, not the what.** Every non-obvious decision earns a comment; a comment that restates the line below it gets deleted.
- **Write for the next human.** A file should read top-to-bottom without a map.

Neither library is installed yet — `pnpm add react-hook-form @tanstack/react-query` at first use. Existing code migrates as it is touched; no big-bang rewrite.

<!-- HOUSE RULES END -->
