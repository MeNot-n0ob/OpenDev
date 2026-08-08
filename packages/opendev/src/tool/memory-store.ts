import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { Context, Effect, Layer } from "effect"
import { SessionID } from "../session/schema"
import { Schema } from "effect"

export interface TerminalEntry {
  command: string
  output: string
}

export interface Memory {
  notes: string[]
  terminal: TerminalEntry[]
  fed: boolean
}

export interface MessageMemory {
  id: string
  role: "user" | "assistant" | "system"
  parts: MessagePart[]
  timestamp: number
}

export type MessagePart =
  | { type: "text"; text?: string }
  | { type: "tool"; tool?: string; input?: Record<string, unknown>; output?: string; error?: string; status?: "pending" | "running" | "completed" | "error" }
  | { type: "file"; filename?: string; url?: string }
  | { type: "agent"; name?: string }
  | { type: "subtask"; prompt?: string }
  | { type: "compaction"; [key: string]: unknown }
  | { type: "patch"; [key: string]: unknown }
  | { type: "reasoning"; [key: string]: unknown }
  | { type: "retry"; [key: string]: unknown }
  | { type: "snapshot"; [key: string]: unknown }
  | { type: "step-finish"; [key: string]: unknown }
  | { type: "step-start"; [key: string]: unknown }

export interface CommandEntry {
  command: string
  output: string
  status: "completed" | "error"
  timestamp: number
}

export interface EditEntry {
  tool: "edit" | "write" | "apply_patch"
  filePath: string
  content: string
  output: string
  timestamp: number
}

export interface MemoryTreeNode {
  name: string
  type: "dir" | "file"
  content?: string
  children?: Record<string, MemoryTreeNode>
  metadata?: Record<string, unknown>
}

export interface SessionMemory {
  tree: MemoryTreeNode
  shortTermMessages: MessageMemory[]
  loadedMemory: LoadedMemory
  contextPercent: number
}

export interface LoadedMemory {
  selectedPaths: string[]
  combinedContent: string
  tokenEstimate: number
}

export interface MemorySelection {
  paths: string[]
  mode: "selecting" | "done" | "shortening"
}

export interface Interface {
  // Legacy methods for backward compatibility
  readonly get: (sessionID: SessionID) => Effect.Effect<Memory>
  readonly addNotes: (sessionID: SessionID, notes: ReadonlyArray<string>) => Effect.Effect<Memory>
  readonly addTerminal: (sessionID: SessionID, entries: ReadonlyArray<TerminalEntry>) => Effect.Effect<Memory>
  readonly setFed: (sessionID: SessionID, fed: boolean) => Effect.Effect<void>

  // New tree-based methods
  readonly getTree: (sessionID: SessionID) => Effect.Effect<MemoryTreeNode>
  readonly buildTreeFromMessages: (sessionID: SessionID, messages: MessageMemory[]) => Effect.Effect<MemoryTreeNode>
  readonly getMemoryAtPath: (sessionID: SessionID, path: string) => Effect.Effect<string | undefined>
  readonly listPath: (sessionID: SessionID, path: string) => Effect.Effect<Record<string, MemoryTreeNode> | undefined>
  readonly selectMemory: (sessionID: SessionID, paths: string[]) => Effect.Effect<LoadedMemory>
  readonly addToSelection: (sessionID: SessionID, path: string) => Effect.Effect<void>
  readonly clearLoadedMemory: (sessionID: SessionID) => Effect.Effect<void>
  readonly setSelectionMode: (sessionID: SessionID, mode: MemorySelection["mode"]) => Effect.Effect<void>
  readonly getSelectionMode: (sessionID: SessionID) => Effect.Effect<MemorySelection["mode"]>
  readonly getSelectedPaths: (sessionID: SessionID) => Effect.Effect<string[]>
  readonly getLoadedMemory: (sessionID: SessionID) => Effect.Effect<LoadedMemory | undefined>
  readonly shortenMemory: (sessionID: SessionID, path: string, shortenedContent: string) => Effect.Effect<void>
  readonly removeShortTermMessage: (sessionID: SessionID) => Effect.Effect<boolean>
  readonly updateContextPercent: (sessionID: SessionID, percent: number) => Effect.Effect<void>
  readonly getContextPercent: (sessionID: SessionID) => Effect.Effect<number>
  readonly isThinkingModelMode: (sessionID: SessionID) => Effect.Effect<boolean>
  readonly setThinkingModelMode: (sessionID: SessionID, enabled: boolean) => Effect.Effect<void>
}

