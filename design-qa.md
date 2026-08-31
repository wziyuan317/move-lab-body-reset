# Design QA

## 比较对象

- Source visual truth：`/Users/bevol-1/.codex/generated_images/01a056d7-c4ca-72c1-91b7-e924a2a8ccfe/exec-f5441def-e212-4977-b456-8a08cca7bac6.png`
- Implementation URL：`http://127.0.0.1:4173/`
- Desktop screenshot：`qa/desktop-expanded-1440.png`
- Mobile screenshot：`qa/mobile-expanded-390.png`
- Full-view comparison：`qa/expanded-style-comparison.png`
- Focused comparison：`qa/focused-style-comparison.png`
- Correction evidence：`qa/corrected-seated-fold.png`、`qa/corrected-supported-hinge.png`
- Thumbnail optimization evidence：`qa/thumbnail-optimized-desktop.png`、`qa/thumbnail-before-after.png`
- State：全部动作，共 15 个；桌面显示动作库首页，修正图分别显示“到位状态”。

## 视口与像素归一化

- Source：`1254 × 1254 px`，方形动作插画，在比较板中等比缩放。
- Desktop CSS viewport：`1440 × 1000`，页面 `scrollWidth = 1440`，无文档级水平溢出。
- Mobile CSS viewport：`390 × 844`，页面 `scrollWidth = 390`，无文档级水平溢出。
- Focused comparison：左侧源风格图等比缩放到 `620 px` 高，右侧从桌面实现截取动作视觉面板，同高并排。

## Full-view comparison evidence

- 整体层级：固定部位侧栏、动作列表、动作详情形成明确的三级阅读路径。
- 色彩：深蓝、高亮黄、珊瑚红和运动蓝组成高对比多巴胺运动色板，没有使用品牌 IP 资产。
- 图片：动作人物的深蓝描边、红色肌群强调、蓝色方向箭头与黄色稳定提示与源视觉一致。
- 文字：标题、原理、步骤、好处与停止条件层级清晰，应用文案可独立理解。

## Focused region comparison evidence

- 动作图不包含教学段落文字，只保留人物、肌群区域、动作方向与稳定提示，符合源风格。
- 起始 / 到位切换紧贴动作图上方，数字顺序和高亮状态清晰；大幅度动作可先学会摆位，再对照到位标准。
- 图片在纯白舞台中使用 `object-fit: contain`，人物没有被裁切、拉伸或被交互控件遮挡。
- “坐姿抱腿”到位图双臂绕到大腿下方，没有向下抓小腿或脚踝。
- “椅背髋折叠”到位图中人物与椅面分处椅背两侧，躯干接近水平，椅子朝向与动作文字一致。
- 椅背胸椎伸展使用固定四脚椅，不含滚轮或旋转底座。

## Findings

- 当前没有可执行的 P0 / P1 / P2 问题。
- [P3] 源风格图带透明背景棋盘预览，网页中统一放在纯白舞台内。这是为了减少棋盘格对动作轮廓的干扰，属于可接受的产品化处理。

## Comparison history

1. 首次桌面验收发现 P2：`1280 px` 宽度时，动作详情双列的最小宽度造成页面水平溢出。
   - Fix：将详情双列转单列的响应式断点由 `1260 px` 调整为 `1400 px`。
   - Post-fix evidence：`1440 × 1000` 桌面截图无隐藏控件；中等宽度下详情自动变为单列。
2. 首次移动验收发现 P2：`390 px` 视口时，横向动作列表的最小内容宽度将文档撑到 `464 px`。
   - Fix：为 workspace 和 movement list 加入 `min-width: 0`，并限制横向列表为容器 `100%`，溢出只在列表内滚动。
   - Post-fix evidence：`390 px` 视口下文档宽度 `375 px`，没有页面级水平溢出，分类和动作卡片可横向滚动。
3. 本轮扩展侧栏至 10 个分类后发现低高度视口可能压缩安全提示区。
   - Fix：侧栏增加纵向滚动，缩短分类间距与按钮高度，保留触控尺寸和底部停止提示。
   - Post-fix evidence：`1440 × 1000` 桌面视口中 10 个分类和安全提示完整可见。
4. 新增“椅背胸椎伸展”首张到位图误用了带滚轮椅。
   - Fix：重新生成固定四脚椅版本，并替换为安全、稳定的支撑示意。
   - Post-fix evidence：动作起始与到位图均为固定四脚椅，无滚轮。
5. 长时间切换动作时存在旧图停留风险，初始页面用 15 张高清原图承担 `66 × 66 px` 列表缩略图。
   - Fix：保留全部高清详情图，新增 15 张最大边 `240 px` 的无损 PNG 缩略图；列表延迟加载、异步解码，详情图按动作与阶段重新挂载。
   - Post-fix evidence：初始解码像素从 `25,160,103` 降到 `2,427,876`，下降约 `90.3%`；详情图仍为 `1254 × 1254 px`，前后对照未见内容或视觉层级变化。

## 交互与运行验收

- 搜索“膝盖”返回 3 个动作：坐姿伸膝、扶桌浅蹲、扶桌提踵。
- 部位筛选“肩胛”返回 2 个动作：肩胛收紧、墙面推撑。
- 无匹配搜索正确显示空状态，可一键清除。
- 墙面俯卧撑从 `wall-pushup-start.png` 切换到 `wall-pushup.png`，图片路径发生预期变化。
- 页面当前加载的所有图片 `naturalWidth > 0`。
- 浏览器 Console：0 个 error，0 个 warning。
- 焦点指示、语义化按钮、搜索标签、`aria-pressed` 和 `prefers-reduced-motion` 已检查。

## Implementation Checklist

- [x] 搜索、部位筛选、动作选择、空状态可用。
- [x] 大幅度动作提供起始 / 到位双状态。
- [x] 肩胛与膝盖办公室动作可按分类和关键词检索。
- [x] 用户指出的抱腿手位与椅子朝向已在图像和文字中同步修正。
- [x] 列表使用独立无损缩略图，详情页继续展示原始高清图，没有删减内容。
- [x] 桌面、中等宽度与移动端无页面级水平溢出。
- [x] 所有动作图已加载，没有占位图或代码绘制的替代资产。
- [x] 字体、间距、色彩 token、图片质量、图标一致性与应用文案均已通过对照。

final result: passed
