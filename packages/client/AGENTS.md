# @opencode-ai/client — Generated SDK

- After changing Schema, Protocol, or Server's concrete `HttpApi`, regenerate:
  `bun run generate`
- Verify generated files are current:
  `bun run check:generated` (runs `generate` then `git diff --exit-code`)
- Do not edit `src/generated/` or `src/generated-effect/` directly.
- Two entrypoints: `.` (zero-Effect Promise SDK) and `./effect` (Effect SDK).
- Typecheck: `bun run typecheck` (uses `tsgo --noEmit`)
- Test: `bun test --timeout 5000`
