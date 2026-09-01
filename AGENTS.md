# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

The confirmed homepage target is the refined “身体冒险地图” mock at `/Users/bevol-1/.codex/generated_images/01a056d7-c4ca-72c1-91b7-e924a2a8ccfe/exec-b3d72858-25fb-4049-b9a6-909cf5e8055e.png`. Keep the clothed figure in a natural A-pose with arms 25–30° away from the torso. Selecting a body region must zoom to that exact side, reveal real muscle meshes, allow multi-select with distinct colors, and preserve a joint/uncertain fallback for knee and ankle.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
