# New Things — Memory System & EDITS Integration

## Overview

Implemented a memory management system that keeps only the last 5 messages in active context and archives older messages as a browsable tree hierarchy. Integrated EDITS.md as a separately-loaded shorthand dictionary for non-code LLM output, completely decoupled from the per-model prompt files. This saves ~300 tokens per turn that were previously wasted on static EDITS definitions in every variant.

---

## 1. Memory System

### Active Context Truncation (`src/session/prompt.ts`)

`ACTIVE_MSGS=5` — only the last 5 user/assistant message pairs are included in the active system prompt. All older messages are archived into a `<memory>` block.

### Memory Block Generation (`buildMemorySection`)

A `<memory>` block is injected into the system instruction array containing:

- **Recent messages** — last 5 messages shown as-is
- **Archived messages** — older messages organized into a browsable tree
- **Long-term memory** — notes and terminal entries, but only when `fed === true` (see `m R` / `m X` below)

The `<memory>` block sections:
- `## conversation` — archived user/assistant text parts
- `## edits` — edit/write/apply_patch operations with file paths
- `## important_files` — auto-derived read/edit counts per file
- `## long-term` — notes stored via `m R` (only when feeding is enabled)
- `## terminal` — captured bash/shell/execute commands and results (only when feeding is enabled)

### Memory Tool Tree (`buildTree`)

The `m()` tool builds a browsable tree with exactly three root categories:
- `/Messages/<prompt> (msg N)` — one dir per user prompt, holding its parts and replies
- `/Edits/<file>/msg N` — edits grouped by filename, then by message number
- `/Important_Files/<file>` — auto-populated leaf per file with read/edit counts

Each entry preserves the full session history in a compact browsable form.

---

## 2. Memory Tool (`src/tool/memory.ts`, `src/tool/memory.txt`)

### Tool Registration (`src/tool/registry.ts`)

A new `memory` tool (shorthand `m`) was registered. The tool is available for browsing archived session history.

### Commands

- **`E <path>`** (enter) — navigate into a tree node, e.g. `E /Messages/...` or `E /Edits/file.ts/msg N`
- **`C`** (children) — list direct children of the current node
- **`S`** (siblings) — list siblings of the current node
- **`T`** (tree) — show full tree from current node downward
- **`R`** (remember) — `R n:["note 1","note 2",...]` stores multiple long-term notes (idempotent — repeating the same `R` is a no-op) and auto-captures prior `bash`/`shell`/`execute` commands with their results
- **`X`** (clear) — stop feeding long-term memory to the LLM; stored notes/commands stay in RAM
- **`D`** (done) — end memory retrieval and return to the main task

### RAM-Backed Long-Term Store (`src/tool/memory-store.ts`)

A new `MemoryStore.Service` holds per-`SessionID` `{ notes, terminal, fed }` entirely in RAM:
- Wiped on process restart or when a fresh session id starts
- `addNotes` is idempotent — remembering the same thing twice is a no-op
- `addTerminal` dedupes by command (latest output wins)
- `fed` defaults to true; `m X` flips it off so the long-term section is no longer injected into the model prompt

### Tree Building

The tree is dynamically built from `SessionV1.WithParts` data. Each session message part is categorized by its tool type (edit, command, read, search, result, error) and stored under the appropriate category. File paths de-duplicate within categories.

### Bug Fix: Errors Category

The `errors` category was always empty because errored tools were not being included in the tree build. Fixed to include all parts, including those with tool errors, so the tree properly surfaces past failures.

### Bug Fix: truncateStr Null Safety

Added `if (!s) return ""` guard to `truncateStr` to handle null/undefined inputs gracefully.

---

## 3. EDITS.md Integration

### EDITS.md Clarification

Updated `EDITS.md` to clarify:
- Shorthand is for **non-code output only** (thinking, plans, reminders)
- **Never use in code comments**
- **Fall back to regular English** for anything not covered by EDITS
- Updated the file map for maintainability

### Separate Loading in instruction.ts (`src/session/instruction.ts`)

EDITS.md is loaded **independently** from AGENTS.md/CLAUDE.md via `findUp("EDITS.md", ctx.directory, ctx.worktree)`. This means:
- EDITS.md is resolved from the project directory upward (same as AGENTS.md)
- It is NOT treated as an instruction file — it's a formatting dictionary
- It does not share the instruction block header

### Global Fallback for EDITS.md

Added a global fallback path: `~/.config/opencode/EDITS.md` is also checked after the project-level findUp, so projects outside the opencode repo directory still get the EDITS dictionary.

### EDITS Section Removed from System Block (`src/session/system.ts`)

