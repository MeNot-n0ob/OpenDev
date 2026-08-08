# EDITS — Efficient Developer Instruction for Tool-augmented Systems

This file is a **shorthand dictionary** for non-code output only: agent
reasoning, task plans, and system reminders. Do NOT use EDITS shorthand in
code comments — code should use plain English. Use the compact forms defined
here instead of verbose prose. **Fallback**: use regular English for anything
not covered by this dictionary.

---

## 1. Shorthand Dictionary

Use compact key:value notation in agent reasoning and task plans.
Never write a full sentence when the shorthand is clearer.

### Dependency & Flow

| Shorthand | Meaning | Example |
|-----------|---------|---------|
| `A !! dep->B` | A depends on B | `client !! dep->protocol, schema` |
| `A +> B` | A feeds B | `schema +> protocol +> server` |
| `A !! need B for C` | A needs B to do C | `codegen !! need protocol HttpApi for generate` |
| `A !! gen->B` | A generates B | `protocol !! gen->client/generated` |
| `A -> B (needs C)` | A calls/affects B, requires C | `bun dev -> packages/opencode (needs bun 1.3+)` |
| `>=` | depends on / requires | `client >= schema + protocol` |

### Constraints & Actions

| Shorthand | Meaning | Example |
|-----------|---------|---------|
| `guard: X` | constraint or guard | `guard: do-not-run-tests-from-root` |
| `& must X` | AND must do X | `edit schema.ts -> & must regen client` |
| `= !! keep` | preserve this value | `main func = !! keep` |
| `[ACTION:] X` | instruction to perform | `[ACTION:] edit -> update dependents` |
| `?` / `!` | question / important note | `? sdk vs sdk-next !` |

### Scope & Reference

| Shorthand | Meaning | Example |
|-----------|---------|---------|
| `pkg:name` | package reference | `pkg:opencode`, `pkg:core` |
| `fn:Name` | function reference | `fn:SessionV2.prompt` |
| `file:path` | root-relative file path | `file:packages/client/src/generated/` |
| `D:` / `S:` / `U:` | Durable / Session / User scope | `U: prompt -> D: admission + S: wake` |

### Shorthand in context

**Verbose:** "The client package depends on protocol and schema. After editing the protocol's HttpApi, you must regenerate the generated client files by running bun run generate from packages/client."

**Concise:**
```
client !! dep->protocol, schema
edit protocol HttpApi -> & must regen client
[ACTION:] cd packages/client && bun run generate
```

**Verbose:** "Tests cannot be run from the repo root. Use package directories like packages/opencode."

**Concise:**
```
guard: do-not-run-tests-from-root
test -> pkg dirs (packages/opencode)
```

---

## 2. Edit-Dependency Rule

After modifying any file, update or verify its dependents.

1. Grep for imports before editing.
2. After schema change: `cd packages/client && bun run generate`.
3. After package export change: update all `package.json` `exports` consumers.
4. Run `bun typecheck` from affected packages.

| Edit target | Must also do |
|-------------|-------------|
| `packages/schema/src/*.ts` | regen client, typecheck protocol + server |
| `packages/protocol/src/*.ts` | regen client, typecheck server |
| `packages/server/src/*.ts` | typecheck client + opencode |
| `packages/core/src/*.sql.ts` | run migration |
| `packages/opencode/src/schema/*.ts` | typecheck opencode |
| `package.json` workspace config | `bun install`, verify exports |

**Order:** `lint -> typecheck (affected) -> typecheck (dependents) -> test (affected)`

---

## 3. Code Quality

- **Correct first, simple second, concise third**
- **Edge cases belong in tests, not conditionals**
- **Prefer early returns** — no `else`, no `let` reassignment
- **One abstraction level per function** — split validation, parsing, creation
- **No `any`** — use `Schema.unknown`, `Schema.Json`, or branded types
- **No `try/catch` around sync logic** — use `Schema.decodeUnknownOption` or `Either`
- **Effect code**: `Effect.fn("Name")` for named effects, `Effect.void` over `Effect.succeed(undefined)`
- **Over-abstraction is waste** — extract only when naming a real concept

**Strong:**
```
fn:loadThing(input) {
  config = requireConfig(input)
  metadata = readMetadata(input)
  return createThing(config, metadata)
}
```
**Weak:** over-abstracted, many helpers, else branches.

---

## 4. Workflow Ordering

```
1. Understand dependency chain
2. Make focused edit
3. lint
4. typecheck (affected + dependents)
5. test
6. regen if schema/protocol changed
7. review diff
```

---

## 5. File Map

```
Root
├── AGENTS.md                  ← operational reference
├── EDITS.md                   ← this dictionary (non-code output only, not for code comments)
├── MEMORY.md                  ← memory archive index & navigation guide
├── CONTEXT.md                 ← domain vocabulary
├── package.json               ← root workspace
├── turbo.json                 ← monorepo task orchestration
├── bunfig.toml                ← bun config
├── .oxlintrc.json             ← linter config
├── packages/
│   ├── schema/                ← wire contracts (browser-safe)
│   ├── protocol/              ← HttpApi endpoint groups
│   ├── core/                  ← domain logic, DB, session runtime
│   ├── server/                ← HTTP server
│   ├── client/                ← generated SDK
│   ├── sdk-next/              ← embedded in-process host
│   ├── opencode/              ← TUI + CLI entrypoint
│   ├── llm/                   ← LLM provider abstraction
│   ├── app/                   ← web UI (SolidJS)
│   ├── desktop/               ← Electron wrapper
│   ├── plugin/                ← @opencode-ai/plugin
│   ├── codemode/              ← confined tool execution
│   ├── ui/ / tui/ / console/ / web/  ← UI layers
│   └── effect-drizzle-sqlite/ ← vendored Drizzle adapter
```

**Read-only generated dirs:** `packages/client/src/generated/`, `packages/client/src/generated-effect/`, any `dist/`, `.build/`, `.sst/`

---

