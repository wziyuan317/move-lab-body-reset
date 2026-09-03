import { stretchingMovements } from "./movements.js";

export const contentRegionIdsByBodyRegionId = {
  neck: ["区域-颈部"],
  shoulder: ["区域-肩背胸", "区域-手臂手部"],
  thorax: ["区域-肩背胸"],
  "low-back": ["区域-下躯干"],
  hip: ["区域-髋臀"],
  thigh: ["区域-膝大腿"],
  knee: ["区域-膝大腿"],
  ankle: ["区域-踝小腿", "区域-足"],
};

export const contentMuscleIdsByTargetId = {
  "upper-trapezius": ["肌肉-上斜方肌", "肌肉-斜方肌"],
  "levator-scapulae": ["肌肉-肩胛提肌"],
  "posterior-neck": ["肌肉-头夹肌", "肌肉-颈夹肌"],
  deltoid: ["肌肉-三角肌前束", "肌肉-三角肌中束", "肌肉-三角肌后束"],
  infraspinatus: ["肌肉-冈下肌"],
  "middle-lower-trapezius": ["肌肉-中斜方肌", "肌肉-下斜方肌", "肌肉-斜方肌"],
  rhomboids: ["肌肉-菱形肌", "肌肉-菱形肌群"],
  "serratus-anterior": ["肌肉-前锯肌"],
  "pectoralis-major": ["肌肉-胸大肌"],
  "pectoralis-minor": ["肌肉-胸小肌"],
  "thoracic-erectors": ["肌肉-胸最长肌", "肌肉-胸棘肌", "肌肉-竖脊肌"],
  "latissimus-dorsi": ["肌肉-背阔肌"],
  "lumbar-erectors": ["肌肉-腰髂肋肌", "肌肉-最长肌", "肌肉-棘肌", "肌肉-竖脊肌"],
  "quadratus-lumborum": ["肌肉-腰方肌"],
  "lateral-abdominals": ["肌肉-腹内斜肌", "肌肉-腹外斜肌"],
  "gluteus-maximus": ["肌肉-臀大肌"],
  "gluteus-medius": ["肌肉-臀中肌"],
  piriformis: ["肌肉-梨状肌"],
  "hip-flexors": ["肌肉-髂腰肌", "肌肉-髂肌", "肌肉-腰大肌"],
  "quadriceps-area": ["肌肉-股四头肌群", "肌肉-股直肌", "肌肉-内侧广肌", "肌肉-外侧广肌", "肌肉-股中间肌"],
  "hamstring-area": ["肌肉-腘绳肌群", "肌肉-股二头肌", "肌肉-半腱肌", "肌肉-半膜肌"],
  "rectus-femoris": ["肌肉-股直肌"],
  "vastus-medialis": ["肌肉-内侧广肌"],
  "vastus-lateralis": ["肌肉-外侧广肌"],
  "knee-hamstrings": ["肌肉-腘绳肌群", "肌肉-股二头肌", "肌肉-半腱肌", "肌肉-半膜肌", "肌肉-腘肌"],
  gastrocnemius: ["肌肉-腓肠肌"],
  soleus: ["肌肉-比目鱼肌"],
  "tibialis-anterior": ["肌肉-胫骨前肌"],
};

function uniqueIds(items) {
  return [...new Set(items)];
}

export function getStretchingIdsForRegion(bodyRegionId) {
  const regionIds = contentRegionIdsByBodyRegionId[bodyRegionId] ?? [];
  return stretchingMovements
    .filter((movement) => movement.regionIds.some((id) => regionIds.includes(id)))
    .map((movement) => movement.id);
}

export function getStretchingIdsForTarget(targetId) {
  const muscleIds = contentMuscleIdsByTargetId[targetId] ?? [];
  return uniqueIds(
    stretchingMovements
      .filter((movement) => movement.muscleIds.some((id) => muscleIds.includes(id)))
      .map((movement) => movement.id),
  );
}

