import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const moduleUnderTest = await import("../src/movements.js").catch(() => ({
  filterMovements: () => [],
}));
const { filterMovements, movements = [] } = moduleUnderTest;
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const fixtures = [
  {
    id: "neck",
    title: "颈侧斜方肌放松",
    category: "颈肩",
    muscles: ["上斜方肌", "肩胛提肌"],
    keywords: ["久坐", "肩颈"],
  },
  {
    id: "hip",
    title: "坐姿四字臀肌伸展",
    category: "臀髋",
    muscles: ["梨状肌", "臀中肌"],
    keywords: ["臀部", "久坐"],
  },
  {
    id: "back",
    title: "坐姿温和屈曲",
    category: "腰背",
    muscles: ["竖脊肌"],
    keywords: ["后侧链"],
  },
];

test("搜索会匹配标题、目标肌群和关键词", () => {
  const result = moduleUnderTest.filterMovements(fixtures, {
    query: "斜方",
    category: "全部",
  });

  assert.deepEqual(result.map((item) => item.id), ["neck"]);
});

test("部位筛选与搜索条件同时生效", () => {
  const result = moduleUnderTest.filterMovements(fixtures, {
    query: "久坐",
    category: "臀髋",
  });

  assert.deepEqual(result.map((item) => item.id), ["hip"]);
});

test("双状态动作会返回当前选中的姿势图", () => {
  const selectMovementFrame = moduleUnderTest.selectMovementFrame ?? (() => null);
  const movement = {
    image: "/fallback.png",
    frames: {
      start: "/start.png",
      end: "/end.png",
    },
  };

  assert.equal(selectMovementFrame(movement, "start"), "/start.png");
  assert.equal(selectMovementFrame(movement, "end"), "/end.png");
});

test("肩胛筛选会返回办公室肩胛稳定动作", () => {
  const result = filterMovements(movements, { category: "肩胛" });

  assert.deepEqual(
    result.map((item) => item.id),
    ["scapular-squeeze", "wall-pushup"],
  );
});

test("搜索膝盖会返回三个办公室下肢动作", () => {
  const result = filterMovements(movements, { query: "膝盖" });

  assert.deepEqual(
    result.map((item) => item.id),
    ["seated-knee-extension", "supported-half-squat", "supported-calf-raise"],
  );
});

test("新增的大幅度动作都有不同的起始与到位图", () => {
  const ids = [
    "chair-thoracic-extension",
    "scapular-squeeze",
    "wall-pushup",
    "seated-knee-extension",
    "supported-half-squat",
    "supported-calf-raise",
  ];

  for (const id of ids) {
    const movement = movements.find((item) => item.id === id);
    assert.ok(movement, `缺少动作：${id}`);
    assert.ok(movement.frames?.start, `缺少起始图：${id}`);
    assert.ok(movement.frames?.end, `缺少到位图：${id}`);
    assert.notEqual(movement.frames.start, movement.frames.end, `两张图不应相同：${id}`);
  }
});

test("动作列表使用独立的小尺寸无损缩略图", async () => {
  const selectMovementThumbnail = moduleUnderTest.selectMovementThumbnail ?? (() => null);

  assert.equal(
    selectMovementThumbnail({ image: "/assets/movements/example.png" }),
    "/assets/thumbnails/example.png",
  );

  for (const movement of movements) {
    const thumbnail = selectMovementThumbnail(movement);
    assert.match(thumbnail, /^\/assets\/thumbnails\/.+\.png$/);

    const bytes = await readFile(path.join(projectRoot, "public", thumbnail));
    assert.equal(bytes.toString("ascii", 1, 4), "PNG", `缩略图格式错误：${movement.id}`);
    assert.ok(bytes.readUInt32BE(16) <= 240, `缩略图过宽：${movement.id}`);
    assert.ok(bytes.readUInt32BE(20) <= 240, `缩略图过高：${movement.id}`);
  }
});
