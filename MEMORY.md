# MEMORY — Organized Session Archive

Memory organizes all past session data into a browsable hierarchy. Only the
last 5 messages are in active context; everything older lives here.

## Hierarchy

- `/recent/` — Last 10 actions (edits, commands, reads, tool results)
- `/edits/` — All file edits grouped by file path
- `/commands/` — All shell commands with output
- `/reads/` — Files read with content excerpts
- `/searches/` — Grep/glob searches with results
- `/results/` — Tool execution results
- `/errors/` — Errors and failures

## Navigation

Use these commands to browse memories. Type them in your response text, not as
tool calls. The system intercepts them inline:

| Command | Description |
|---------|-------------|
| `{mem path}` | Navigate to memory at path, show content |
| `{mem.}` | List children of current memory node |
| `{mem..}` | List siblings of current node |
| `{mem*}` | Show full memory tree |
| `{mem!}` | End retrieval, proceed with gathered memories |

If you type an invalid path, the system goes back to before the command so
you can try again. Previous memory command is tracked per turn.

### Examples

```
Show recent edits:
{mem /recent/edits}

List edit categories:
{mem.}

Show all memory paths:
{mem*}

Done gathering:
{mem!}
```

## Before Editing

When about to call the edit tool, first:
1. Check if the target file was already edited — navigate to `/edits/{filepath}`
2. Check if the file was already read — navigate to `/reads/{filepath}`
3. Gather all relevant memories before proceeding

## Read Dedup

If you try to read a file already read this session, the system asks:
`Re-read or use cached memory?` Respond with `reread` or `use memory`.
