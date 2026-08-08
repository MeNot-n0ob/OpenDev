# Long-Term Memory System Improvements

## Overview
This document describes the redesigned long-term memory system optimized for thinking models. The new system reduces LLM requests to a maximum of 2 per interaction while providing full access to the session's memory tree.

## Key Changes

### 1. Two-Request Model for Thinking Models
- **Request 1**: Clears existing loaded memory, initializes fresh memory state
- **Request 2**: Loads all short-term memory (last 5 messages) into the memory tree, ends request
- No additional requests unless context management requires shortening

### 2. Memory Tree Structure
Memory is organized as a hierarchical tree stored in messages:

```
/session/
├── message_1/
│   ├── commands/
│   │   └── cmd_<n>_<command_hash>.json
│   ├── edits/
│   │   └── edit_<n>_<file_hash>.json
│   ├── text/
│   │   └── full_text.txt
│   └── message.json
├── message_2/
│   └── ...
└── message_n/
    └── ...
```

Each message folder contains:
- **commands/** - Terminal commands executed with outputs
- **edits/** - File edits (write/edit/apply_patch) with diffs
- **text/** - Full message text content
- **message.json** - Complete message metadata (role, parts, timestamps)

### 3. Memory Access Commands
- `GET <path>` - Navigate to specific memory path (e.g., `/session/message_3/commands/cmd_1_bash_ls.json`)
- `LIST <path>` - List contents of a directory
- `DONE` - Finish memory selection, load selected memories into context

### 4. Context Management
- Uses existing TUI context percentage indicator
- If selected memories exceed context:
  1. LLM shortens largest memory (editable prompt in `prompts/memory_shorten.txt`)
  2. Shortening modifies permanent memory store
  3. If still exceeds, move to next largest memory
  4. Edge case: Remove oldest short-term message (5→4→3...) until fits

### 5. Compaction Integration
- Compaction automatically enables this memory mode before running
- Ensures full session history is available during compaction

### 6. Editable Prompts
All LLM instructions stored in `.txt` files for easy modification:
- `prompts/memory_system.txt` - Main memory system instructions
- `prompts/memory_shorten.txt` - Memory shortening instructions
- `prompts/memory_selection.txt` - Memory selection guidance

## File Structure
```
packages/opendev/src/
├── tool/
│   ├── memory-store.ts      # Core memory storage (tree-based)
│   ├── memory.ts            # Memory tool with GET/LIST/DONE
│   └── prompts/
│       ├── memory_system.txt
│       ├── memory_shorten.txt
│       └── memory_selection.txt
└── session/
    └── prompt.ts            # Integration with thinking model detection
```

## Configuration
- Short-term memory: Last 5 messages (configurable)
- Context threshold: Uses TUI's existing percentage
- Thinking model detection: Via model capabilities/config