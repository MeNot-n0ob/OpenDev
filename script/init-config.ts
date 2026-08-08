#!/usr/bin/env bun
import fs from "fs/promises"
import path from "path"
import os from "os"

const home = os.homedir()
const configDir = path.join(home, ".config")
const opencodeDir = path.join(configDir, "opencode")
const opendevDir = path.join(configDir, "opendev")
const opencodeFile = path.join(opencodeDir, "opencode.jsonc")
const opendevFile = path.join(opendevDir, "opendev.jsonc")

async function ensureDir(p: string) {
  try {
    await fs.mkdir(p, { recursive: true })
  } catch {}
}

async function ensureFile(p: string, content: string) {
  try {
    await fs.access(p)
  } catch {
    await fs.mkdir(path.dirname(p), { recursive: true })
    await fs.writeFile(p, content, "utf8")
  }
}

await ensureDir(opencodeDir)
await ensureDir(opendevDir)
await ensureFile(opencodeFile, '{\n  "$schema": "https://opencode.ai/config.json"\n}\n')
await ensureFile(opendevFile, '{\n  "$schema": "https://opencode.ai/config.json"\n}\n')

console.log("Config directories ensured.")
