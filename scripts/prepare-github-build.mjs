#!/usr/bin/env node
import { access, copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const PROJECT_ROOT = path.resolve(path.dirname(SCRIPT_PATH), "..");

export async function prepareGitHubBuild(outputRoot = path.join(PROJECT_ROOT, "dist/github")) {
  const indexPath = path.join(outputRoot, "index.html");
  await access(indexPath);

  const tutorialDirectory = path.join(outputRoot, "动作教程");
  await mkdir(tutorialDirectory, { recursive: true });
  await Promise.all([
    copyFile(indexPath, path.join(tutorialDirectory, "index.html")),
    copyFile(indexPath, path.join(outputRoot, "404.html")),
  ]);
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  prepareGitHubBuild()
    .then(() => console.log("Prepared GitHub Pages deep-link entries: 动作教程/index.html and 404.html"))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}

