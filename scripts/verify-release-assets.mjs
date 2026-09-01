import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

const outputRoot = path.resolve(process.argv[2] ?? "dist/client");
const blockedFilename = "move-lab-muscles.glb";

async function collectRuntimeFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectRuntimeFiles(entryPath));
    else if (/\.(?:css|html|js|mjs)$/u.test(entry.name)) files.push(entryPath);
  }
  return files;
}

await access(outputRoot);
const runtimeFiles = await collectRuntimeFiles(outputRoot);
const references = [];
for (const filePath of runtimeFiles) {
  const source = await readFile(filePath, "utf8");
  if (source.includes(blockedFilename)) references.push(path.relative(outputRoot, filePath));
}

try {
  await access(path.join(outputRoot, "assets/models", blockedFilename));
  throw new Error(`${blockedFilename} 仍存在于发布产物 ${outputRoot}`);
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

if (references.length > 0) {
  throw new Error(`发布运行时仍引用 ${blockedFilename}: ${references.join(", ")}`);
}

console.log(`release asset check passed: ${outputRoot}`);
