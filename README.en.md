[简体中文](README.md) | **English**

<div align="center">

# 🦆 Microduck Feetech HD1910 Replica · Build, control and reinforcement learning

A personal project with a working physical replica based on Pollen Robotics Microduck, providing a **Radxa ZERO 3W system image, Feetech HD1910 firmware, Chinese-language robot and training consoles, DIY HAT / IMU boards and complete 3D printing files** for building, running and training a bipedal robot duck.

**Stable public release: Robot Console R17 V167 / Firmware control.43 / Training Studio R1.5.27**

[🚀 Complete build guide](docs/MICRODUCK-BUILD-GUIDE.en.md) · [📥 Downloads](#downloads-and-versions) · [❓ FAQ](docs/MICRODUCK-FAQ.en.md) · [🌐 Online guides](https://kissqy.github.io/Microduck-kissqy/guides/en.html)

<table align="center">
  <tr>
    <td align="center" valign="top">
      <b>💬 Join the WeChat group</b><br><br>
      <a href="docs/assets/community-wechat-qr.png"><img width="220" alt="WeChat community group QR code" src="docs/assets/community-wechat-qr.png" /></a><br>
      <sub>Scan in WeChat, or click the QR code for the original image.<br>This QR code is valid before November 1, 2026.</sub>
    </td>
  </tr>
</table>

## 🎬 See the duck in action — 7 real-robot videos

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

<sub>These clips show the real robot. The console demos below use simulated data; they cannot connect to a robot or run training.</sub>


</div>

## 🧭 Start with your goal

| Your goal | Go here |
| --- | --- |
| Build a Microduck with Feetech servos | [Parts to first walking](docs/MICRODUCK-BUILD-GUIDE.en.md) · [Parts and budget](DUCK-SHOPPING-LIST.en.md) |
| Flash, calibrate and operate an assembled duck | [V167 user guide](microduck-hd1910/firmware/console/USER-GUIDE.en.md) |
| Train walking, recovery or your own movements | [Training Studio R1.5.27](microduck-hd1910/training-console/USER-GUIDE.en.md) |
| Build HAT and a separate IMU | [PCB projects, build records and flashing](hardware/README.en.md) |
| Troubleshoot network, reboot, IMU or calibration | [FAQ and troubleshooting links](docs/MICRODUCK-FAQ.en.md) |

## ✨ Skip the software setup from scratch

This little duck can **walk, sit, pick things up, kick a ball, and roll forward**. Add rollers to explore **swizzling, crouching, spinning, and standing up after a fall**. Use a physical gamepad to control it; an independent Training Studio is available when you want to train your own movements.

**System Image R1 has passed a fresh-card installation test.** It includes the official system, this project's robot services and motion models. Flash it onto a Radxa ZERO 3W, connect to Wi-Fi, and open the console without compiling firmware from source.

## 🚀 Start in three steps

1. **Flash the image** — Use the `.img.xz` from the Downloads table. In [Armbian Imager](https://imager.armbian.com/), select a custom image and your microSD card, then flash it. **Manual decompression is unnecessary:** the imager decompresses it while writing.
2. **Connect to Wi-Fi** — On first boot, join the `Microduck-kissqy` hotspot with password `12345678`. Follow the setup page to enter your home Wi-Fi and set a new system login password. If the page does not open automatically, visit `http://10.42.0.1:8088`.
3. **Open the console** — Extract the complete Robot Console ZIP and run `start.cmd`. Connect to the duck, check its calibration, and complete HOME before enabling movement. For training, extract Training Studio and run `start-training.cmd`.

> 🛠️ **Preinstalled software still requires calibration for your assembly.** After assembly or servo replacement, verify every joint's zero position, direction, limits, and the IMU before enabling movement. Do not copy the reference duck's calibration blindly.

<div align="center">
  <img src="docs/assets/wifi-setup-desktop.webp" width="760" alt="Microduck first-boot hotspot and Wi-Fi setup page" />
  <p><sub>First-boot Wi-Fi setup preview. The actual screen is the one shipped with Public Image R1.</sub></p>
</div>

## Downloads and versions

| Package | Purpose | Download |
| --- | --- | --- |
| **System Image R1** · Official 0.15.1 / control.40 | Fresh ZERO 3W installation; robot services and movement models preinstalled | [⬇️ .img.xz](https://github.com/kissqy/Microduck-kissqy/releases/download/public-image-r1/microduck-zero3w-0.15.1-R1.img.xz) |
| **Robot Console R17 V167** | Connect to and operate the duck from your computer; includes the matching firmware payload | [⬇️ ZIP](https://github.com/kissqy/Microduck-kissqy/raw/refs/heads/main/release-assets/Microduck-Console-R17-V167.zip) |
| **Training Studio R1.5.27** | Train, evaluate, and export your own models | [⬇️ ZIP](https://github.com/kissqy/Microduck-kissqy/raw/refs/heads/main/release-assets/Microduck-Training-Studio-R1.5.27.zip) |
| **Compiled Feetech HD1910 firmware control.43** | Upgrade ZERO-side services on an existing system; ARM64 installation package | [⬇️ .tar.gz](https://github.com/kissqy/Microduck-kissqy/raw/refs/heads/main/microduck-hd1910/firmware/console/updates/Microduck-Robotd-FT6-R17.tar.gz) |
| **IMU firmware FT6 (STM32)** | Flash a newly built torso IMU separately; 8.2 KiB, Feetech HD1910 setup | [⬇️ .bin](https://github.com/kissqy/Microduck-kissqy/raw/refs/heads/main/microduck-hd1910/firmware/console/updates/imu_to_feetech_ReVA_FT6_SYNC15_UART_IRQ_v1.bin) · [Flashing guide](hardware/IMU-FIRMWARE.en.md) |
| **Complete printing set · FrankenDuck** | 36 STL files, 5-plate 3MF project, two battery-holder variants | [⬇️ RAR](https://github.com/kissqy/Microduck-kissqy/raw/refs/heads/main/hardware/3d-print-frankenduck/Microduck-Print-FrankenDuck-20261015.rar) · [Guide](hardware/3d-print-frankenduck/README.en.md) |

**For a first build, download the system image and Robot Console; Training Studio is optional.** Image R1 includes control.40. Install V167's bundled firmware to upgrade to control.43; the standalone package is the same version. **Flash a newly built IMU separately with the FT6 `.bin`.**

[Standalone firmware installation and checksums](release-assets/README.en.md) · [Image release guide](docs/releases/public-image-r1.en.md)

Source: [firmware](microduck-hd1910/firmware/README.en.md) · [Robot Console](microduck-hd1910/firmware/console/README.en.md) · [Training Studio](microduck-hd1910/training-console/README.en.md) · [build guide](microduck-hd1910/docs/BUILD.en.md).

## 🎮 Two consoles, two jobs

| 🐣 Robot Console · R17 V167 · [Demo](https://kissqy.github.io/Microduck-kissqy/) | 🧠 Training Studio · R1.5.27 · [Demo](https://kissqy.github.io/Microduck-kissqy/training/) |
| --- | --- |
| Live 3D pose, camera, joint / IMU data, servo calibration | Training tasks, recipes, queue, progress and reward curves |
| Physical gamepad control, firmware maintenance, model status | Visual simulation, policy evaluation, ONNX export |
| No need to compile the ZERO services yourself | Requires a computer with a training environment; the interface itself does not require a ZERO |

**V167 includes 10 movement models: 6 regular models and 4 roller models.** The control service executes the models; you do not have to hand-script servo movements. Roller movements and recovery depend on assembly, calibration, and training and still need careful real-robot evaluation.

The released interfaces are Chinese. English guides above retain the original button labels where needed; see also the [source and build guides](microduck-hd1910/README.en.md).

## 🖨️ Complete printing set · FrankenDuck

This set combines community improvements with the author's real-robot modifications, including STL files and a reference plate project. **Install rollers without removing the servos.** Choose a HUB-clamping battery holder or the official-style holder with thicker latches; both IMU mounts fit this repository's IMU. Rollers use **623ZZ (3×10×4 mm)** bearings.

[Printing files, plate previews, and battery holders](hardware/3d-print-frankenduck/README.en.md) · [623ZZ purchasing](DUCK-SHOPPING-LIST.en.md#optional-roller-bearings)

## 🔧 DIY HAT and IMU

The HAT and independent torso IMU have been used extensively on the author's robot. PCB projects and build records are available: build them yourself or [buy assembled boards from the author](https://item.taobao.com/item.htm?id=1095121548583). See the [shopping guide](DUCK-SHOPPING-LIST.en.md) for DIY, assembled-board and tool budgets.

🎬 **[Watch the complete IMU build · Bilibili](https://www.bilibili.com/video/BV1qapz6PERs/)**

**Two connector versions are available: original EH2.5 and AMP2.0.** The AMP2.0 HAT uses HP1.25 speaker / microphone sockets and adds a green LED plus a 1kΩ resistor. [Both project versions](hardware/README.en.md) · [AMP2.0 guide and parts](hardware/AMP2.0-VERSION.en.md)

[IMU firmware download and flashing](hardware/IMU-FIRMWARE.en.md) · [HAT build timeline](hardware/HAT-TIMELINE.en.md) · [IMU build timeline](hardware/IMU-TIMELINE.en.md) · [Hardware projects and notes](hardware/README.en.md) · [🔧 PCB shopping list (HAT / IMU)](hardware/README.en.md#shopping-list)

## ❤️ Sharing the project and crediting its creators

This is a **personal learning and development project** based on [Pollen Robotics' official Microduck](https://github.com/pollen-robotics/microduck) `0.15.1`, rather than an official release. **Except for explicitly identified upstream and third-party code, models, and assets, the additional firmware adaptations, consoles, tools, documentation, and the author's trained results were developed by this project's author, with AI-assisted programming.**

**Original work that the author owns and can license is provided for personal learning, research, and noncommercial use only. Obtain the author's written permission before commercial use**, including commercial products, paid services, or distribution with robots sold commercially. Upstream Apache-2.0 software, third-party MIT components, official geometry, and other assets retain their own licenses; personal terms do not override third-party rights.

Full scope: [Component licenses](microduck-hd1910/LICENSE) · [Personal noncommercial terms](microduck-hd1910/LICENSES/Personal-NonCommercial.txt) · [Third-party credits](microduck-hd1910/docs/THIRD-PARTY.en.md)

This project grew from one board, one duck, and many debugging sessions. I hope these files help you get your duck moving sooner. Stars ⭐, discussion and feedback are welcome. [The author's learning journey](docs/AUTHOR-JOURNEY.en.md)

<table align="center">
  <tr>
    <td align="center" valign="top" width="50%">
      <b>❤️ Support the author</b><br><br>
      <img width="180" alt="QR code to support the author" src="https://github.com/user-attachments/assets/49054608-65ba-41d6-b3f1-a97941976c4b" />
    </td>
    <td align="center" valign="top" width="50%">
      <b>💬 Contact the author</b><br><br>
      <a href="docs/assets/purchase-wechat-qr.jpg"><img width="220" alt="WeChat QR code to contact the author" src="docs/assets/purchase-wechat-qr.jpg" /></a><br>
      <sub>Scan in WeChat to contact the author.<br>Click the QR code for the original image.</sub>
    </td>
  </tr>
</table>
