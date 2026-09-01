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

- 原始解剖资产：Z-Anatomy
- 浏览器优化版本：hpfrei/body-anatomy-3d-viewer
- 来源：https://github.com/hpfrei/body-anatomy-3d-viewer
- 许可证：CC BY-SA 4.0
- 用途：仅显示当前区域相关且元数据 `type` 为 `muscle` 的网格，用于教育性位置标记，不作为诊断。

本项目对 Z-Anatomy 衍生模型的再分发继续采用 CC BY-SA 4.0。