Removed the redundant `EDITS:` line from the environment block that was already covered by the prompt files and AGENTS.md.

---

## 4. Prompt Files Updated (10 files)

### Files Modified

All 10 model variant prompt files in `src/session/prompt/`:
- `default.txt`
- `anthropic.txt`
- `gemini.txt`
- `gpt.txt`
- `kimi.txt`
- `meta.txt`
- `codex.txt`
- `trinity.txt`
- `copilot-gpt-5.txt`
- `beast.txt`

### Two Rounds of Simplification

**Round 1:** Each file's EDITS section reduced from 4 lines to 2 lines, and MEMORY section reduced from 4 lines to 2 lines.

**Round 2:** The EDITS section was **removed entirely** from all 10 files. Since `instruction.ts` auto-loads `EDITS.md`, the model reads the dictionary as a separate instruction file only when it needs to produce non-code output. When editing code, the EDITS dictionary is never loaded into context.

### Current Content

Each prompt file now has only these instruction sections:
- `# MEMORY` — 2 lines: "Only last 5 msgs shown. Older msgs in m() tool. Before editing, check /edits/file (via m()) for prior edits."
- Rest of instructions (feedback, opencode queries, tone, tools, etc.)

### Context Savings

- Each EDITS section was ~110 tokens
- Across 10 files with 2 rounds of reduction: removed ~4,400 tokens of static definitions
- Per turn savings: ~110 tokens that no longer appear in the active prompt

---

## 5. Read Dedup (`src/tool/read.ts`)

When the model calls the read tool, the implementation scans `ctx.messages` for previous reads of the same `filePath`. If the file was already read this session, it returns a memory-hint instead of re-reading the file:

```
<memory-hint>
File "path/to/file" was already read. Use m(c:"E", p:"/Important_Files/path/to/file") for cached content.
</memory-hint>
```

This prevents redundant reads and keeps context focused on the relevant history.

### Bug Fix: False `?reread` Promise Removed

Removed a misleading suggestion that the model could pass `?reread` to force re-read — this parameter did not actually exist in the implementation.

---

## 6. Syntax Consistency

Changed `E(path)` syntax to `E enter` everywhere to avoid looking like a function call:
- `memory.txt` tool description
- `memory.ts` parameter descriptions
- AGENTS.md root file
- All prompt file MEMORY sections

---

## 7. Bug Fixes Summary

| File | Bug | Fix |
|------|-----|-----|
| `memory.ts` | `errors` category always empty | Include errored tools in tree building |
| `memory.ts` | `truncateStr` crashes on null/undefined | Added `if (!s) return ""` guard |
| `read.ts` | False `?reread` parameter suggestion | Removed misleading suggestion |
| `prompt.ts` | Operator precedence bug in `buildMemorySection` error handling | Fixed precedence with parentheses |
| `prompt.ts` | Dead `sections.length === 1` guard | Removed unreachable code |
| `prompt.ts` | Conversation text not in memory block | Added text parts to memory |
| `memory.ts` | Old six-category tree (`/edits`, `/commands`, ...) | Rewritten to `Messages` / `Edits` / `Important_Files` with `R`/`X` commands |
| `memory-store.ts` | Missing `yield*` on `Effect.sync` inside `Effect.fn` generators | Added `yield*` so store effects actually run |
| `read.ts` | Stale memory-hint path `/reads/...` | Now references `/Important_Files/...` |

---

## 8. `/ask` Turn Summary Label

When running `/ask` live in the TUI, the completed-turn summary (`▣ ...`) was written with the static active agent label (`Build`/`Plan`), so an ask turn never showed up as "Ask". Fixed by threading the agent through the `turn.duration` footer event:

- `types.ts` — `turn.duration` now carries an optional `agent`
- `runtime.queue.ts` — emits `agent: "Ask"` when the submitted prompt's command is `ask`
- `footer.ts` — falls back to `next.agent` before the static `agentLabel`

Replay already used `info.agent`, so the ask assistant message rendered "Ask"; the live path now matches.

### Trailing `▣ Build` summary after `/ask` (fixed)

After `/ask`, the auto-resume continuation re-runs the original turn and stores an
`assistant (build)` step message whose `parentID` points at the original (pre-ask)
user message. Replay's `summaryMessageIDs` treated it as the newest step of that
turn and emitted a spurious `▣ Build · <duration>` summary below the ask answer.

Fixed in `session-replay.ts` `summaryMessageIDs`: skip an assistant message whose
parent is a user message that is **not** the immediately preceding user turn (an
out-of-order continuation). Regression test added in `test/cli/run/session-replay.test.ts`.

