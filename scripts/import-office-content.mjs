import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const modulePath = fileURLToPath(import.meta.url);
const scriptsDir = path.dirname(modulePath);
const projectRoot = path.resolve(scriptsDir, "..");

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function normalizeAction(indexEntry, content) {
  return {
    id: indexEntry.id,
    name: content["中文动作名称"],
    type: content["动作类型"],
    difficulty: content["难度等级"],
    bodyAreas: content["适用部位"] ?? [],
    targetMuscles: content["目标肌肉"] ?? [],
    regionIds: content["映射"]?.["身体区域ID"] ?? indexEntry["身体区域ID"] ?? [],
    muscleIds: content["映射"]?.["肌肉ID"] ?? indexEntry["肌肉ID"] ?? [],
    relatedActionIds: content["映射"]?.["相关动作ID"] ?? [],
    websitePath: content["映射"]?.["网页路径"],
    startPosition: content["起始姿势"],
    steps: content["动作步骤"] ?? [],
    breathing: content["呼吸引导"],
    intensity: content["拉伸强度"],
    duration: content["持续时间与次数"],
    keyPoints: content["动作要点"] ?? [],
    commonMistakes: content["常见错误"] ?? [],
    simplifiedVersion: content["简化版本"],
    stopConditions: content["停止条件"] ?? [],
    contraindications: content["不适用人群"] ?? [],
    sideRule: content["左右侧规则"],
    equipment: content["所需器材"] ?? [],
    reviewStatus: content["人工复核状态"],
    imageStatus: content["图片"]?.["生产状态"] ?? indexEntry["图片生产状态"],
    imageCopyright: content["图片"]?.["版权说明"],
    imageSpecPath: indexEntry["图片语义文件"],
    reviewPath: indexEntry["审阅文件"],
    source: {
      pdfPages: content["来源"]?.["PDF页码"] ?? [],
      bookPages: content["来源"]?.["书内页码"] ?? [],
      chapter: content["来源"]?.["章节"],
      pageIds: content["来源"]?.["页面ID"] ?? [],
    },
  };
}

function normalizeProgram(program) {
  return {
    id: program.id,
    name: program["中文名称"],
    durationMinutes: program["时长分钟"],
    totalSeconds: program["时长分钟"] * 60,
    scenario: program["适用场景"],
    intensityPrinciple: program["强度原则"],
    items: program["动作序列"].map((item) => ({
      actionId: item["动作ID"],
      seconds: item["秒数"],
      guidance: item["引导重点"],
    })),
  };
}

export function validateOfficeContent(snapshot) {
  const actionIds = new Set(snapshot.actions.map((action) => action.id));
  if (actionIds.size !== snapshot.actions.length) throw new Error("办公室动作存在重复 ID");

  for (const program of snapshot.programs) {
    const calculated = program.items.reduce((sum, item) => sum + item.seconds, 0);
    if (calculated !== program.totalSeconds) {
      throw new Error(`${program.id} 声明 ${program.totalSeconds} 秒，但动作合计 ${calculated} 秒`);
    }
    for (const item of program.items) {
      if (!actionIds.has(item.actionId)) throw new Error(`${program.id} 引用了未知动作 ${item.actionId}`);
    }
  }

  const expectedActionCount = snapshot.contentPack?.counts?.actions;
  if (Number.isInteger(expectedActionCount) && expectedActionCount !== snapshot.actions.length) {
    throw new Error(`manifest 声明 ${expectedActionCount} 个动作，但读取到 ${snapshot.actions.length} 个`);
  }
  return snapshot;
}

export async function loadOfficeContent(sourceDir) {
  const manifest = await readJson(path.join(sourceDir, "manifest.json"));
  const actionIndex = await readJson(path.join(sourceDir, "actions/index.json"));
  const actions = await Promise.all(actionIndex.map(async (entry) => {
    const content = await readJson(path.join(sourceDir, entry["内容文件"]));
    return normalizeAction(entry, content);
  }));
  const programs = await Promise.all([
    "programs/office-5min.json",
    "programs/office-10min.json",
    "programs/office-15min.json",
  ].map(async (relativeFile) => normalizeProgram(await readJson(path.join(sourceDir, relativeFile)))));

  const snapshot = {
    contentPack: {
      id: manifest["内容包ID"],
      name: manifest["内容包名称"],
      version: manifest["版本"],
      generatedDate: manifest["生成日期"],
      scope: manifest["范围说明"],
      source: manifest["来源"],
      copyrightBoundary: manifest["版权边界"],
      counts: {
        actions: manifest["统计"]?.["动作数"],
        muscles: manifest["统计"]?.["肌肉或肌群数"],
        regions: manifest["统计"]?.["身体区域数"],
        programs: manifest["统计"]?.["课程数"],
        sourcePages: manifest["统计"]?.["来源页面数"],
        completedImages: manifest["统计"]?.["已完成图片数"],
        pendingImages: manifest["统计"]?.["待原创图片动作数"],
      },
    },
    regions: await readJson(path.join(sourceDir, "anatomy/body-regions.json")),
    muscles: await readJson(path.join(sourceDir, "anatomy/muscles.json")),
    actions,
    programs,
    modelBindings: await readJson(path.join(sourceDir, "anatomy/model-bindings.json")),
    muscleToActions: await readJson(path.join(sourceDir, "mappings/muscle-to-actions.json")),
  };

  return validateOfficeContent(snapshot);
}

export async function writeOfficeContent({ sourceDir, outputFile }) {
  const snapshot = await loadOfficeContent(sourceDir);
  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  return snapshot;
}

async function firstReadable(paths) {
  for (const candidate of paths) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // 继续检查下一个明确候选目录。
    }
  }
  throw new Error(`找不到 stretching-anatomy-cn，已检查：${paths.join("、")}`);
}

function readArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function runCli() {
  const sourceDir = path.resolve(readArgument("--source") ?? await firstReadable([
    path.join(projectRoot, "stretching-anatomy-cn"),
    path.resolve(projectRoot, "../..", "stretching-anatomy-cn"),
  ]));
  const outputFile = path.resolve(readArgument("--output") ?? path.join(projectRoot, "src/data/officeContent.generated.json"));
  const snapshot = await writeOfficeContent({ sourceDir, outputFile });
  process.stdout.write(`已导入 ${snapshot.actions.length} 个动作、${snapshot.programs.length} 套课程：${outputFile}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === modulePath) {
  runCli().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
