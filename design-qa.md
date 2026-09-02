# MOVE LAB 改版 Design QA

## 比较目标与证据

- 视觉真源：`artifacts/design-qa/reference.jpg`，1487 × 1058 px。
- 最终桌面实现：`artifacts/design-qa/desktop-final.png`，1425 × 965 px；CSS 视口 1440 × 900，devicePixelRatio 1。
- 最终移动端首步：`artifacts/design-qa/mobile-final.png`，375 × 1380 px；CSS 视口 390 × 844，devicePixelRatio 1。
- 最终移动端感受步骤：`artifacts/design-qa/mobile-step2-final.png`，375 × 1850 px；CSS 视口 390 × 844，devicePixelRatio 1。
- 专业解剖聚焦状态：`artifacts/design-qa/professional-final.png`，1425 × 891 px。
- 办公室课程移动端：`artifacts/design-qa/office-player-mobile.png`，375 × 2976 px。
- 状态：膝部已选、尚待描述感受；真源右侧为摘要卡，产品实现按已确认需求替换为膝部 8 区精细定位工作台。
- 密度归一化：全部浏览器证据为 DPR 1；真源缺少 CSS 尺寸元数据，因此按完整页面比例、主区域占比和可读的局部区域进行比较，不把像素尺寸差异本身视为问题。

## 最终结果

当前无可执行的 P0、P1 或 P2 问题。

### 完整页面比较

- 信息架构：保留深蓝游戏运动背景、中央着装人物、左任务区、右定位区和底部彩色身体区域卡；新增办公室放松入口符合已确认功能扩展。
- 布局与节奏：三栏层级清楚，人物保持正中；右侧在较矮桌面视口内独立滚动，内容没有删除；移动端按步骤只展示当前任务区，无横向溢出。
- 字体：中文使用系统中文字体栈，标题、任务标签、辅助文字层级明确；底部卡片说明提升为 11 px，并使用深色文字阴影保持彩色背景上的可读性。
- 颜色：深蓝、黄色、红色、蓝色、绿色和紫色延续真源的游戏化多巴胺运动风格；警示红与主行动黄色语义分开。
- 图片质量：中央人物使用用户指定的 Man Player GLB；膝部局部图为清晰光栅图；区域卡使用统一 Phosphor 图标，不使用微型肌肉图或临时 CSS 图形。
- 文案：位置、感受、安全提示和建议均为动作教育表述，没有把不适位置写成诊断结论。

### 聚焦区域比较

- `professional-final.png`：正背完整人体保留轮廓参照；点击肌肉后启用“查看全身”，同一区域多映射时出现具体肌肉选择区，膝部 8 区与肌群可同时多选。
- `office-player-mobile.png`：动作图、动作步骤、强度、替代版本、停止条件、来源状态、倒计时和课程队列均可见，没有用缩短内容换取版面。
- `mobile-step2-final.png`：具体位置、感受、安全确认和建议按用户决策顺序排列；安全确认在建议之前。

## 比较历史

### 第 1 轮

- 证据：`artifacts/design-qa/desktop-initial.png` 与 `reference.jpg`。
- [P1] 品牌文字被通用 `span` 圆形样式包裹，形成两个重叠徽章。
- 修复：把圆形徽章规则限定到品牌第一个 `span`，恢复单徽章加 MOVE LAB 文字组合。
- 后验：`desktop-final.png` 中品牌、导航和顶部基线对齐。

### 第 2 轮

- 证据：`artifacts/design-qa/mobile-initial.png` 与移动端交互状态。
- [P2] 未选择区域时出现无信息的空白右侧卡片。
- [P1] 旧响应式 `grid-row` 规则把建议卡提前到安全确认之前。
- 修复：移动端隐藏未选择区域时的空工作台；在单工作台内重置建议卡的网格位置，恢复位置 → 感受 → 安全 → 建议顺序。
- 后验：`mobile-final.png` 不再显示空白卡；`mobile-step2-final.png` 中安全区 offsetTop 1187，小于建议区 1447。

### 第 3 轮

- 证据：`desktop-final.png`、`mobile-final.png`、`mobile-step2-final.png`。
- 字体、间距、颜色、图片、文案、图标、选中状态、移动端断点和滚动内容均无剩余 P0/P1/P2 问题。

## 功能与控制台检查

- 膝部 8 区可选；选择“膝盖正前方”与“酸紧 / 发僵”后进入建议状态，URL、任务摘要和教程推荐同步更新。
- 专业解剖模式可打开；点击 `quadriceps` 区域后触发局部聚焦并展示“股直肌远端 / 股内侧肌 / 股外侧肌”精确选择。
- 办公室课程可选择 5 分钟课程；计时器可在“暂停 / 继续”之间切换。
- 移动端步骤 2 隐藏 3D 人物并显示感受区；页面无横向溢出。
- 新建浏览器验收标签页控制台错误数：0。
- 自动化：95 个功能测试通过，Sites 4 个测试通过；生产构建和 GitHub Pages 构建通过。

## Follow-up Polish

- P3：可在后续原创动作图完成后替换统一的“原创动作图制作中”资产；当前状态已明确标注，不影响课程使用。

final result: passed
