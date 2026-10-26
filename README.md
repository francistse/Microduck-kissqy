**简体中文** | [English](README.en.md)

<div align="center">

# 🦆 Microduck 飞特 HD1910 复刻 · 中文中控、强化学习训练与自制硬件

基于 Pollen Robotics Microduck、已完成实机复刻的个人项目，提供 **Radxa ZERO 3W 系统镜像、飞特 HD1910 适配固件、中文机器人中控与训练中控、自制 HAT / IMU，以及全套 3D 打印件**。面向想在国内复刻、运行或训练 Microduck 双足机器鸭的朋友。

**稳定公开版：机器人中控 R17 V167 / 固件 control.43 / 训练中控 R1.5.27**

[🚀 从零复刻教程](docs/MICRODUCK-BUILD-GUIDE.md) · [📥 下载](#下载与版本) · [❓ 常见问题](docs/MICRODUCK-FAQ.md) · [🌐 在线教程](https://kissqy.github.io/Microduck-kissqy/guides/)

<table align="center">
  <tr>
    <td align="center" valign="top">
      <b>💬 加群交流</b><br><br>
      <a href="docs/assets/community-wechat-qr.png"><img width="220" alt="微信交流群二维码" src="docs/assets/community-wechat-qr.png" /></a><br>
      <sub>2026 年 11 月 1 日前有效 · 点击查看原图</sub>
    </td>
  </tr>
</table>

## 🎬 看看鸭鸭的真实表现（7 段视频）

<table>
<tr>
      <td width="10%"><video src="https://github.com/user-attachments/assets/0ec5b46b-1ec0-483a-a95d-3b3f307e155f" controls></video></td>
   <td width="10%"><video src="https://github.com/user-attachments/assets/71fc2c95-8499-49f6-924b-837df42814cf" controls></video></td>
  <td width="10%"><video src="https://github.com/user-attachments/assets/d09a6bfe-7a28-4266-ba90-de2b331472ad" controls></video></td>
  <td width="10%"><video src="https://github.com/user-attachments/assets/a604c0e0-af01-413f-ab00-99ccd26db8d5" controls></video></td>
  <td width="10%"><video src="https://github.com/user-attachments/assets/4508d91c-e91c-40f4-8c3e-5ca5a3f959c3" controls></video></td>
  <td width="10%"><video src="https://github.com/user-attachments/assets/fd0dfafd-dd02-4852-940c-33706c287e9d" controls></video></td>
  <td width="10%"><video src="https://github.com/user-attachments/assets/693a3272-d814-42f6-86b3-be5cb3b35b0f" controls></video></td>
</tr>
</table>

<sub>以上为实机视频；下方中控在线演示使用模拟数据，不连接实机或真正训练。</sub>


</div>

## 🧭 从你要做的事情开始

| 你的目标 | 直接入口 |
| --- | --- |
| 想自己做一只 Microduck 飞特版 | [从采购到第一次行走](docs/MICRODUCK-BUILD-GUIDE.md) · [材料与预算](DUCK-SHOPPING-LIST.md) |
| 已经装好，准备刷机、标定和操作 | [V167 使用指南](microduck-hd1910/firmware/console/README.zh-CN.md) |
| 想训练行走、起身或自己的动作 | [训练中控 R1.5.27](microduck-hd1910/training-console/README.zh-CN.md) |
| 想制作 HAT 或独立 IMU | [硬件工程、制作记录和烧录入口](hardware/README.md) |
| 遇到断网、重启、IMU 或标定问题 | [常见问题与排查入口](docs/MICRODUCK-FAQ.md) |

## ✨ 不用从零配置一堆软件

这是一只会**走路、坐下、捡东西、踢球、前滚翻**的小鸭。装上滑轮，还能探索**对称滑行、蹲下、原地转和倒地起身**等动作。实体手柄就能控制，不必为了每个动作打开电脑点按钮；想训练自己的动作，还有独立训练中控。

**系统镜像 R1 已通过刷卡实测**，预装官方系统、本项目机器人服务和运动模型。刷入 Radxa ZERO 3W、连接 Wi-Fi 后即可打开中文中控，无须自行编译固件。

## 🚀 三步开始

1. **刷镜像** — 将下载区的系统镜像 `.img.xz` 用 [Armbian Imager](https://imager.armbian.com/) 选择「自定义镜像」，选好 TF 卡后刷写。**无需手动解压**，刷机工具会自动解压写入。
2. **连网络** — Zero 首次启动后连接 `Microduck-kissqy` 热点（密码 `12345678`），按照提示设置家庭 Wi-Fi 和新的系统登录密码；若手机没有自动弹出网页，就访问 `http://10.42.0.1:8088`。
3. **开中控** — 完整解压机器人中控 ZIP，运行 `start.cmd` 连接鸭鸭；核对标定并完成 HOME 后再启用运动。需要自行训练时，解压训练中控并运行 `start-training.cmd`。

> 🛠️ **首次装配或更换舵机，需先核对关节零位、方向、限位与 IMU，再启用运动。** 样机标定不能替代本机标定。

<div align="center">
  <img src="docs/assets/wifi-setup-desktop.webp" width="760" alt="Microduck 首次开机热点配网页面，带真实鸭鸭与开源入口" />
  <p><sub>首次热点配网页面</sub></p>
</div>

## 下载与版本

| 文件 | 用途 | 下载 |
| --- | --- | --- |
| **系统镜像 R1** · 官方 0.15.1 / control.40 | ZERO 3W 首次刷卡，预装服务与模型 | [⬇️ .img.xz](https://github.com/kissqy/Microduck-kissqy/releases/download/public-image-r1/microduck-zero3w-0.15.1-R1.img.xz) |
| **机器人中控 R17 V167** | 操作鸭子，内含 control.43 固件 | [⬇️ ZIP](https://github.com/kissqy/Microduck-kissqy/raw/refs/heads/main/release-assets/Microduck-Console-R17-V167.zip) |
| **训练中控 R1.5.27** | 训练、仿真与模型导出 | [⬇️ ZIP](https://github.com/kissqy/Microduck-kissqy/raw/refs/heads/main/release-assets/Microduck-Training-Studio-R1.5.27.zip) |
| **飞特 HD1910 已编译固件 control.43** | ZERO 服务升级，ARM64 安装包 | [⬇️ .tar.gz](https://github.com/kissqy/Microduck-kissqy/raw/refs/heads/main/microduck-hd1910/firmware/console/updates/Microduck-Robotd-FT6-R17.tar.gz) |
| **IMU 固件 FT6（STM32）** | 自制 IMU 板单独烧录 | [⬇️ .bin](https://github.com/kissqy/Microduck-kissqy/raw/refs/heads/main/microduck-hd1910/firmware/console/updates/imu_to_feetech_ReVA_FT6_SYNC15_UART_IRQ_v1.bin) · [烧录指南](hardware/IMU-FIRMWARE.md) |
| **鸭子全套打印件 · 缝合怪版** | STL 与 5 盘参考摆盘，两种电池仓 | [⬇️ RAR](https://github.com/kissqy/Microduck-kissqy/raw/refs/heads/main/hardware/3d-print-frankenduck/Microduck-Print-FrankenDuck-20261015.rar) · [使用说明](hardware/3d-print-frankenduck/) |

**首次制作下载「系统镜像＋机器人中控」；训练中控按需下载。** 镜像 R1 预装 control.40，在 V167 中控安装随包固件即可升级 control.43，独立固件与随包版本一致。**新制作的 IMU 板需单独烧录 FT6 `.bin`。**

[独立固件安装与校验](release-assets/README.md) · [镜像发布说明](docs/releases/public-image-r1.md)

源码入口：[固件](microduck-hd1910/firmware/) · [机器人中控](microduck-hd1910/firmware/console/) · [训练中控](microduck-hd1910/training-console/) · [编译说明](microduck-hd1910/docs/BUILD.md)。

## 🎮 两个中控，各做各的事

| 🐣 机器人中控 · R17 V167 · [在线演示](https://kissqy.github.io/Microduck-kissqy/) | 🧠 训练中控 · R1.5.27 · [在线演示](https://kissqy.github.io/Microduck-kissqy/training/) |
| --- | --- |
| 实时 3D 姿态、摄像头、关节/IMU 数据、舵机标定 | 独立训练任务、配方选择、训练队列、进度与奖励曲线 |
| 实体手柄直接操控、固件维护、模型状态 | 可视化仿真、模型评估、ONNX 导出 |
| 不用自己编译 Zero 服务 | 需要具备训练环境的电脑；不要求 Zero 才能运行界面 |

**V167 提供 10 份运动模型（6 个常规＋4 个滑轮）**，由控制服务执行，无需手编舵机动作。滑轮和起身效果受装配、标定与训练影响，需实机验证。


## 🖨️ 鸭子全套打印件 · 缝合怪版

结合多位社区制作者的优化与作者实机使用中的改动，包含全套 STL 和参考摆盘。**脚部套件装滑轮不用拆舵机**；电池仓提供夹 HUB 板版与官方式加厚卡扣版，IMU 安装位配套本仓库 IMU。

[打印文件、摆盘预览与两种电池仓说明](hardware/3d-print-frankenduck/)

## 🔧 HAT 与 IMU 自制记录

HAT 与独立躯干 IMU 已在作者实机上长期使用，提供工程和制作记录，可选择自己制作或[购买作者同款成品板](https://item.taobao.com/item.htm?id=1095121548583)。手焊、成品板及工具预算见[采购清单](DUCK-SHOPPING-LIST.md)。

🎬 **[IMU 手工制作全过程 · Bilibili](https://www.bilibili.com/video/BV1qapz6PERs/)**

**硬件提供两种接口版本：原版 EH2.5 与 AMP2.0 版并存。** AMP2.0 版 HAT 的喇叭、麦克风改用 HP1.25，并新增绿色 LED 和 1kΩ 电阻。[查看两版工程](hardware/) · [AMP2.0 版说明与用料](hardware/AMP2.0-VERSION.md)

[IMU 固件下载与烧录](hardware/IMU-FIRMWARE.md) · [HAT 制作时间线](hardware/HAT-TIMELINE.md) · [IMU 制作时间线](hardware/IMU-TIMELINE.md) · [🔧 PCB采购表（HAT／IMU）](hardware/README.md#采购清单)

## ❤️ 分享给大家，也尊重原创

这是基于 [Pollen Robotics 官方 Microduck](https://github.com/pollen-robotics/microduck) `0.15.1` 的**个人开发项目，并非官方发布**。除标明的官方及第三方内容外，新增固件适配、中控、工具、文档和作者自训成果，均为作者原创，使用 AI 辅助编程。

**作者有权授权的原创部分仅供个人学习、研究与非商业使用；商业使用需先取得书面授权。** 官方 Apache-2.0、第三方 MIT、官方几何模型等保留各自许可，个人条款不覆盖第三方权利。

完整范围：[分项许可](microduck-hd1910/LICENSE) · [个人非商业许可](microduck-hd1910/LICENSES/Personal-NonCommercial.txt) · [第三方说明](microduck-hd1910/docs/THIRD-PARTY.md)

希望这些资料帮你少走弯路，让自己的小鸭动起来。欢迎 Star ⭐、交流和反馈。[作者的学习记录](docs/AUTHOR-JOURNEY.md)

<table align="center">
  <tr>
    <td align="center" valign="top" width="50%">
      <b>❤️ 支持作者</b><br><br>
      <img width="180" alt="支持作者的二维码" src="https://github.com/user-attachments/assets/49054608-65ba-41d6-b3f1-a97941976c4b" />
    </td>
    <td align="center" valign="top" width="50%">
      <b>💬 联系作者</b><br><br>
      <a href="docs/assets/purchase-wechat-qr.jpg"><img width="220" alt="联系作者微信二维码" src="docs/assets/purchase-wechat-qr.jpg" /></a><br>
      <sub>微信扫码联系作者。<br>点击二维码查看原图。</sub>
    </td>
  </tr>
</table>