export class Service extends Context.Service<Service, Interface>()("@opencode/MemoryStore") {}

const SHORT_TERM_LIMIT = 5

function createEmptyTree(): MemoryTreeNode {
  return {
    name: "session",
    type: "dir",
    children: {},
  }
}

function isTextPart(part: MessagePart): part is MessagePart & { type: "text"; text?: string } {
  return part.type === "text"
}

function isToolPart(part: MessagePart): part is MessagePart & { type: "tool"; tool?: string; input?: Record<string, unknown>; output?: string; error?: string; status?: "pending" | "running" | "completed" | "error" } {
  return part.type === "tool"
}

function serializePart(p: MessagePart): Record<string, unknown> {
  const base = { type: p.type }
  if (isTextPart(p)) return { ...base, text: p.text }
  if (isToolPart(p)) return { ...base, tool: p.tool, input: p.input, output: p.output, error: p.error, status: p.status }
  if (p.type === "file") return { ...base, filename: p.filename, url: p.url }
  if (p.type === "agent") return { ...base, name: p.name }
  if (p.type === "subtask") return { ...base, prompt: p.prompt }
  return base
}

function ensureUniqueKey(children: Record<string, MemoryTreeNode>, baseKey: string): string {
  if (!children[baseKey]) return baseKey
  let suffix = 2
  while (children[`${baseKey}_${suffix}`]) suffix++
  return `${baseKey}_${suffix}`
}

function messageToTreeNode(msg: MessageMemory, index: number): MemoryTreeNode {
  const messageDir: MemoryTreeNode = {
    name: `message_${index + 1}`,
    type: "dir",
    children: {
      commands: { name: "commands", type: "dir", children: {} },
      edits: { name: "edits", type: "dir", children: {} },
      text: { name: "text", type: "dir", children: {} },
    },
    metadata: { messageId: msg.id, role: msg.role, timestamp: msg.timestamp },
  }

  let cmdIndex = 0
  let editIndex = 0

  for (const part of msg.parts) {
    if (isTextPart(part) && part.text) {
      const textChildren = messageDir.children!.text!.children!
      const key = `full_text.txt`
      // Avoid duplicate key for multiple text parts in same message
      if (!textChildren[key]) {
        textChildren[key] = {
          name: key,
          type: "file",
          content: part.text,
        }
      }
    }

    if (isToolPart(part) && part.tool && part.input) {
      const isCommand = ["bash", "shell", "execute"].includes(part.tool)
      const isEdit = ["edit", "write", "apply_patch"].includes(part.tool)

      if (isCommand && (part.status === "completed" || part.status === "error")) {
        cmdIndex++
        const command = String(part.input.command ?? "")
        const output = part.status === "completed" ? (part.output ?? "") : `[error] ${part.error ?? ""}`
        const cmdChildren = messageDir.children!.commands!.children!
        const baseKey = `cmd_${cmdIndex}_${hashString(command)}`
        const key = ensureUniqueKey(cmdChildren, baseKey)
        cmdChildren[key] = {
          name: key,
          type: "file",
          content: JSON.stringify({ command, output, status: part.status, tool: part.tool }, null, 2),
          metadata: { command, tool: part.tool, status: part.status },
        }
      }

      if (isEdit) {
        editIndex++
        const filePath = String(part.input.filePath ?? part.input.path ?? "")
        const content = part.tool === "edit"
          ? String(part.input.newString ?? "")
          : part.tool === "write"
            ? String(part.input.content ?? "")
            : String(part.input.patchText ?? "")
        const output = part.status === "completed" ? (part.output ?? "") : `[error] ${part.error ?? ""}`
        const editChildren = messageDir.children!.edits!.children!
        const baseKey = `edit_${editIndex}_${hashString(filePath)}`
        const key = ensureUniqueKey(editChildren, baseKey)
        editChildren[key] = {
          name: key,
          type: "file",
          content: JSON.stringify({ tool: part.tool, filePath, content, output, status: part.status }, null, 2),
          metadata: { filePath, tool: part.tool, status: part.status },
        }
      }
    }
  }

  messageDir.children!.message = {
    name: "message.json",
    type: "file",
    content: JSON.stringify({
      id: msg.id,
      role: msg.role,
      parts: msg.parts.map(serializePart),
      timestamp: msg.timestamp,
    }, null, 2),
  }

  return messageDir
}

