import stretchingMovementSource from "./generated/stretchingMovements.json" with { type: "json" };

const FRAME_LABELS = {
  start: "起始",
  process: "过程",
  end: "到位",
};

export function filterMovements(
  items,
  {
    query = "",
    category = "全部",
    collection = "all",
    regionId = "all",
    muscleId = "all",
    difficulty = "all",
    movementType = "all",
  } = {},
) {
  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");

  return items.filter((item) => {
    if (category !== "全部" && item.category !== category) {
      return false;
    }
    if (collection !== "all" && item.collection !== collection) {
      return false;
    }
    if (regionId !== "all" && !(item.regionIds ?? []).includes(regionId)) {
      return false;
    }
    if (muscleId !== "all" && !(item.muscleIds ?? []).includes(muscleId)) {
      return false;
    }
    if (difficulty !== "all" && item.difficulty !== difficulty) {
      return false;
    }
    if (movementType !== "all" && item.actionType !== movementType) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchable = [
      item.title,
      item.shortTitle,
      item.category,
      item.chapter,
      item.actionType,
      item.difficulty,
      ...(item.bodyAreas ?? []),
      ...(item.muscles ?? []),
      ...(item.keywords ?? []),
      ...(item.keyPoints ?? []),
    ]
      .join(" ")
      .toLocaleLowerCase("zh-CN");

    return searchable.includes(normalizedQuery);
  });
}

export function resolveAssetPath(assetPath, baseUrl = import.meta.env?.BASE_URL ?? "/") {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedAssetPath = assetPath.replace(/^\/+/, "");
  return `${normalizedBaseUrl}${normalizedAssetPath}`;
}

export function getMovementFrames(movement) {
  if (Array.isArray(movement.frames)) {
    return movement.frames;
  }

  if (movement.frames && typeof movement.frames === "object") {
    return ["start", "process", "end"]
      .filter((id) => movement.frames[id])
      .map((id) => ({ id, label: FRAME_LABELS[id], src: movement.frames[id] }));
  }

  return movement.image
    ? [{ id: "end", label: "动作", src: movement.image }]
    : [];
}

export function selectMovementFrame(movement, phase) {
  const frames = getMovementFrames(movement);
  const selected = frames.find((frame) => frame.id === phase) ?? frames.at(-1);
  return selected ? resolveAssetPath(selected.src) : "";
}

export function selectMovementThumbnail(movement) {
  if (movement.thumbnail) {
    return resolveAssetPath(movement.thumbnail);
  }
  const filename = movement.image.split("/").at(-1);
  return resolveAssetPath(`/assets/thumbnails/${filename}`);
}

