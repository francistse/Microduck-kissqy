**简体中文** | [English](README.en.md)

<div align="center">

# 🦆 Microduck 飞特 HD1910 复刻

基于 [Pollen Robotics Microduck](https://github.com/pollen-robotics/microduck) 完成实机复刻，提供 **Radxa ZERO 3W 系统镜像、中文机器人中控、强化学习训练中控、自制 HAT／IMU 和全套 3D 打印件**。

**[🚀 从零复刻，从这里开始](docs/MICRODUCK-BUILD-GUIDE.md)**

<table align="center">
  <tr>
    <td align="center" valign="top">
      <b>💬 加群交流</b><br><br>
      <a href="docs/assets/community-wechat-qr.png"><img width="220" alt="微信交流群二维码" src="docs/assets/community-wechat-qr.png" /></a><br>
      <sub>2026 年 11 月 1 日前有效 · 点击查看原图</sub>
    </td>
  </tr>
</table>

## 🎬 实机视频

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

</div>

## 🧭 核心入口

| 你需要什么 | 直接入口 |
| --- | --- |
| 采购与预算 | [手焊／成品板、工具及打印机预算](DUCK-SHOPPING-LIST.md) |
| 全套打印件 | [缝合怪版模型与摆盘](hardware/3d-print-frankenduck/) |
| HAT／IMU 电路板 | [硬件工程与制作说明](hardware/README.md) · [购买成品板](https://item.taobao.com/item.htm?id=1095121548583) |
| 机器人操作与标定 | [使用指南](microduck-hd1910/firmware/console/README.zh-CN.md) · [在线演示](https://kissqy.github.io/Microduck-kissqy/) |
| 强化学习训练 | [训练指南](microduck-hd1910/training-console/README.zh-CN.md) · [在线演示](https://kissqy.github.io/Microduck-kissqy/training/) |
| 遇到问题 | [常见问题与排查](docs/MICRODUCK-FAQ.md) |
| 源码与文档 | [源码入口](microduck-hd1910/README.md) · [完整文档](docs/README.md) |

<sub>在线演示使用模拟数据，实际操作或训练需下载对应中控。</sub>

## 下载与版本

| 文件 | 用途 | 下载 |
| --- | --- | --- |
| **系统镜像 R1** | ZERO 3W 首次刷卡，预装 control.40 | [⬇️ .img.xz](https://github.com/kissqy/Microduck-kissqy/releases/download/public-image-r1/microduck-zero3w-0.15.1-R1.img.xz) |
| **机器人中控 R17 V167** | 操作鸭子，内含 control.43 固件 | [⬇️ ZIP](https://github.com/kissqy/Microduck-kissqy/raw/refs/heads/main/release-assets/Microduck-Console-R17-V167.zip) |
| **训练中控 R1.5.27** | 训练、仿真与模型导出 | [⬇️ ZIP](https://github.com/kissqy/Microduck-kissqy/raw/refs/heads/main/release-assets/Microduck-Training-Studio-R1.5.27.zip) |

首次制作下载**系统镜像＋机器人中控**，按[复刻教程](docs/MICRODUCK-BUILD-GUIDE.md)完成配网、安装随包固件和标定；训练中控按需下载。

**[ZERO 独立固件下载](release-assets/README.md) · [IMU FT6 固件下载与烧录](hardware/IMU-FIRMWARE.md)**

## 💬 联系与支持

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

作者原创部分仅供个人学习、研究及非商业使用，商业授权请联系作者；官方与第三方内容遵循各自许可证。[分项许可](microduck-hd1910/LICENSE) · [第三方说明](microduck-hd1910/docs/THIRD-PARTY.md)。
