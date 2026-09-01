# 3D 模型来源与许可证

## `move-lab-clothed.glb`

- 原始资产：Quaternius, “Ultimate Modular Men Pack”；包内 `License.txt` 的标题为 “Ultimate Modular Males by @Quaternius”。
- 官方来源：https://quaternius.com/packs/ultimatemodularcharacters.html
- 官方下载目录：https://drive.google.com/drive/folders/1USAAquX2JJWuA2m6zol0KUkFe3UkZ8zX
- 下载与核验日期：2026-09-01。
- 包版本：February 2022；原始文件：`Individual Characters/glTF/Beach.gltf`（3,166,143 bytes，SHA-256 `76e001ea131fd76a1bd938a7862606cb8037f7049b632783580b9bf4da2371a8`）。
- 包内许可证据：来源包根目录 `License.txt`（372 bytes）已逐字节保存为 `QUATERNIUS-ULTIMATE-MODULAR-MEN-LICENSE.txt`，SHA-256 `e8dbf915a2b82229913e301a0787696611241bdefec4832bc084f54161db1efe`；原文明确写有 `CC0 1.0 Universal (CC0 1.0)` 与 `Public Domain Dedication`，并指向 https://creativecommons.org/publicdomain/zero/1.0/。
- 许可状态：`VERIFIED_PACKAGE_CC0`；依据是本次下载包自带的 `License.txt`，不是官网总许可或二手页面。
- 模型选择：`Beach.gltf` 保留 `CharacterArmature` Humanoid 骨架，左右上臂骨骼为 `UpperArm.L` / `UpperArm.R`；`LightBrown` / `White` 服装材质运行时设为白色，`Red_Dark` 下装材质设为深蓝色。
- 转制：仅将原始嵌入式 glTF JSON/BIN 重打包为单一 GLB，不改动网格、骨骼或动画；仓库文件 SHA-256 为 `42f8fb8c20ccddc63a1ce42976f8ec484e8eedcc8ac7cf93fa57776a8c153f69`。
- 用途：着装人体的大区域定位与空间参照。

## `move-lab-muscles.glb`

- 原始解剖资产：Z-Anatomy（https://github.com/Z-Anatomy/Models-of-human-anatomy）。
- 浏览器优化衍生版本：hpfrei/body-anatomy-3d-viewer 的 `public/body.glb`（https://github.com/hpfrei/body-anatomy-3d-viewer）。
- 下载与核验日期：2026-09-01。
- 原始 / 衍生状态：当前仓库文件是 hpfrei 浏览器优化衍生 GLB 的逐字节副本，仅重命名为 `move-lab-muscles.glb`；未再修改网格或二进制内容。
- 上游 `public/body.glb` 与仓库文件均为 8,249,484 bytes，SHA-256 `0886b6a068e655b284903664e2178d7964f80b1c0ce798461909ac806bcef2e3`。
- hpfrei 官方许可证原文已保存为 `HPFREI-BODY-ANATOMY-3D-VIEWER-LICENSE.txt`，SHA-256 `8dddf9ce9d2004fd6bb13f1f5f0985f673d46bbb49fed4b83092bbd402a837bf`，明确为 CC BY-SA 4.0。
- Z-Anatomy 官方许可证原文已保存为 `Z-ANATOMY-LICENSE.txt`（仅规范行尾空格并补文件末换行），SHA-256 `9d84c0eeff7a1a22027a3f2edd24b02a4cab76bf6b5038f29cfc35eff49a0209`；下载原始字节 SHA-256 为 `196b66b56551a862e59872f7cdb70e6d9a6ad84e9105962fca8ec28c14e97520`。主许可为 CC BY-SA 4.0，并保留其中列出的第三方来源与附加许可提示。
- 许可状态：`VERIFIED_UPSTREAM_CC_BY_SA_4_0_WITH_ATTRIBUTION_NOTICE`。该专业解剖资产与上面的 Quaternius 着装角色是两个独立来源，不属于该角色的公有领域资产。
- 用途：仅显示当前区域相关且元数据 `type` 为 `muscle` 的网格，用于教育性位置标记，不作为诊断。

本项目对 Z-Anatomy 衍生模型的再分发继续采用 CC BY-SA 4.0。
