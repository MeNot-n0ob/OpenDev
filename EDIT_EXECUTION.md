# EDIT_EXECUTION — Project-Wide Execution Plan

This document is the meta-plan: it describes how to execute changes across the
entire repo. Use it to coordinate multi-file edits, codegen steps, migrations,
and verification. Follow it step by step, not all at once.

---

## 1. File Inventory — All Targets

### New files to create

| File | Purpose |
|------|---------|
| `EDITS.md` | DONE — Agent behavior guide, shorthand, edit rules |
| `EDIT_EXECUTION.md` | THIS FILE — Execution plan orchestrator |

### Files to modify

| File | What changes |
|------|-------------|
| `AGENTS.md` | DONE — Rewrite: add commands, monorepo structure, codegen workflow, test patterns, condensed style |
| `packages/opencode/AGENTS.md` | DONE — Trimmed duplicated Effect Core/Schema rules; cross-refs root AGENTS.md |
| `packages/llm/AGENTS.md` | No change needed — already comprehensive |
| `packages/schema/AGENTS.md` | No change needed — already comprehensive |
| `packages/client/AGENTS.md` | DONE — Already existed with correct content |
| `packages/app/AGENTS.md` | No change needed |
| `packages/desktop/AGENTS.md` | No change needed |
| `packages/codemode/AGENTS.md` | No change needed |
| `packages/effect-drizzle-sqlite/AGENTS.md` | No change needed |
| `packages/opencode/test/AGENTS.md` | No change needed |
| `packages/opencode/test/server/AGENTS.md` | No change needed |

### Files to read for verification (no edits)

| File | Why |
|------|-----|
| `turbo.json` | Verify task names match typecheck/test commands |
| `bunfig.toml` | Verify test guard path and install settings |
| `.oxlintrc.json` | Verify lint command + rules |
| `package.json` root | Verify scripts match documented commands |
| `packages/opencode/package.json` | Verify test/typecheck commands |
| `packages/core/package.json` | Verify migration/typecheck commands |
| `packages/client/package.json` | Verify generate command |
| `packages/schema/package.json` | Verify exports + typecheck |
| `packages/protocol/package.json` | Verify exports + typecheck |

---

## 2. Execution Order

Dependency order matters. Follow this sequence:

```
Step 1: Create EDITS.md                    ← DONE
Step 2: Create EDIT_EXECUTION.md           ← DONE
Step 3: Rewrite AGENTS.md                  ← DONE
Step 4: Create packages/client/AGENTS.md   ← DONE (already existed — content verified)
Step 5: Verify consistency across all files ← DONE
Step 6: Validate commands (dry-run or grep)    ← DONE
```

### Step 3 — Rewrite AGENTS.md

**File:** `repo-root/AGENTS.md`

**Inputs to read:**
- current `AGENTS.md` (preserve V2 Session Core bullets, top dep-direction bullets)
- `package.json` root (extract all scripts)
- `turbo.json` (extract task names)
- `packages/opencode/package.json` (test, typecheck, dev commands)
- `packages/core/package.json` (migration, test, typecheck)
- `packages/client/package.json` (generate, check:generated)
- `packages/schema/package.json`, `packages/protocol/package.json` (typecheck)
- `packages/opencode/AGENTS.md` (Effect rules to condense)
- `packages/opencode/test/AGENTS.md` (test patterns)
- `packages/llm/AGENTS.md` (recorded test patterns)

**Sections to include:**
1. Quick Commands — exact scripts from all `package.json` files
2. Monorepo Layout — 32 packages, key dep chain, entrypoints
3. Codegen — Protocol/HttpApi -> bun run generate chain, generated dirs
4. Testing — `testEffect`, `it.effect/live/instance`, recorded tests, `pollWithTimeout`
5. Architecture — V2 Session Core (preserve from current file)
6. Style Guide — condensed to rule bullets only (drop verbose examples)

**Verification:**
- Every command in §1 exists in at least one `package.json`
- No code example with broken syntax
- V2 Session Core bullets intact
- Paths are root-relative and correct

### Step 4 — Create packages/client/AGENTS.md (if absent)

**File:** `repo-root/packages/client/AGENTS.md`

**Content:**
- After changing Protocol/Schema, run `bun run generate`
- Verify with `bun run check:generated` (`bun run generate && git diff --exit-code`)
- Do not edit `src/generated/` or `src/generated-effect/` directly
- Typecheck: `bun run typecheck` (uses `tsgo --noEmit`)
- Test: `bun test --timeout 5000`

### Step 5 — Verify consistency

Cross-check every documented command against actual `package.json` scripts:

| Documented command | Must match | Where verified |
|---|---|---|
| `bun dev` | `packages/opencode dev` script | Root `package.json` |
| `bun lint` | `oxlint` | Root `package.json` |
| `bun typecheck` | `bun turbo typecheck` | Root `package.json` |
| `bun run generate` | `packages/client generate` script | `packages/client/package.json` |
| `bun run migration` | `packages/core migration` script | `packages/core/package.json` |
| `tsgo --noEmit` | Typecheck commands in `packages/opencode/core/schema/protocol/client` | Each package's `package.json` |
| Test guard | `bunfig.toml` `root` field | `bunfig.toml:8` |

### Step 6 — Validate

```bash
# No syntax errors in markdown files
# (markdown lint not installed; visual review is sufficient)

# Verify AGENTS.md commands are real
grep -rn '"dev"' packages/opencode/package.json
grep -rn '"generate"' packages/client/package.json
grep -rn '"migration"' packages/core/package.json
# ... repeat for every documented script
```

---

## 3. Cross-File Consistency Rules

Every documented path, package name, and command must match at least one
executable source. Run this checklist after all edits:

- [ ] Every `packages/<name>` mentioned in AGENTS.md exists under `packages/`
- [ ] Every `bun` command that uses `--cwd` or `cd` matches the package's actual location
- [ ] Every `pkg:` shorthand in EDITS.md has a matching `packages/<name>/` directory
- [ ] `guard: do-not-run-tests-from-root` matches `bunfig.toml:8`
- [ ] V2 Session Core bullets preserved from original AGENTS.md

---

## 4. Rollback Plan

If any step breaks a verified behavior:

1. **Revert AGENTS.md** — restore from git: `git checkout AGENTS.md`
2. **Remove EDITS.md** — `rm EDITS.md`
3. **Remove EDIT_EXECUTION.md** — `rm EDIT_EXECUTION.md`
4. **Restore packages/client/AGENTS.md** — `git checkout packages/client/AGENTS.md`

Re-verify with `bun lint` and `bun typecheck` after rollback.
