# Security

**Purpose:** the security rules active for this stack, the sensitive paths, and what enforces them. **Read when:** any code change (only the sections for the layers it touches); always for G12 paths.

- **Profile:** standard (`standard` = ASVS 5.0 L2; `high` = L3, where [HIGH] rules are mandatory and ARCH security rules take their strictest variant).
- **Standards checked:** 2026-11-04 — OWASP Top 10:2025, ASVS 5.0, API Security Top 10, PCI DSS 4.0.1.
- **Active sections:** S1 Universal, S2 Frontend, S5 Supply chain. S3 and S4 are inactive: no server, API, auth, database or payments in this repo. Exception: S3-1 applies to any SQL an agent writes, active or not.

## G12 Sensitive paths
- `.github/workflows/ci.yml`, `.github/workflows/pages.yml`
- `scripts/release.mjs`, `scripts/build.mjs`, `scripts/pages.mjs`, `scripts/examples.mjs`
- `.changeset/config.json`, `pnpm-workspace.yaml`, `package.json` and each `packages/<name>/package.json` (exports, publishConfig, dependencies)
- Raw-HTML sinks: `packages/ui/src/components/SqIcon.vue`, `packages/map/src/markers.ts`, `packages/map/src/SqMap.vue` (attribution HTML), `packages/editor/src/SqEditor.vue`
- Network code: `packages/ui/src/icons.ts`, `packages/ui/src/config.ts`, `packages/icons/src/SqIconPicker.vue`, `packages/map/src/adapters.ts`
- Nuxt head injection: `packages/nuxt/src/module.mjs`, `packages/nuxt/src/nuxt2.cjs`, `packages/nuxt/src/runtime/nuxt2-plugin.js`
- `apps/docs/index.html`
- Any file that adds or changes authentication, authorization, session or route-guard logic, wherever it lives.

## Trust boundaries and auth (evidence)
- Library code runs in the consumer's app; every prop, slot and config value comes from the consuming developer, and in some components from end users (editor content, field values).
- Iconify SVG bodies: trusted only from `addIcons`/`addCollection` data or the Iconify API host the app configures (`packages/ui/src/components/SqIcon.vue:11`).
- Editor HTML: Tiptap parses it against its schema (`packages/editor/src/SqEditor.vue:160`); the consumer renders the emitted HTML.
- No auth, tokens or sessions anywhere.

## ARCH decisions (variant chosen, residual risk, evidence)
- SqIcon raw HTML (S2-1 exception): `packages/ui/src/components/SqIcon.vue:16` and `packages/map/src/markers.ts:43` write Iconify SVG bodies as HTML. Residual risk: a compromised or app-misconfigured icon host injects markup. Evidence: host from `config.icons.api`, `false` disables fetching (`packages/ui/src/icons.ts:93`).
- Nuxt theme CSS: `packages/nuxt/src/module.mjs:43` injects generated CSS; Nuxt 2 disables the vue-meta sanitizer for that tag (`packages/nuxt/src/runtime/nuxt2-plugin.js:12`). Residual risk: a theme value from untrusted input could break out of the style tag. Evidence: values come from the app's own config.
- Map attribution: the `attribution` prop is rendered as HTML by Leaflet (`packages/map/src/adapters.ts:114`). Residual risk: caller-supplied HTML. UNVERIFIED for the MapLibre path.
- Editor links: `packages/editor/src/SqEditor.vue:124` accepts any `scheme:` prefix; `javascript:` blocking is UNVERIFIED (S2-3).
- Headers (S1-8): GitHub Pages can't set headers; no CSP. Accepted for the docs site.

## S1 Universal
- S1-1 · MUST · REVIEW · Deny by default: every route, job and query authorizes on the server; client checks are UX only.
- S1-2 · MUST · REVIEW · Every external input is schema-validated at the boundary (type, length, range, format); unknown fields rejected.
- S1-3 · MUST · REVIEW · Output is encoded for its sink with framework-safe APIs; untrusted data is never concatenated into HTML, SQL, shell, URLs or headers.
- S1-4 · MUST · REVIEW · Fail closed: clients get a generic message plus a request id, never stack traces, SQL errors, paths or versions. No empty catch.
- S1-5 · MUST · REVIEW · Log sign-ins, authorization and validation failures, admin actions and money movement with user id, time and request id; never secrets, tokens, OTPs, card data or full national ids.
- S1-6 · MUST · REVIEW · Secrets only from env or a secret manager; never in code, tests, images, bundles or logs.
- S1-7 · MUST · REVIEW · Outbound calls have timeouts; list endpoints have a max page size; bodies have a size limit.
- S1-8 · ARCH · REVIEW · Web headers: HSTS 1 year, CSP without unsafe-inline/unsafe-eval (nonces or hashes), nosniff, frame-ancestors none or an allowlist, strict-origin-when-cross-origin, minimal Permissions-Policy.

