import { Effect, Schema } from "effect"
import * as Tool from "./tool"
import DESCRIPTION from "./memory.txt"
import { SessionV1 } from "@opencode-ai/core/v1/session"
import { MemoryStore } from "./memory-store"
import { readFileSync } from "fs"
import { join } from "path"

const Parameters = Schema.Struct({
  c: Schema.String.annotate({
    description: "Command: G get, L list, A add, D done",
  }),
  p: Schema.optional(
    Schema.String.annotate({ description: "Path like /session/message_1/commands/cmd_1_xyz.json or /session/message_1/" }),
  ),
})

function renderTreeList(nodes: Record<string, MemoryStore.MemoryTreeNode> | undefined): string {
  if (!nodes || Object.keys(nodes).length === 0) return "(empty)"
  return Object.entries(nodes)
    .map(([name, child]) => `  ${child.type === "dir" ? "[D]" : "[F]"} ${name}${child.type === "dir" ? "/" : ""}`)
    .join("\n")
}

function loadPrompt(filename: string): string {
  try {
    return readFileSync(join(__dirname, "prompts", filename), "utf-8")
  } catch {
    return ""
  }
}

export const MemoryTool = Tool.define<typeof Parameters, Record<string, unknown>, MemoryStore.Service>(
  "m",
  Effect.gen(function* () {
    const store = yield* MemoryStore.Service

    return {
      description: DESCRIPTION,
      parameters: Parameters,
      execute: (args, ctx) =>
        Effect.gen(function* () {
          const cmd = args.c.toUpperCase()
          const path = args.p ?? "/session/"

          if (cmd === "D") {
            const mode = yield* store.getSelectionMode(ctx.sessionID)
            if (mode === "selecting") {
              const selectedPaths = yield* store.getSelectedPaths(ctx.sessionID)
              if (selectedPaths.length > 0) {
                const loaded = yield* store.selectMemory(ctx.sessionID, selectedPaths)
                return {
                  title: "memory done",
                  metadata: {},
                  output: `[MEMORY SELECTION COMPLETE] ${selectedPaths.length} memory item(s) loaded (${loaded.tokenEstimate} tokens):\n\n${loaded.combinedContent}`,
                }
              }
              yield* store.setSelectionMode(ctx.sessionID, "done")
              return { title: "memory done", metadata: {}, output: "[MEMORY SELECTION COMPLETE] No memories selected." }
            }
            return { title: "memory done", metadata: {}, output: "[MEMORY SELECTION COMPLETE] Already finalized." }
          }

          if (cmd === "A") {
            yield* store.addToSelection(ctx.sessionID, path)
            return { title: `memory add ${path}`, metadata: {}, output: `[MEMORY ADDED] ${path} added to selection.` }
          }

          if (cmd === "L") {
            const nodes = yield* store.listPath(ctx.sessionID, path)
            return { title: `memory list ${path}`, metadata: {}, output: renderTreeList(nodes) }
          }

          if (cmd === "G") {
            const content = yield* store.getMemoryAtPath(ctx.sessionID, path)
            if (content === undefined) {
              return {
                title: "memory error",
                metadata: {},
                output: `[MEMORY: path not found: ${path}. Use L to list directories.]`,
              }
            }
            return { title: `memory get ${path}`, metadata: {}, output: content }
          }

          return {
            title: "memory error",
            metadata: {},
            output: `[MEMORY: unknown command: ${cmd}. Use G, L, A, D]`,
          }
        }),
    } satisfies Tool.DefWithoutID<typeof Parameters, Record<string, unknown>>
  }),
)

export const MemorySystemPrompt = loadPrompt("memory_system.txt")
export const MemorySelectionPrompt = loadPrompt("memory_selection.txt")
export const MemoryShortenPrompt = loadPrompt("memory_shorten.txt")
export const MemorySystemStandardPrompt = loadPrompt("memory_system_standard.txt")