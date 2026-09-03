import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const FRAME_IDS = {
  起始: "start",
  过程: "process",
  到位: "end",
};

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const PROJECT_ROOT = path.resolve(path.dirname(SCRIPT_PATH), "../..");

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeJsonDeterministically(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporaryPath, filePath);
}

function requiredValue(value, label) {
  if (value === undefined || value === null) {
    throw new Error(`缺少必填内容：${label}`);
  }
  return value;
}

function buildFrame({ actionId, actionDirectory, frameDeclaration }) {
  const label = requiredValue(frameDeclaration.帧名, `${actionId} 图片帧名`);
  const id = FRAME_IDS[label];
  if (!id) {
    throw new Error(`${actionId} 使用了未知图片帧：${label}`);
  }

  const sourceRelativePath = requiredValue(
    frameDeclaration.相对路径,
    `${actionId} ${label} 图片路径`,
  );
  const sourcePath = path.join(actionDirectory, sourceRelativePath);
  const publicDirectory = `/assets/stretching-anatomy/${actionId}`;

  return {
    id,
    label,
    src: `${publicDirectory}/${id}.webp`,
    thumbnail: `${publicDirectory}/thumb-${id}.webp`,
    sourceImage: sourceRelativePath.replaceAll(path.sep, "/"),
    sourcePath,
  };
}

function toWebMovement({
  indexEntry,
  content,
  recommendations,
  websitePath,
  reviewItems,
  contentPath,
}) {
  const actionId = requiredValue(indexEntry.动作ID, "动作总索引.动作ID");
  if (content.动作ID !== actionId) {
    throw new Error(`${actionId} 的内容文件动作 ID 不一致：${content.动作ID ?? "缺失"}`);
  }

  const normalized = requiredValue(content.中文规范化, `${actionId}.中文规范化`);
  const safety = requiredValue(content.安全补充, `${actionId}.安全补充`);
  const source = requiredValue(content.来源提取, `${actionId}.来源提取`);
  const mapping = requiredValue(content.映射, `${actionId}.映射`);
  const frameDeclarations = requiredValue(indexEntry.图片帧声明?.帧, `${actionId}.图片帧声明.帧`);
  const actionDirectory = path.dirname(contentPath);
  const framesWithSource = frameDeclarations.map((frameDeclaration) =>
    buildFrame({ actionId, actionDirectory, frameDeclaration }),
  );

  const expectedFrameLabels = content.动作类型 === "动态拉伸"
    ? ["起始", "过程", "到位"]
    : ["起始", "到位"];
  const actualFrameLabels = framesWithSource.map((frame) => frame.label);
  if (JSON.stringify(actualFrameLabels) !== JSON.stringify(expectedFrameLabels)) {
    throw new Error(
      `${actionId} 帧顺序错误：期望 ${expectedFrameLabels.join("、")}，实际 ${actualFrameLabels.join("、")}`,
    );
  }

  const frames = framesWithSource.map(({ sourcePath: _sourcePath, ...frame }) => frame);
  const movementReviewItems = reviewItems.filter((item) => item.对象ID === actionId);

  return {
    id: actionId,
    collection: "system",
    collectionLabel: "系统拉伸库",
    title: requiredValue(normalized.中文动作名称, `${actionId}.中文动作名称`),
    shortTitle: normalized.中文动作名称,
    actionType: requiredValue(content.动作类型, `${actionId}.动作类型`),
    chapter: requiredValue(normalized.所属章节, `${actionId}.所属章节`),
    category: normalized.所属章节,
    difficulty: requiredValue(normalized.难度等级, `${actionId}.难度等级`),
    bodyAreas: requiredValue(normalized.适用部位, `${actionId}.适用部位`),
    regionIds: requiredValue(mapping.身体区域ID, `${actionId}.身体区域ID`),
    muscles: [
      ...requiredValue(normalized.主要目标肌肉, `${actionId}.主要目标肌肉`),
      ...requiredValue(normalized.次要目标肌肉, `${actionId}.次要目标肌肉`),
    ],
    muscleIds: requiredValue(mapping.肌肉ID, `${actionId}.肌肉ID`),
    primaryMuscles: normalized.主要目标肌肉,
    primaryMuscleIds: normalized.主要目标肌肉ID,
    secondaryMuscles: normalized.次要目标肌肉,
    secondaryMuscleIds: normalized.次要目标肌肉ID,
    startPosition: requiredValue(normalized.起始姿势, `${actionId}.起始姿势`),
    steps: requiredValue(normalized.动作步骤, `${actionId}.动作步骤`),
    breathing: requiredValue(normalized.呼吸引导, `${actionId}.呼吸引导`),
    intensity: requiredValue(normalized.拉伸强度, `${actionId}.拉伸强度`),
    duration: requiredValue(normalized.持续时间与次数, `${actionId}.持续时间与次数`),
    commonMistakes: requiredValue(normalized.常见错误, `${actionId}.常见错误`),
    simplifiedVersion: requiredValue(normalized.简化版本, `${actionId}.简化版本`),
    keyPoints: requiredValue(normalized.动作要点, `${actionId}.动作要点`),
    sideRule: requiredValue(normalized.左右侧规则, `${actionId}.左右侧规则`),
    equipment: requiredValue(normalized.所需器材, `${actionId}.所需器材`),
    stopConditions: requiredValue(safety.停止条件, `${actionId}.停止条件`),
    contraindications: requiredValue(safety.不适用人群, `${actionId}.不适用人群`),
    riskWarnings: requiredValue(safety.风险提示, `${actionId}.风险提示`),
    informationBasis: requiredValue(content.信息依据, `${actionId}.信息依据`),
    sources: {
      pdfPages: requiredValue(source.PDF页码, `${actionId}.PDF页码`),
      bookPages: requiredValue(source.书内页码, `${actionId}.书内页码`),
      pageIds: requiredValue(source.页面ID, `${actionId}.页面ID`),
      pageReferences: requiredValue(indexEntry.页面引用, `${actionId}.页面引用`),
      structuredContent: indexEntry.内容文件.结构化内容,
      reviewContent: indexEntry.内容文件.人工审阅内容,
    },
    website: requiredValue(websitePath, `${actionId}.网站路径`),
    recommendations: requiredValue(recommendations, `${actionId}.相关推荐`),
    reviewStatus: movementReviewItems,
    frames,
    image: frames.at(-1).src,
    thumbnail: frames[0].thumbnail,
    keywords: [
      normalized.中文动作名称,
      normalized.所属章节,
      normalized.难度等级,
      content.动作类型,
      ...normalized.适用部位,
      ...normalized.主要目标肌肉,
      ...normalized.次要目标肌肉,
      ...normalized.动作要点,
    ],
  };
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

async function generateFrameAssets({ movement, frame, assetOutput }) {
  const actionAssetDirectory = path.join(assetOutput, movement.id);
  const frameSource = movement.__sourceFrames.find((item) => item.id === frame.id)?.sourcePath;
  if (!frameSource) {
    throw new Error(`${movement.id} 的 ${frame.label} 帧缺少源图片路径`);
  }

  await mkdir(actionAssetDirectory, { recursive: true });
  await Promise.all([
    sharp(frameSource)
      .rotate()
      .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 84, effort: 6 })
      .toFile(path.join(actionAssetDirectory, `${frame.id}.webp`)),
    sharp(frameSource)
      .rotate()
      .resize({ width: 320, height: 320, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 76, effort: 6 })
      .toFile(path.join(actionAssetDirectory, `thumb-${frame.id}.webp`)),
  ]);
}