## S2 Frontend
- S2-1 · MUST · TOOL (lint) · No raw-HTML sinks with data; user HTML/Markdown/SVG only through one reviewed sanitizer helper.
- S2-2 · MUST · REVIEW · No eval, new Function, string timers or data-driven dynamic imports.
- S2-3 · MUST · REVIEW · URLs from data allow https (mailto/tel where needed) only; redirects only to an internal allowlist.
- S2-4 · ARCH · REVIEW · Auth tokens never in localStorage, sessionStorage or IndexedDB; prefer HttpOnly Secure SameSite cookies; an SPA access token lives in memory, short-lived.
- S2-5 · MUST · REVIEW · Cookie-authenticated state changes carry a CSRF token, or SameSite=Strict plus an Origin check.
- S2-6 · MUST · REVIEW · postMessage checks event.origin; never `*` as target for sensitive data; iframes sandboxed; new-tab links use noopener.
- S2-7 · MUST · REVIEW · External scripts carry SRI and are listed below with a reason; none on login or payment pages unless approved (PCI DSS 6.4.3, 11.6.1).
- S2-8 · MUST · REVIEW · Only public config reaches the client; no public source maps or debug flags in production; no sensitive data in URLs.

## S3 Backend and API
- S3-1 · MUST · REVIEW · SQL only through parameterized queries or ORM bindings; ORDER BY and column names from an allowlist; no shell with input (args arrays only).
- S3-2 · MUST · REVIEW · Each endpoint declares its permission; every object access checks ownership or tenant. Unguessable ids are not authorization.
- S3-3 · MUST · REVIEW · SSRF: user-supplied URLs only to allowlisted hosts; private, loopback, link-local and metadata addresses blocked after DNS; no redirects to disallowed hosts.
- S3-4 · MUST · REVIEW · DTOs mapped field by field; never a raw body into an ORM write.
- S3-5 · MUST · REVIEW · Paths confined to a base dir; uploads checked by content, size-limited, renamed, served with Content-Disposition and nosniff.
- S3-6 · MUST · REVIEW · Passwords: Argon2id (or bcrypt 12+, scrypt). Rate limits on login, OTP, reset, sign-up. Reset tokens single-use, short-lived, hashed.
- S3-7 · ARCH · REVIEW · Sessions: HttpOnly Secure SameSite cookies, rotated on login and privilege change, idle and absolute timeouts. JWT: pin the algorithm, verify signature, exp, iss and aud; short access tokens; rotating refresh tokens with reuse detection.
- S3-8 · MUST · REVIEW · CORS: explicit allowlist; never `*` with credentials; never reflect Origin.
- S3-9 · MUST · REVIEW · Money: integer minor units or decimals; the server recomputes totals; idempotency keys on payments; balance changes in one transaction with row locks or a conditional update.
- S3-10 · MUST · REVIEW · Webhooks: HMAC verified with a constant-time compare, timestamp window, idempotent processing.
- S3-11 · MUST · REVIEW · No native deserialization of untrusted data; no custom crypto (AES-256-GCM or ChaCha20-Poly1305, CSPRNG tokens, constant-time compares, keys from a secret manager).

## S4 Database
- S4-1 · MUST · REVIEW · Migrations reversible or marked irreversible with a backup step; expand-and-contract for live tables.
- S4-2 · ARCH · REVIEW · Least-privilege DB users; tenant isolation by query scoping or row-level security (state which).
- S4-3 · MUST · REVIEW · Synthetic data only in seeds, fixtures and tests. Card numbers not stored without approved PCI scope; CVV never.
- S4-4 · MUST · REVIEW · Financial records append-only; corrections are new rows.

## S5 Supply chain and AI-agent risks
- S5-1 · MUST · TOOL (CI) · Lockfile committed; CI installs frozen.
- S5-2 · SHOULD · TOOL · Release-age cooldown of 7 days in the package manager config; install scripts blocked except an allowlist.
- S5-3 · SHOULD · TOOL (CI) · Dependency audit on every PR (fail on high/critical with a fix); GitHub Actions pinned to commit SHAs with minimal `permissions:`; no secrets for fork PRs; no untrusted code under pull_request_target.
- S5-4 · MUST · REVIEW · Never `curl … | sh`. AI-suggested packages, URLs, repos and skills are verified real before use.
- S5-6 · MUST · HUMAN · An advisory that matches a lockfile package → follow the incident steps in `.ai/SECURITY_WATCH.md`; no installs, upgrades or removals until the user confirms.
- S5-5 · MUST · REVIEW · If the app calls an LLM: model output is untrusted input; tool calls it triggers still pass authorization; no secrets in prompts.

## Enforcement status
| Layer | Status (SET / PROPOSED / UNVERIFIED) |
| --- | --- |
| Lockfile + frozen install in CI (S5-1) | SET (`.github/workflows/ci.yml`) |
| Workflow `permissions:` (S5-3) | SET (`contents: read` in both workflows) |
| Actions pinned to SHAs (S5-3) | PROPOSED (pinned to major tags) |
| Dependency audit in CI (S5-3) | PROPOSED |
| Release-age cooldown (S5-2) | PROPOSED (`minimumReleaseAge` absent) |
| Install-script allowlist (S5-2) | SET (`pnpm-workspace.yaml` allowBuilds) |
| Secret scan | PROPOSED |
| Settings deny rules (G3-1, G4-9) | UNVERIFIED (`.ai/setup/proposals/settings.json` pending) |
| Lint (S2-1, G9-2) | PROPOSED (no linter) |
| Hooks / pre-commit | PROPOSED (none) |

## External script inventory
- `apps/docs/index.html`: Google Fonts stylesheet (no SRI; fonts only, no script). No external scripts in the docs or examples.

