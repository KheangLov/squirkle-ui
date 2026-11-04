---
slug: 2026-11-04-manifests-core
status: done
writer: claude
writer_access: repo
writer_model: claude-opus-5-5 / low
base_commit: c836a1eec88b7f1d404cce88b46b498209f07f7d
complexity: simple
mode: full
approval_word: go
parent: 2026-11-04-manifests-plan
depends_on: []
implement_tier: BUILD-SECURE
files_to_read: [.ai/DECISIONS.md:15-19, .ai/SECURITY.md:12-20, packages/charts/package.json:30-52, .changeset/api-surface-freeze.md:1-10]
files_to_modify: [packages/core/package.json, packages/ui/package.json, packages/nuxt/package.json, packages/squirkle-ui/package.json]
files_to_create: [.changeset/manifests-core.md]
---

# Implementation Prompt
Role: Senior npm package maintainer for a dual Vue 2/3 library, responsible for manifests that resolve identically before and after, apart from the two intended changes.

Objective: In each manifest listed in `files_to_modify`, add `"./package.json": "./package.json"` as the last `exports` key. In `packages/ui/package.json` and `packages/squirkle-ui/package.json`, set `peerDependencies.vue` to `^2.7.16 || ^3.5.0`. core and nuxt have no `vue` peer. Add a changeset.

Context: DECISIONS D1-6 and D1-10. Public API report risks 10 and 12. G12 paths.

Relevant Files: `files_to_modify`, and `.changeset/manifests-core.md` (new).

Required Changes:
1. For each manifest in `files_to_modify`: `exports["./package.json"] = "./package.json"`, appended after the existing keys. No other key changes (no `engines`, D1-9).
2. Peer floor: In `packages/ui/package.json` and `packages/squirkle-ui/package.json`, set `peerDependencies.vue` to `^2.7.16 || ^3.5.0`. core and nuxt have no `vue` peer.
3. `.changeset/manifests-core.md`: a `minor` for `@squirkle-ui/ui` and `squirkle-ui` (breaking peer floor on 0.x, per `.changeset/README.md`) and a `patch` for `@squirkle-ui/core` and `@squirkle-ui/nuxt`. Text: "Export `./package.json`; the `vue` peer is now `^2.7.16 || ^3.5.0`, the versions that are built and tested."

Existing Patterns To Reuse: the export map in `packages/charts/package.json:30-52`; the changeset format in `.changeset/api-surface-freeze.md`.

Current Implementation: no package exports `./package.json`; the `vue` peer is `^2.7.0 || ^3.3.0`.

Architecture Constraints: Keep 2-space JSON and the trailing newline. Don't touch `files`, `main`/`module`/`types`, dependencies or versions. `pnpm install` must not be needed (peer ranges of workspace packages are not in the lockfile importers).

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

Constraints: Only the listed files. Commit `chore(manifests-core): export package.json and raise vue peer floor` on its own branch, when the user asks.

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
88%. The manifests were inspected. Assumption: peer ranges of workspace packages aren't recorded in the lockfile, and the frozen offline install verifies this. If it fails, STOP: that would be a G4 lockfile change.

## Import Check
approved_hash: e20eaae7ebe70c5463840b97833619cc921589b7f33c62e763c66cd7802c00cd
Approved with `go` typed by the user in this session (2026-11-04), which also covers the named check `pnpm install --frozen-lockfile --offline`. Written by Claude in this session.

## Implementation Log
- Edited the 4 manifests with a Node script; the diff is exactly the planned lines. Created `.changeset/manifests-core.md`.
- The manifest assertions pass. Self-reference resolution passes for all 4 packages. (The first attempt used `require.resolve` with `paths`, which doesn't test self-reference. I switched to `createRequire` from inside the package, which is a fix to the test method.)
- **STOP (plan broken):** `pnpm install --frozen-lockfile --offline` fails with ERR_PNPM_OUTDATED_LOCKFILE. The lockfile records `peerDependencies` specifiers for workspace importers (`vue (lockfile: ^2.7.0 || ^3.3.0, manifest: ^2.7.16 || ^3.5.0)`). The assumption in Confidence was wrong. Updating the lockfile is a G4-2 action and needs the user's confirmation. The lockfile is unchanged.
- The user confirmed the lockfile update ("confirm lockfile update"). Ran `pnpm install --lockfile-only --offline`: the `pnpm-lock.yaml` diff is exactly 2 `specifier:` lines (the ui and squirkle-ui `vue` peer). Nothing was installed, downloaded or upgraded. The `pnpm peers check` warnings (plugin-vue2, @nuxt/cli, @nuxt/vite-server) are tooling peers, not caused by this change.

## Checks
| Check | Result |
| --- | --- |
| Manifest assertions (4 manifests) | PASS |
| Self-reference `<name>/package.json` resolution (4) | PASS |
| `pnpm install --frozen-lockfile --offline` | PASS (after the confirmed lockfile update) |
| `pnpm test` | PASS (70/70) |
| `pnpm typecheck` / `pnpm build` | PASS / PASS |
| 6 examples via `examples.mjs` + `examples/nuxt2` build | PASS / PASS |
| `pnpm changeset status` | PASS |
| Security pass (G12 manifests) | PASS: the diff only adds the `./package.json` export, changes the `vue` peer floor and updates 2 lockfile specifiers. No new dependency, no scripts, no `files` or `publishConfig` change. |
| `/check-all` | NOT RUN: simple complexity; available on request |

## Metrics
- Files: 4 manifests and the lockfile modified (the lockfile was outside the original plan and was confirmed by the user); 1 changeset created.