export async function buildStretchingWebLibrary({
  packageRoot = path.join(PROJECT_ROOT, "content-packs/stretching-anatomy-cn"),
  dataOutput = path.join(PROJECT_ROOT, "src/generated/stretchingMovements.json"),
  assetOutput = path.join(PROJECT_ROOT, "public/assets/stretching-anatomy"),
  writeImages = true,
  onProgress,
} = {}) {
  const [actionIndex, recommendationIndex, websiteIndex, review] = await Promise.all([
    readJson(path.join(packageRoot, "动作/动作总索引.json")),
    readJson(path.join(packageRoot, "索引关系/动作相关推荐.json")),
    readJson(path.join(packageRoot, "索引关系/网站路径.json")),
    readJson(path.join(packageRoot, "验证/待人工复核.json")),
  ]);

  if (!Array.isArray(actionIndex)) {
    throw new Error("动作/动作总索引.json 必须是数组");
  }

  const seenIds = new Set();
  const internalMovements = [];
  for (const indexEntry of actionIndex) {
    const actionId = requiredValue(indexEntry.动作ID, "动作总索引.动作ID");
    if (seenIds.has(actionId)) {
      throw new Error(`动作总索引存在重复 ID：${actionId}`);
    }
    seenIds.add(actionId);

    const contentRelativePath = requiredValue(
      indexEntry.内容文件?.结构化内容,
      `${actionId}.内容文件.结构化内容`,
    );
    const contentPath = path.join(packageRoot, contentRelativePath);
    const content = await readJson(contentPath);
    const movement = toWebMovement({
      indexEntry,
      content,
      recommendations: recommendationIndex[actionId],
      websitePath: websiteIndex[actionId],
      reviewItems: review.条目,
      contentPath,
    });

    const actionDirectory = path.dirname(contentPath);
    movement.__sourceFrames = indexEntry.图片帧声明.帧.map((frameDeclaration) =>
      buildFrame({ actionId, actionDirectory, frameDeclaration }),
    );
    internalMovements.push(movement);
  }

  const sourceImages = internalMovements.reduce((sum, item) => sum + item.frames.length, 0);
  if (writeImages) {
    await rm(assetOutput, { recursive: true, force: true });
    const frameJobs = internalMovements.flatMap((movement) =>
      movement.frames.map((frame) => ({ movement, frame })),
    );
    let completed = 0;
    await mapWithConcurrency(frameJobs, 4, async (job) => {
      await generateFrameAssets({ ...job, assetOutput });
      completed += 1;
      onProgress?.({ completed, total: frameJobs.length, actionId: job.movement.id });
    });
  }

  const movements = internalMovements.map(({ __sourceFrames: _sourceFrames, ...movement }) => movement);
  await writeJsonDeterministically(dataOutput, movements);

  const summary = {
    actions: movements.length,
    staticActions: movements.filter((item) => item.actionType === "静态拉伸").length,
    dynamicActions: movements.filter((item) => item.actionType === "动态拉伸").length,
    sourceImages,
    generatedDetailImages: writeImages ? sourceImages : 0,
    generatedThumbnails: writeImages ? sourceImages : 0,
    failed: 0,
    skipped: writeImages ? 0 : sourceImages * 2,
    pendingThreeBindings: review.数量.三维模型绑定,
    pendingMedicalReviews: review.数量.医学专业复核,
  };

  return { movements, summary };
}

async function runFromCli() {
  let lastPrinted = 0;
  const result = await buildStretchingWebLibrary({
    onProgress({ completed, total }) {
      if (completed === total || completed - lastPrinted >= 20) {
        lastPrinted = completed;
        console.log(`图片处理进度：${completed}/${total}`);
      }
    },
  });
  console.log(JSON.stringify(result.summary, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  runFromCli().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