const officeMovementSource = [
  {
    id: "neck-sidebend",
    title: "颈侧斜方肌放松",
    shortTitle: "颈侧放松",
    category: "斜方肌",
    duration: "20–30 秒 / 侧",
    intensity: "轻柔",
    image: "/assets/movements/neck-sidebend.png",
    muscles: ["上斜方肌", "肩胛提肌"],
    keywords: ["颈肩", "斜方肌", "久坐", "肩膀紧"],
    principle:
      "用小幅度侧屈与肩带下沉，给颈侧到肩峰的软组织温和的长度变化。重点是降低不必要的耸肩紧张，不是用手把头压得更低。",
    steps: [
      "坐稳，双脚落地，胸廓保持自然直立。",
      "一只手轻放头侧，另一侧肩膀主动向下放松。",
      "头缓慢侧倾，感到颈侧轻微牵拉即可，保持正常呼吸。",
    ],
    benefits: ["减少久坐后的颈侧紧绷感", "帮助恢复舒适的侧屈活动", "练习识别耸肩习惯"],
    cue: "手只是引导，不是加压。",
    stop: "出现头晕、视觉异常、手臂放射痛或麻木时立即停止。",
  },
  {
    id: "levator-stretch",
    title: "肩胛提肌斜向伸展",
    shortTitle: "肩胛提肌",
    category: "颈部",
    duration: "15–20 秒 / 侧",
    intensity: "小幅度",
    image: "/assets/movements/levator-stretch.png",
    muscles: ["肩胛提肌", "颈后侧肌群"],
    keywords: ["颈部", "落枕", "低头", "肩胛内上角"],
    principle:
      "头转向对侧后再轻微点头，会更集中地改变从颈后侧连到肩胛内上角的肩胛提肌长度。压低同侧肩膀能减少躯干代偿。",
    steps: [
      "坐在椅子前部，一只手轻勾椅座，让同侧肩膀保持低位。",
      "头向对侧转约 30°，再把下巴缓慢朝对侧腋窝方向点下。",
      "上方手轻放后脑，保持自然呼吸，不做弹动。",
    ],
    benefits: ["改善颈后侧局部紧绷感", "帮助转头与低头动作更顺畅", "建立肩膀下沉的体感"],
    cue: "视线朝向腋窝，不要直接把头压向胸口。",
    stop: "若出现电击感、麻木、无力、头晕或疼痛向手臂传导，停止并咨询专业人员。",
  },
  {
    id: "thoracic-wave",
    title: "坐姿胸椎展开与回收",
    shortTitle: "胸椎波浪",
    category: "胸椎",
    duration: "5 轮慢呼吸",
    intensity: "流动",
    image: "/assets/movements/thoracic-wave.png",
    muscles: ["胸椎旁肌群", "肩胛周围肌群"],
    keywords: ["胸椎", "驼背", "上背", "呼吸"],
    principle:
      "在骨盆稳定的前提下，让胸椎在轻微伸展和屈曲之间来回活动。呼吸为动作提供节律，并帮助避免只用腰椎代偿。",
    steps: [
      "坐稳，双脚平放，吸气时手臂向上展开，胸骨轻微上提。",
      "呼气时手臂向前回收，下巴轻收，上背温和变圆。",
      "在两个位置间缓慢切换，骨盆尽量不前后摇动。",
    ],
    benefits: ["增加胸椎活动感", "减少长时间固定姿势带来的僵硬", "让呼吸与上背运动更协调"],
    cue: "展开时不要猛仰头，回收时不要懋气。",
    stop: "如果出现明显刺痛、胸痛或呼吸困难，立即停止。",
  },
  {
    id: "chair-thoracic-extension",
    title: "椅背胸椎伸展",
    shortTitle: "椅背开胸",
    category: "胸椎",
    duration: "5–8 次慢呼吸",
    intensity: "小幅展开",
    image: "/assets/movements/chair-thoracic-extension.png",
    frames: {
      start: "/assets/movements/chair-thoracic-extension-start.png",
      end: "/assets/movements/chair-thoracic-extension.png",
    },
    muscles: ["胸椎旁肌群", "胸前软组织"],
    keywords: ["圆肩", "驼背", "上背", "胸椎", "办公室"],
    principle:
      "稳定椅背像一个支点，帮助久坐后处在屈曲位的中上背温和地回到伸展方向。骨盆留在椅面、腰部不过度反弓，才能把动作更多留在胸椎。",
    steps: [
      "选择没有滚轮的稳定四脚椅，双脚踩稳，骨盆坐在椅面中央。",
      "双手托住后脑，让椅背上缘位于中上背，先轻收下巴。",
      "吸气时胸骨向上展开，背部轻靠椅背；呼气时回到直立，不追求大幅度。",
    ],
    benefits: ["给久坐上背增加姿势变化", "练习胸椎伸展而不猛仰头", "为肩臂抬举提供更舒适的胸廓位置"],
    cue: "从胸口区域展开，头只是跟随；腰部和颈部不要抢动作。",
    stop: "出现脊柱锐痛、头晕、胸痛、呼吸困难或手臂放射症状时停止。",
  },
  {
    id: "chest-opener",
    title: "站姿锁骨展开",
    shortTitle: "站姿开胸",
    category: "胸肩",
    duration: "4–5 次呼吸",
    intensity: "温和",
    image: "/assets/movements/chest-opener.png",
    frames: {
      start: "/assets/movements/chest-opener-start.png",
      end: "/assets/movements/chest-opener.png",
    },
    muscles: ["胸大肌", "胸小肌", "肩胛内收肌群"],
    keywords: ["圆肩", "驼背", "胸口", "锁骨", "肩前侧"],
    principle:
      "手臂向下与轻微向后的运动，配合肩胛温和后收，会让胸前软组织获得拉伸。胸廓展开应来自胸椎与肩带，不是腰部过度反弓。",
    steps: [
      "双脚与髋同宽，双手在身后交握，先保持自然站立。",
      "呼气时手向下延伸，锁骨向两侧展开，肩膀远离耳朵。",
      "视线只轻微向上 5–10°，下腹保持轻微支撑。",
    ],
    benefits: ["减轻胸前与肩前侧紧绷感", "帮助改善久坐后的圆肩姿势感", "提醒肩胛向后与向下协调"],
    cue: "手不需抬得很高，锁骨展开比幅度更重要。",
    stop: "若肩前侧出现夹挤痛、手臂麻木或颈部不适，减小幅度或停止。",
  },
  {
    id: "scapular-squeeze",
    title: "坐姿肩胛后收下沉",
    shortTitle: "肩胛收紧",
    category: "肩胛",
    duration: "保持 3 秒 × 8–10 次",
    intensity: "轻力量",
    image: "/assets/movements/scapular-squeeze.png",
    frames: {
      start: "/assets/movements/scapular-squeeze-start.png",
      end: "/assets/movements/scapular-squeeze.png",
    },
    muscles: ["中下斜方肌", "菱形肌", "前锯肌协同"],
    keywords: ["圆肩", "驼背", "肩胛骨疼", "肩胛稳定", "办公室"],
    principle:
      "肩胛骨轻柔地向后、向下滑动，可以训练肩胛稳定肌群的耐力与位置觉。它不是把身体硬掰成“军姿”，也不需要把两块肩胛骨用力夹死。",
    steps: [
      "坐在椅子前部，双脚踩稳，手臂自然下垂或屈肘约 90°。",
      "呼气时让双肘微微向后，肩胛骨向脊柱靠近并向下滑。",
      "保持 3 秒后完全放松，再重复；颈部始终保持轻松。",
    ],
    benefits: ["唤醒肩胛稳定肌群", "减少持续圆肩位带来的上背疲劳感", "支持抬手和推撑时的肩胛控制"],
    cue: "想象肩胛骨滑向后裤袋；不耸肩，也不用力挺腰。",
    stop: "肩胛或肩关节出现锐痛、手臂麻木无力、胸痛时停止并寻求评估。",
  },
  {
    id: "wall-pushup",
    title: "墙面俯卧撑",
    shortTitle: "墙面推撑",
    category: "肩胛",
    duration: "6–10 次",
    intensity: "距离可调",
    image: "/assets/movements/wall-pushup.png",
    frames: {
      start: "/assets/movements/wall-pushup-start.png",
      end: "/assets/movements/wall-pushup.png",
    },
    muscles: ["前锯肌", "胸肌", "肱三头肌", "肩胛稳定肌群"],
    keywords: ["圆肩", "肩胛骨疼", "肩胛稳定", "墙面", "办公室"],
    principle:
      "手掌固定在墙面形成闭链支撑，肩胛骨可以在胸廓上做受控滑动。身体离墙越远负荷越大，先从容易保持肩颈放松的距离开始。",
    steps: [
      "面向墙站立，双手与胸口同高，身体从头到脚保持一条直线。",
      "屈肘约 30–45°，全身一起靠近墙面，肩膀远离耳朵。",
      "双手推墙回到起始位，胸廓和骨盆同步移动，不塌腰。",
    ],
    benefits: ["训练肩胛稳定与上肢推撑耐力", "让前锯肌参与肩胛控制", "适合作为办公室低负荷力量间歇"],
    cue: "身体像一块整板移动，不要只把头或肚子送向墙。",
    stop: "出现肩前侧夹挤痛、肩胛锐痛、胸痛、头晕或手臂症状时停止。",
  },
  {
    id: "figure-four",
    title: "坐姿四字臀肌伸展",
    shortTitle: "四字臀肌",
    category: "臀髋",
    duration: "20–30 秒 / 侧",
    intensity: "可调节",
    image: "/assets/movements/figure-four.png",
    frames: {
      start: "/assets/movements/figure-four-start.png",
      end: "/assets/movements/figure-four.png",
    },
    muscles: ["臀大肌", "臀中肌", "梨状肌区域"],
    keywords: ["臀部", "髋部", "久坐", "梨状肌", "二郎腿"],
    principle:
      "将髋关节放在屈曲、外展和外旋位，再从髋部轻微前倾，会温和地改变臀后侧肌群的长度。体感应在臀部，不应是膝关节受压。",
    steps: [
      "坐到椅子前部，一侧脚踝放到对侧大腿上，脚掌轻微回勾。",
      "先在直立位置确认膝关节舒服，双侧坐骨都在椅面上。",
      "保持脊柱延伸，从髋部向前折叠，臀部出现温和牵拉即可。",
    ],
    benefits: ["减少臀部的久坐紧绷感", "改善髋关节外旋活动的舒适度", "为走路或下肢活动做温和准备"],
    cue: "脚踝放在大腿上，不要直接压在膝盖上。",
    stop: "膝关节疼痛、麻木或腿部放射痛加重时，立即退出动作。",
  },
  {
    id: "seated-knee-extension",
    title: "坐姿主动伸膝",
    shortTitle: "坐姿伸膝",
    category: "膝盖",
    duration: "8–10 次 / 侧",
    intensity: "低负荷",
    image: "/assets/movements/seated-knee-extension.png",
    frames: {
      start: "/assets/movements/seated-knee-extension-start.png",
      end: "/assets/movements/seated-knee-extension.png",
    },
    muscles: ["股四头肌"],
    keywords: ["膝盖疼", "膝关节", "股四头肌", "久坐", "办公室"],
    principle:
      "缓慢主动伸膝能在低负荷下激活股四头肌，并让久坐后的膝关节重新活动。动作以控制为主，不靠甩腿，也不用于判断膝痛原因。",
    steps: [
      "坐在稳定椅子上，身体直立，双脚踩地，大腿保持在椅面上。",
      "缓慢把一侧小腿抬起并伸直膝盖，脚踝保持自然。",
      "在可控位置停 2–3 秒，再慢慢放下；左右交替。",
    ],
    benefits: ["激活股四头肌", "维持膝关节舒适活动范围", "帮助从久坐过渡到站立和步行"],
    cue: "慢抬、停稳、慢放；大腿不离开椅面，不甩腿。",
    stop: "疼痛明显增加、膝部肿胀、卡住或腿软时停止并接受评估。",
  },
  {
    id: "supported-half-squat",
    title: "扶桌浅蹲",
    shortTitle: "扶桌浅蹲",
    category: "膝盖",
    duration: "6–10 次",
    intensity: "浅幅度",
    image: "/assets/movements/supported-half-squat.png",
    frames: {
      start: "/assets/movements/supported-half-squat-start.png",
      end: "/assets/movements/supported-half-squat.png",
    },
    muscles: ["股四头肌", "臀肌", "腿后侧肌群"],
    keywords: ["膝盖疼", "膝关节", "下肢力量", "起立", "办公室"],
    principle:
      "浅蹲用接近日常坐起的方式给膝和髋提供可控负荷。扶稳固桌面可以降低平衡要求，深度则根据疼痛和控制能力调整。",
    steps: [
      "面对稳固桌面，双脚约与肩同宽，双手只做轻扶。",
      "臀部像要坐向身后的椅子一样向后、向下约 20 厘米，脚跟保持着地。",
      "膝盖朝第二脚趾方向，胸口保持抬起，再用腿臀力量站直。",
    ],
    benefits: ["训练股四头肌与臀肌", "为坐站转换和上下楼提供力量准备", "逐步建立膝关节负荷耐受"],
    cue: "膝盖跟随脚尖，重量留在全脚掌；疼痛上升前就回程。",
    stop: "膝部锐痛、肿胀、卡锁或腿软时停止；不要扶不稳定的桌椅。",
  },
  {
    id: "supported-calf-raise",
    title: "扶桌双脚提踵",
    shortTitle: "扶桌提踵",
    category: "膝盖",
    duration: "10–12 次",
    intensity: "低负荷",
    image: "/assets/movements/supported-calf-raise.png",
    frames: {
      start: "/assets/movements/supported-calf-raise-start.png",
      end: "/assets/movements/supported-calf-raise.png",
    },
    muscles: ["腓肠肌", "比目鱼肌"],
    keywords: ["膝盖疼", "小腿", "脚踝", "步行", "办公室"],
    principle:
      "小腿肌群为走路蹬地和下肢控制提供力量。轻扶桌面后做慢速提踵，可以用较低的平衡难度训练小腿耐力。",
    steps: [
      "双脚平行站在稳固桌面前，双手轻扶，左右脚均匀承重。",
      "脚掌压地，双侧脚跟同时缓慢抬高，身体垂直向上。",
      "顶端短暂停留，再慢慢把脚跟放回地面。",
    ],
    benefits: ["训练小腿肌群耐力", "支持步行和上下楼时的蹬地控制", "为久坐提供一次下肢活动变化"],
    cue: "垂直升降，脚踝不要向外翻，双侧高度尽量一致。",
    stop: "小腿突然肿胀、发热或压痛，或膝踝出现锐痛、头晕时停止并及时就医。",
  },
  {
    id: "seated-twist",
    title: "坐姿胸廓旋转",
    shortTitle: "坐姿旋转",
    category: "腰背",
    duration: "3–4 次呼吸 / 侧",
    intensity: "不强拧",
    image: "/assets/movements/seated-twist.png",
    frames: {
      start: "/assets/movements/seated-twist-start.png",
      end: "/assets/movements/seated-twist.png",
    },
    muscles: ["腹内外斜肌", "胸椎旋转肌群"],
    keywords: ["腰背", "旋转", "胸椎", "久坐"],
    principle:
      "先把脊柱向上延长，再主要让胸廓转动，可以练习躯干旋转而不把幅度全部压到腰椎。双侧坐骨稳定是动作质量的标准。",
    steps: [
      "先坐直，双脚平放，双手放在大腿上，感受两侧坐骨均匀承重。",
      "一手放到对侧大腿外侧，另一手轻扶椅背。",
      "吸气时向上延长，呼气时让胸骨和肩膀缓慢转向后方。",
    ],
    benefits: ["增加胸廓旋转的活动感", "减少久坐后躯干僵硬", "帮助区分胸廓转动与骨盆稳定"],
    cue: "手只做支撑，不用手臂把身体拧到极限。",
    stop: "旋转引起腰部锐痛、腿部麻木或放射痛时立即停止。",
  },
  {
    id: "supported-hinge",
    title: "椅背支撑髋折叠",
    shortTitle: "椅背髋折叠",
    category: "腰背",
    duration: "20–30 秒",
    intensity: "后链伸展",
    image: "/assets/movements/supported-hinge.png",
    frames: {
      start: "/assets/movements/supported-hinge-start.png",
      end: "/assets/movements/supported-hinge.png",
    },
    muscles: ["背阔肌", "竖脊肌", "腿后侧肌群"],
    keywords: ["腰背", "后侧链", "腿后侧", "髋折叠", "办公室"],
    principle:
      "手扶稳定支撑物，再把髋部向后移，可以让脊柱在相对长的位置下活动肩带、髋和后侧链。这是髋折叠伸展，不等同于医疗牵引。",
    steps: [
      "站在稳固椅子的椅背后方，椅面应位于椅背另一侧，双脚与髋同宽。",
      "双手扶椅背，膝盖微屈，臀部持续向后移，躯干从髋关节向前折叠。",
      "在舒服范围内让躯干接近水平，颈部与脊柱保持长线，肩膀远离耳朵。",
    ],
    benefits: ["减少后侧链紧绷感", "练习从髋部折叠而不是只弯腰", "为久坐后起身活动提供温和过渡"],
    cue: "椅面在椅背前方、人与椅面分处两侧；臀部后移比手臂下压更重要。",
    stop: "出现腰腿放射痛、麻木、明显无力或疼痛迅速加重时停止。",
  },
  {
    id: "side-bend",
    title: "站姿侧链延展",
    shortTitle: "站姿侧屈",
    category: "侧链",
    duration: "15–20 秒 / 侧",
    intensity: "小幅度",
    image: "/assets/movements/side-bend.png",
    frames: {
      start: "/assets/movements/side-bend-start.png",
      end: "/assets/movements/side-bend.png",
    },
    muscles: ["背阔肌", "腹斜肌", "腰方肌", "肋间肌"],
    keywords: ["侧腰", "侧链", "腰方肌", "背阔肌", "肋骨"],
    principle:
      "一侧手臂向上延伸，躯干再做小幅度侧屈，可以让外侧肋骨、背阔肌和侧腰区域获得长度变化。双脚均匀受力与骨盆稳定是终点标准。",
    steps: [
      "双脚与髋同宽，右手向上伸直，躯干先保持垂直。",
      "保持两只脚都压地，骨盆不转动，躯干小幅度向左侧倾。",
      "右手继续延伸，右肩不耸起，感到右侧肋骨到腰部温和牵拉。",
    ],
    benefits: ["改善侧腰与外侧肋骨紧绷感", "增加躯干侧屈的舒适活动", "帮助感受两侧呼吸扩张"],
    cue: "身体像夹在两块玻璃之间，不向前塔也不向后扭。",
    stop: "侧腰出现夹挤性锐痛，或疼痛向腿部放射时停止。",
  },
  {
    id: "seated-fold",
    title: "坐姿温和腰背屈曲",
    shortTitle: "坐姿抱腿",
    category: "腰背",
    duration: "15–20 秒",
    intensity: "完全放松",
    image: "/assets/movements/seated-fold.png",
    frames: {
      start: "/assets/movements/seated-fold-start.png",
      end: "/assets/movements/seated-fold.png",
    },
    muscles: ["胸腰段竖脊肌", "背部筋膜"],
    keywords: ["腰背", "下背", "屈曲", "放松", "久坐"],
    principle:
      "在椅子上用很小的负荷让胸腰段屈曲，可以改变长时间维持一个姿势后的局部张力感。这是可选的舒适动作，不适合所有腰痛类型。",
    steps: [
      "坐到椅子前部，双脚平放并稍微分开，双手放在大腿上。",
      "先呼气，让躯干缓慢落到大腿之间；双臂从外侧绕到大腿下方并轻轻相扣。",
      "头颈随躯干放松，不主动向下拉；起身时用手支撑大腿缓慢回来。",
    ],
    benefits: ["减少腰背后侧紧绷感", "在工位上提供短暂姿势变化", "练习在屈曲中保持呼吸与放松"],
    cue: "手抱在大腿下方，不向下拽小腿或脚踝；舒服比幅度更重要。",
    stop: "若屈曲会加重腰腿放射痛、麻木或无力，不要继续。",
  },
];

export const officeMovements = officeMovementSource.map((movement) => ({
  ...movement,
  collection: "office",
  collectionLabel: "办公室改善",
  actionType: movement.actionType ?? "办公室动作",
  difficulty: movement.difficulty ?? "办公室友好",
  bodyAreas: movement.bodyAreas ?? [movement.category],
  regionIds: movement.regionIds ?? [],
  muscleIds: movement.muscleIds ?? [],
}));

export const stretchingMovements = stretchingMovementSource;

export const movements = [...officeMovements, ...stretchingMovements];