function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36).substring(0, 8)
}

function resolvePath(tree: MemoryTreeNode, path: string): MemoryTreeNode | undefined {
  if (path === "/" || path === "" || path === "/session") return tree
  const parts = path.replace(/^\/+|\/+$/g, "").split("/")
  if (parts[0] !== "session") return undefined
  let cur: MemoryTreeNode | undefined = tree
  for (let i = 1; i < parts.length; i++) {
    if (!cur?.children || !cur.children[parts[i]]) return undefined
    cur = cur.children[parts[i]]
  }
  return cur
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    interface SessionStore {
      tree: MemoryTreeNode
      shortTermMessages: MessageMemory[]
      loadedMemory: LoadedMemory
      selectedPaths: string[]  // Track paths selected by LLM
      selectionMode: MemorySelection["mode"]
      thinkingModelMode: boolean
      contextPercent: number
    }

    const stores = new Map<SessionID, SessionStore>()

    const getStore = (sessionID: SessionID): SessionStore => {
      let store = stores.get(sessionID)
      if (!store) {
        store = {
          tree: createEmptyTree(),
          shortTermMessages: [],
          loadedMemory: { selectedPaths: [], combinedContent: "", tokenEstimate: 0 },
          selectedPaths: [],
          selectionMode: "selecting",
          thinkingModelMode: false,
          contextPercent: 0,
        }
        stores.set(sessionID, store)
      }
      return store
    }

    const getTree = Effect.fn("MemoryStore.getTree")(function* (sessionID: SessionID) {
      return yield* Effect.sync(() => {
        const store = getStore(sessionID)
        return JSON.parse(JSON.stringify(store.tree))
      })
    })

    const buildTreeFromMessages = Effect.fn("MemoryStore.buildTreeFromMessages")(function* (
      sessionID: SessionID,
      messages: MessageMemory[]
    ) {
      return yield* Effect.sync(() => {
        const store = getStore(sessionID)
        store.shortTermMessages = messages.slice(-SHORT_TERM_LIMIT)
        
        const tree = createEmptyTree()
        for (let i = 0; i < store.shortTermMessages.length; i++) {
          const msgNode = messageToTreeNode(store.shortTermMessages[i], i)
          tree.children![msgNode.name] = msgNode
        }
        store.tree = tree
        return JSON.parse(JSON.stringify(tree))
      })
    })

    const getMemoryAtPath = Effect.fn("MemoryStore.getMemoryAtPath")(function* (
      sessionID: SessionID,
      path: string
    ) {
      return yield* Effect.sync(() => {
        const store = getStore(sessionID)
        const node = resolvePath(store.tree, path)
        return node?.content
      })
    })

    const listPath = Effect.fn("MemoryStore.listPath")(function* (
      sessionID: SessionID,
      path: string
    ) {
      return yield* Effect.sync(() => {
        const store = getStore(sessionID)
        const node = resolvePath(store.tree, path)
        if (!node?.children) return undefined
        const result: Record<string, MemoryTreeNode> = {}
        for (const [key, child] of Object.entries(node.children)) {
          result[key] = { ...child, children: child.children ? Object.keys(child.children).reduce((acc, k) => ({ ...acc, [k]: { name: child.children![k].name, type: child.children![k].type } }), {}) : undefined }
        }
        return result
      })
    })

    const selectMemory = Effect.fn("MemoryStore.selectMemory")(function* (
      sessionID: SessionID,
      paths: string[]
    ) {
      return yield* Effect.sync(() => {
        const store = getStore(sessionID)
        let combinedContent = ""
        const validPaths: string[] = []

        for (const path of paths) {
          const node = resolvePath(store.tree, path)
          if (node?.content) {
            combinedContent += `\n\n=== ${path} ===\n${node.content}`
            validPaths.push(path)
          }
        }

        const tokenEstimate = estimateTokens(combinedContent)
        store.loadedMemory = { selectedPaths: validPaths, combinedContent, tokenEstimate }
        store.selectionMode = "done"
        return { ...store.loadedMemory }
      })
    })

    const clearLoadedMemory = Effect.fn("MemoryStore.clearLoadedMemory")(function* (sessionID: SessionID) {
      yield* Effect.sync(() => {
        const store = getStore(sessionID)
        store.loadedMemory = { selectedPaths: [], combinedContent: "", tokenEstimate: 0 }
        store.selectionMode = "selecting"
      })
    })

    const setSelectionMode = Effect.fn("MemoryStore.setSelectionMode")(function* (
      sessionID: SessionID,
      mode: MemorySelection["mode"]
    ) {
      yield* Effect.sync(() => {
        const store = getStore(sessionID)
        store.selectionMode = mode
      })
    })

    const getSelectionMode = Effect.fn("MemoryStore.getSelectionMode")(function* (sessionID: SessionID) {
      return yield* Effect.sync(() => getStore(sessionID).selectionMode)
    })

    const addToSelection = Effect.fn("MemoryStore.addToSelection")(function* (
      sessionID: SessionID,
      path: string
    ) {
      yield* Effect.sync(() => {
        const store = getStore(sessionID)
        const node = resolvePath(store.tree, path)
        if (node && node.type === "file" && !store.selectedPaths.includes(path)) {
          store.selectedPaths.push(path)
        }
      })
    })

    const getSelectedPaths = Effect.fn("MemoryStore.getSelectedPaths")(function* (sessionID: SessionID) {
      return yield* Effect.sync(() => getStore(sessionID).selectedPaths)
    })

    const getLoadedMemory = Effect.fn("MemoryStore.getLoadedMemory")(function* (sessionID: SessionID) {
      return yield* Effect.sync(() => {
        const store = getStore(sessionID)
        return store.loadedMemory.selectedPaths.length > 0 ? { ...store.loadedMemory } : undefined
      })
    })

    const shortenMemory = Effect.fn("MemoryStore.shortenMemory")(function* (
      sessionID: SessionID,
      path: string,
      shortenedContent: string
    ) {
      yield* Effect.sync(() => {
        const store = getStore(sessionID)
        const node = resolvePath(store.tree, path)
        if (node && node.type === "file") {
          node.content = shortenedContent
        }
      })
    })

    const removeShortTermMessage = Effect.fn("MemoryStore.removeShortTermMessage")(function* (sessionID: SessionID) {
      return yield* Effect.sync(() => {
        const store = getStore(sessionID)
        if (store.shortTermMessages.length > 1) {
          store.shortTermMessages.shift()
          const tree = createEmptyTree()
          for (let i = 0; i < store.shortTermMessages.length; i++) {
            const msgNode = messageToTreeNode(store.shortTermMessages[i], i)
            tree.children![msgNode.name] = msgNode
          }
          store.tree = tree
          return true
        }
        return false
      })
    })

    const updateContextPercent = Effect.fn("MemoryStore.updateContextPercent")(function* (
      sessionID: SessionID,
      percent: number
    ) {
      yield* Effect.sync(() => {
        const store = getStore(sessionID)
        store.contextPercent = percent
      })
    })

    const getContextPercent = Effect.fn("MemoryStore.getContextPercent")(function* (sessionID: SessionID) {
      return yield* Effect.sync(() => getStore(sessionID).contextPercent)
    })

    const isThinkingModelMode = Effect.fn("MemoryStore.isThinkingModelMode")(function* (sessionID: SessionID) {
      return yield* Effect.sync(() => getStore(sessionID).thinkingModelMode)
    })

    const setThinkingModelMode = Effect.fn("MemoryStore.setThinkingModelMode")(function* (
      sessionID: SessionID,
      enabled: boolean
    ) {
      yield* Effect.sync(() => {
        const store = getStore(sessionID)
        store.thinkingModelMode = enabled
      })
    })

    const get = Effect.fn("MemoryStore.get")(function* (sessionID: SessionID) {
      return yield* Effect.sync(() => {
        let mem = stores.get(sessionID)
        if (!mem) {
          mem = { tree: createEmptyTree(), shortTermMessages: [], loadedMemory: { selectedPaths: [], combinedContent: "", tokenEstimate: 0 }, selectedPaths: [], selectionMode: "selecting", thinkingModelMode: false, contextPercent: 0 }
          stores.set(sessionID, mem)
        }
        // Return legacy Memory format for backward compatibility
        const notes: string[] = []
        const terminal: TerminalEntry[] = []
        return { notes, terminal, fed: true }
      })
    })

    const addNotes = Effect.fn("MemoryStore.addNotes")(function* (
      sessionID: SessionID,
      notes: ReadonlyArray<string>,
    ) {
      return yield* Effect.sync(() => {
        let mem = stores.get(sessionID)
        if (!mem) {
          mem = { tree: createEmptyTree(), shortTermMessages: [], loadedMemory: { selectedPaths: [], combinedContent: "", tokenEstimate: 0 }, selectedPaths: [], selectionMode: "selecting", thinkingModelMode: false, contextPercent: 0 }
          stores.set(sessionID, mem)
        }
        return { notes: [...notes], terminal: [], fed: true }
      })
    })

    const addTerminal = Effect.fn("MemoryStore.addTerminal")(function* (
      sessionID: SessionID,
      entries: ReadonlyArray<TerminalEntry>,
    ) {
      return yield* Effect.sync(() => {
        let mem = stores.get(sessionID)
        if (!mem) {
          mem = { tree: createEmptyTree(), shortTermMessages: [], loadedMemory: { selectedPaths: [], combinedContent: "", tokenEstimate: 0 }, selectedPaths: [], selectionMode: "selecting", thinkingModelMode: false, contextPercent: 0 }
          stores.set(sessionID, mem)
        }
        return { notes: [], terminal: [...entries], fed: true }
      })
    })

    const setFed = Effect.fn("MemoryStore.setFed")(function* (sessionID: SessionID, fed: boolean) {
      yield* Effect.sync(() => {
        const store = getStore(sessionID)
        // Legacy compatibility - no-op for new system
      })
    })

    return Service.of({
      // Legacy methods
      get,
      addNotes,
      addTerminal,
      setFed,
      // New tree-based methods
      getTree,
      buildTreeFromMessages,
      getMemoryAtPath,
      listPath,
      selectMemory,
      addToSelection,
      getSelectedPaths,
      getLoadedMemory,
      clearLoadedMemory,
      setSelectionMode,
      getSelectionMode,
      shortenMemory,
      removeShortTermMessage,
      updateContextPercent,
      getContextPercent,
      isThinkingModelMode,
      setThinkingModelMode,
    })
  }),
)

export const node = LayerNode.make({ service: Service, layer: layer, deps: [] })

export * as MemoryStore from "./memory-store"