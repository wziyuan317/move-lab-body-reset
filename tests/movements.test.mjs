import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const moduleUnderTest = await import("../src/movements.js").catch(() => ({
  filterMovements: () => [],
}));
const {
  filterMovements,
  getMovementFrames = () => [],
  movements = [],
  officeMovements = movements,
  selectMovementFrame = () => null,
  stretchingMovements = [],
} = moduleUnderTest;
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

test("GitHub Pages 子路径会保留在动作资源地址中", () => {
  const resolveAssetPath = moduleUnderTest.resolveAssetPath ?? (() => null);

  assert.equal(
    resolveAssetPath("/assets/movements/example.png", "/move-lab-body-reset/"),
    "/move-lab-body-reset/assets/movements/example.png",
  );
  assert.equal(resolveAssetPath("/assets/movements/example.png", "/"), "/assets/movements/example.png");
});

test("肩胛筛选会返回办公室肩胛稳定动作", () => {
  const result = filterMovements(officeMovements, { category: "肩胛" });

  assert.deepEqual(
    result.map((item) => item.id),
    ["scapular-squeeze", "wall-pushup"],
  );
});

test("搜索膝盖会返回三个办公室下肢动作", () => {
  const result = filterMovements(officeMovements, { query: "膝盖" });

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

  for (const movement of officeMovements) {
    const thumbnail = selectMovementThumbnail(movement);
    assert.match(thumbnail, /^\/assets\/thumbnails\/.+\.png$/);

    const bytes = await readFile(path.join(projectRoot, "public", thumbnail));
    assert.equal(bytes.toString("ascii", 1, 4), "PNG", `缩略图格式错误：${movement.id}`);
    assert.ok(bytes.readUInt32BE(16) <= 240, `缩略图过宽：${movement.id}`);
    assert.ok(bytes.readUInt32BE(20) <= 240, `缩略图过高：${movement.id}`);
  }
});

test("动作库融合后保留 15 个办公室动作并新增 83 个系统动作", () => {
  assert.equal(officeMovements.length, 15);
  assert.equal(stretchingMovements.length, 83);
  assert.equal(movements.length, 98);
  assert.equal(movements.filter((item) => item.collection === "office").length, 15);
  assert.equal(movements.filter((item) => item.collection === "system").length, 83);
});

test("系统动作帧按钮由实际静态或动态帧数决定", () => {
  const staticMovement = stretchingMovements.find((item) => item.actionType === "静态拉伸");
  const dynamicMovement = stretchingMovements.find((item) => item.actionType === "动态拉伸");

  assert.deepEqual(getMovementFrames(staticMovement).map((frame) => frame.label), ["起始", "到位"]);
  assert.deepEqual(getMovementFrames(dynamicMovement).map((frame) => frame.label), ["起始", "过程", "到位"]);
  assert.equal(selectMovementFrame(dynamicMovement, "process"), dynamicMovement.frames[1].src);
});

test("搜索覆盖动作名称、章节、适用部位和目标肌肉", () => {
  for (const query of ["初级坐姿脚趾伸肌拉伸", "足与小腿", "足背", "趾长伸肌"]) {
    const result = filterMovements(stretchingMovements, { query });
    assert.ok(result.some((item) => item.id === "动作-足小腿-001"), `${query} 未命中目标动作`);
  }
});

test("集合、区域、肌肉、难度和动作类型筛选可组合使用", () => {
  const target = stretchingMovements[0];
  const result = filterMovements(movements, {
    collection: "system",
    regionId: target.regionIds[0],
    muscleId: target.muscleIds[0],
    difficulty: target.difficulty,
    movementType: target.actionType,
  });

  assert.ok(result.length > 0);
  assert.ok(result.every((item) => item.collection === "system"));
  assert.ok(result.every((item) => item.regionIds.includes(target.regionIds[0])));
  assert.ok(result.every((item) => item.muscleIds.includes(target.muscleIds[0])));
});
