# 3D 模型来源与许可证

## `move-lab-clothed.glb`

- 当前生产角色：用户提供的 “Man Player”，原始文件名 `man_player.glb`，接收与核验日期为 2026-09-01。
- 作者：RiverofCreative（https://sketchfab.com/RiverofCreative）。
- 原始来源：https://sketchfab.com/3d-models/man-player-4c7133dbb06e4136891d59231372d818 。
- 许可：模型 GLB 的 `asset.extras.license` 明确记录 `CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)`，即 CC BY 4.0；本仓库保留作者、来源、许可链接及未修改声明。
- 署名与许可证据：`MAN-PLAYER-ATTRIBUTION.txt`，SHA-256 `b6380dc11dda740c96e5ab639a36be9ce5b9f572970cb5426c967df58cf789e4`。
- 原始文件与仓库文件均为 12,123,012 bytes，逐字节相同；SHA-256 为 `bb0e9f1ed0147b988d93b7dc6564b480efb05085c3bb78d2d74e7b01cff0d78b`。除重命名为应用固定资产路径 `move-lab-clothed.glb` 外，没有改动模型字节。
- 模型结构：骨架根节点 `CC_Base_BoneRoot_01`，左右上臂节点 `CC_Base_L_Upperarm_050` / `CC_Base_R_Upperarm_074`；包含 17 个 mesh / primitive、1 个 skin、20 个 animation、17 个 material 与 47 张 texture。
- 用途：着装人体的大区域定位与空间参照。

### 历史角色审计记录

此前生产角色来自 Quaternius “Ultimate Modular Men Pack”（February 2022）的 `Individual Characters/glTF/Beach.gltf`，已于 2026-09-01 被用户提供的 Man Player 替换，不再对应 `move-lab-clothed.glb` 当前字节。为保留历史审计链，来源包根目录 `License.txt` 仍逐字节保存为 `QUATERNIUS-ULTIMATE-MODULAR-MEN-LICENSE.txt`（372 bytes，SHA-256 `e8dbf915a2b82229913e301a0787696611241bdefec4832bc084f54161db1efe`）；其 `VERIFIED_PACKAGE_CC0` 状态仅适用于已替换的 Quaternius 历史角色，不适用于当前 Man Player。

## `move-lab-muscles.glb`

- 原始解剖资产：Z-Anatomy（https://github.com/Z-Anatomy/Models-of-human-anatomy）。
- 浏览器优化衍生版本：hpfrei/body-anatomy-3d-viewer 的 `public/body.glb`（https://github.com/hpfrei/body-anatomy-3d-viewer）。
- 下载与核验日期：2026-09-01。
- 原始 / 衍生状态：当前仓库文件是 hpfrei 浏览器优化衍生 GLB 的逐字节副本，仅重命名为 `move-lab-muscles.glb`；未再修改网格或二进制内容。
- 上游 `public/body.glb` 与仓库文件均为 8,249,484 bytes，SHA-256 `0886b6a068e655b284903664e2178d7964f80b1c0ce798461909ac806bcef2e3`。
- hpfrei 官方许可证原文已保存为 `HPFREI-BODY-ANATOMY-3D-VIEWER-LICENSE.txt`，SHA-256 `8dddf9ce9d2004fd6bb13f1f5f0985f673d46bbb49fed4b83092bbd402a837bf`，明确为 CC BY-SA 4.0。
- Z-Anatomy 官方许可证原文已保存为 `Z-ANATOMY-LICENSE.txt`（仅规范行尾空格并补文件末换行），SHA-256 `9d84c0eeff7a1a22027a3f2edd24b02a4cab76bf6b5038f29cfc35eff49a0209`；下载原始字节 SHA-256 为 `196b66b56551a862e59872f7cdb70e6d9a6ad84e9105962fca8ec28c14e97520`。主许可为 CC BY-SA 4.0，并保留其中列出的第三方来源与附加许可提示。
- 许可状态：`VERIFIED_UPSTREAM_CC_BY_SA_4_0_WITH_ATTRIBUTION_NOTICE`。该专业解剖资产与上面的 Quaternius 着装角色是两个独立来源，不属于该角色的公有领域资产。
- 用途：仅作为 pre-existing 本地审计素材，用于核对历史实现和上游许可证据；生产 UI 不加载或引用该文件。
- 发布政策：完整 `body.glb` 目前无法排除包含不允许商业分发的 NC mesh。在逐网格来源和授权未全部核验前，Sites、GitHub Pages 与普通 Vite build 都禁止分发 `move-lab-muscles.glb`；构建配置会从产物中明确排除它，自动检查同时阻止运行时 URL 回归。

该 legacy 文件在仓库中保留原字节与 CC BY-SA 4.0 证据，但不属于可发布 runtime，也不属于 Quaternius CC0 角色素材。
