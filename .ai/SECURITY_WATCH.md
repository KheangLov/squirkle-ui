# Security watch

**Purpose:** incident steps when a security advisory (GHSA, CVE, npm audit, Socket, news) matches a package in `pnpm-lock.yaml`. **Read when:** an advisory names a dependency. Rule: S5-6 (`.ai/SECURITY.md`).

## Incident steps
1. Stop: no `pnpm install`, add, upgrade, remove or lockfile edit. Installs pause until step 5.
2. Report to the user: advisory ID and link, package, affected range, the version(s) in the lockfile (`pnpm why <pkg>`), and whether it is direct or transitive.
3. Assess exposure: which `packages/*` or apps pull it in, whether it ships in a published build or is dev-only, and whether a known-malicious version (not just a vuln) was ever installed. A malicious version → also recommend rotating any token present on machines or CI that installed it (G3-2; never read the secrets).
4. Propose the fix: a pinned safe version, a `pnpm.overrides` entry or removal, verified real per S5-4, with the 7-day release-age cooldown (S5-2) noted.
5. Wait for the user's chat confirmation naming the change (G4-2). Then apply it, run `pnpm test`, `pnpm typecheck`, `pnpm build`, and report.
6. Record the advisory, the decision and the date in `.ai/DECISIONS.md`.
