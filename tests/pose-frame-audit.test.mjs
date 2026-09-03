import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = path.join(projectRoot, "content-packs/stretching-anatomy-cn");

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(packageRoot, relativePath), "utf8"));
}

async function sha256(filePath) {
  return createHash("sha256").update(await readFile(filePath)).digest("hex");
}

test("所有动作帧均通过姿势差异审计且源 PNG 哈希未改变", async () => {
  const actionIndex = await readJson("动作/动作总索引.json");
  const audit = await readJson("验证/姿势差异审计.json");
  const actionById = new Map(actionIndex.map((item) => [item.动作ID, item]));

  assert.equal(audit.动作.length, 83);
  for (const auditItem of audit.动作) {
    assert.equal(auditItem.人工复核, "通过", `${auditItem.动作ID} 未通过人工姿势复核`);
    const action = actionById.get(auditItem.动作ID);
    assert.ok(action, `总索引缺少 ${auditItem.动作ID}`);
    const actionDir = path.dirname(path.join(packageRoot, action.内容文件.结构化内容));

    for (const pair of auditItem.帧对) {
      assert.equal(pair.可见姿势差异, "通过", `${auditItem.动作ID} 存在无效姿势帧`);
      assert.notEqual(pair.图片哈希.起始, pair.图片哈希.结束, `${auditItem.动作ID} 两帧哈希相同`);

      const startDeclaration = action.图片帧声明.帧.find((frame) => frame.帧名 === pair.起始帧);
      const endDeclaration = action.图片帧声明.帧.find((frame) => frame.帧名 === pair.结束帧);
      assert.equal(
        await sha256(path.join(actionDir, startDeclaration.相对路径)),
        pair.图片哈希.起始,
        `${auditItem.动作ID} ${pair.起始帧} 源图被改动`,
      );
      assert.equal(
        await sha256(path.join(actionDir, endDeclaration.相对路径)),
        pair.图片哈希.结束,
        `${auditItem.动作ID} ${pair.结束帧} 源图被改动`,
      );
    }
  }
});
