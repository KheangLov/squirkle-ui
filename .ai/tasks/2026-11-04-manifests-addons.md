---
slug: 2026-11-04-manifests-addons
status: done
writer: claude
writer_access: repo
writer_model: claude-opus-5-5 / low
base_commit: b73919eb5faac6ba1fb68424489c89e4002625a4
complexity: simple
mode: full
approval_word: go
parent: 2026-11-04-manifests-plan
depends_on: []
implement_tier: BUILD-SECURE
files_to_read: [.ai/DECISIONS.md:15-19, .ai/SECURITY.md:12-20, packages/charts/package.json:30-52, .changeset/api-surface-freeze.md:1-10]
files_to_modify: [packages/calendar/package.json, packages/charts/package.json, packages/datagrid/package.json, packages/editor/package.json, packages/icons/package.json, packages/map/package.json, packages/swiper/package.json, pnpm-lock.yaml]
files_to_create: [.changeset/manifests-addons.md]
---

# Implementation Prompt
Role: Senior npm package maintainer for a dual Vue 2/3 library, responsible for manifests that resolve identically before and after, apart from the two intended changes.

Objective: In each manifest listed in `files_to_modify`, add `"./package.json": "./package.json"` as the last `exports` key. In all 7 add-on manifests, set `peerDependencies.vue` to `^2.7.16 || ^3.5.0`. Add a changeset.

Context: DECISIONS D1-6 and D1-10. Public API report risks 10 and 12. G12 paths.

Relevant Files: `files_to_modify`, and `.changeset/manifests-addons.md` (new).

Required Changes:
1. For each manifest in `files_to_modify`: `exports["./package.json"] = "./package.json"`, appended after the existing keys. No other key changes (no `engines`, D1-9).
2. Peer floor: In all 7 add-on manifests, set `peerDependencies.vue` to `^2.7.16 || ^3.5.0`.
3. `.changeset/manifests-addons.md`: a `minor` for all 7 add-ons (breaking peer floor on 0.x). Text: "Export `./package.json`; the `vue` peer is now `^2.7.16 || ^3.5.0`."

Existing Patterns To Reuse: the export map in `packages/charts/package.json:30-52`; the changeset format in `.changeset/api-surface-freeze.md`.

Current Implementation: no package exports `./package.json`; the `vue` peer is `^2.7.0 || ^3.3.0`.

Architecture Constraints: Keep 2-space JSON and the trailing newline. Don't touch `files`, `main`/`module`/`types`, dependencies or versions. The lockfile records workspace peer specifiers (found in manifests-core), so `pnpm install --lockfile-only --offline` updates them. This is a named G4 action, and the approval word covers it; the lockfile diff must be `specifier:` lines only.

Edge Cases: the umbrella's 27 subpath keys stay in order. The Nuxt package's `.` export has only an `import` condition, which stays as it is (that's a separate Nuxt task).

Error Handling: N/A. Static JSON.

Performance: N/A.

Security: G12 manifest. The security pass confirms the diff only adds the `./package.json` export and changes the peer floor: no new dependency, no `scripts`, no `publishConfig` or `files` change. Exposing `package.json` reveals nothing that npm doesn't already publish.

Testing Requirements:
- A `node -e` assertion over each manifest: `exports["./package.json"] === "./package.json"`, and the `vue` peer equals `^2.7.16 || ^3.5.0` where present.
- Self-reference resolution: `require.resolve('<name>/package.json', { paths: ['packages/<dir>'] })` succeeds for each package.
- `pnpm install --frozen-lockfile --offline` exits 0 (a named G4 check: it proves the lockfile still matches and writes nothing).
- `pnpm test`, `pnpm typecheck` and `pnpm build`.
- `node scripts/examples.mjs vue3-vite vue3-all-in-one vue2-vite vue2-webpack nuxt3 nuxt4` and `pnpm --dir examples/nuxt2 build`.
- `pnpm changeset status`.

Acceptance Criteria:
- [ ] Manifest assertions pass for every listed manifest.
- [ ] Self-reference resolution passes for every listed package.
- [ ] Frozen offline install exits 0, and `git status` shows no lockfile change.
- [ ] test, typecheck, build, all 7 examples and changeset status exit 0.
- [ ] `git diff` touches only `files_to_modify`, the changeset and this task file.

Constraints: Only the listed files. Commit `chore(manifests-addons): export package.json and raise vue peer floor` on its own branch, when the user asks.

Output Format: the check table in this file.

# Implementation Plan
Steps:
1. Edit the manifests with a scratchpad Node script (parse, set, then `JSON.stringify(j, null, 2) + "\n"`).
2. Review the `git diff`.
3. Run the assertions and checks.
4. Do the security pass.
5. Record the results.

Files To Read: D1 (the values); SECURITY G12 (the scope); the charts manifest (the shape); the changeset sample.

Files To Delete: none. Dependencies: none.

Risks: Reserializing could reorder keys or change formatting; review the diff. Consumers on Vue 2.7.0–2.7.15 or 3.3–3.4 get peer warnings; this is intended per D1-6 and is called out in the changeset.

Testing Plan: as above.

Documentation: none beyond the changeset.

Model Tier: BUILD-SECURE.

Decision record needed? No. D1 covers it.

# Prompt Quality Check
| Essential | Pass/Fail | Note |
| --- | --- | --- |
| Clarity | Pass | exact keys and values |
| Role | Pass | |
| Context | Pass | |
| Format | Pass | |
| Iteration | Pass | |

# Confidence
90%. The manifests were inspected. Lockfile behavior was verified in manifests-core: only `specifier:` lines change.

## Import Check
approved_hash: 1044d09b9d74e4d6f39d8655152404fd92e893b9d9c48b8fed1dd06b9679a4e4
Approved with `go` typed by the user in this session (2026-11-04), which also covers the named G4 action `pnpm install --lockfile-only --offline`. Written by Claude in this session.

## Implementation Log
- Edited the 7 manifests with a Node script. The diff is 7× (the `./package.json` export plus the `vue` floor) and nothing else. Created `.changeset/manifests-addons.md`.
- Ran `pnpm install --lockfile-only --offline` (approved G4 action). The lockfile diff is exactly 7 `specifier:` lines. Nothing was installed or upgraded.
- No `^2.7.0 || ^3.3.0` peer remains in any package manifest.

## Checks
| Check | Result |
| --- | --- |
| Manifest assertions (7) | PASS |
| Self-reference `<name>/package.json` resolution (7) | PASS |
| Lockfile diff only `specifier:` lines | PASS (7 lines) |
| `pnpm install --frozen-lockfile --offline` | PASS |
| `pnpm test` | PASS (70/70) |
| `pnpm typecheck` / `pnpm build` | PASS / PASS |
| 6 examples via `examples.mjs` + `examples/nuxt2` build | PASS / PASS |
| `pnpm changeset status` | PASS |
| Security pass (G12 manifests) | PASS: only the export and peer floor; no new dependency, scripts, `files` or `publishConfig` change |
| `/check-all` | NOT RUN: simple complexity; available on request |

## Metrics
- Files: 7 manifests and the lockfile modified; 1 changeset created.
