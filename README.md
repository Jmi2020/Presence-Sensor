# 🚀 Occupant Presence Detection System

Enhance comfort, automate efficiency, and optimize climate control with the ultimate **Occupant Presence Detection System** designed specifically for "shift pods"! Combining cutting-edge mmWave technology with Bluetooth Low Energy (BLE) scanning, this smart system integrates seamlessly with Home Assistant to bring your environment to life.

---

## 🌟 Why This System?
- **Precision Occupancy Detection:** Leverages advanced MR24HPC1 mmWave sensors for accurate, real-time detection of even subtle occupant movements.
- **Smart Identification:** Uses BLE scanning to precisely identify specific occupants through wearable bracelets or devices.
- **Automated Climate Control:** Integrates effortlessly with Home Assistant and Matter-compatible Midea AC units, adjusting climate settings automatically based on presence.

---

## 🛠️ Technology Stack

- **ESP32C3 Nodes:** Real-time occupancy detection powered by mmWave and BLE sensors.
- **Home Assistant Integration:** Automations triggered via MQTT and Matter to maintain optimal climate conditions.

---

## 📂 Project Structure

```
.
├── color_palette.txt          # Color palette reference for the configuration tool
├── config_tool.py             # Python GUI tool for configuring and flashing ESP32 devices
├── example-config.yaml        # ESPHome configuration template for the mmWave sensor
├── esp32_firmware/            # ESP32C3 sensor firmware (PlatformIO/Arduino approach)
└── home_assistant_integration/# Home Assistant configs
```

---

## 🚦 Quick Start

### Hardware Checklist
- ESP32C3 boards (Seeed XIAO recommended)
- MR24HPC1 mmWave sensors
- BLE bracelets or devices
- MQTT Broker
- Matter-compatible Midea AC

### ESP32 Setup

#### Option 1: PlatformIO (Arduino Framework)
```bash
# Install PlatformIO, configure credentials & BLE MAC addresses
# Flash firmware
cd esp32_firmware
platformio run --target upload
```

#### Option 2: ESPHome with Configuration Tool (recommended for mmWave sensor)
```bash
# Run the configuration tool
python3 config_tool.py
```
The configuration tool provides a simple interface to:
- Configure WiFi settings
- Set BLE MAC addresses for occupant tracking
- Validate and flash your ESP32 device directly

#### Option 3: ESPHome CLI
```bash
# For the mmWave sensor with ESPHome CLI
# Edit example-config.yaml with your WiFi credentials and BLE MAC addresses
esphome run example-config.yaml
```

> **Important:** The `example-config.yaml` file contains the configuration necessary for properly setting up the MR24HPC1 mmWave sensor with ESPHome. It includes all the necessary sensor configurations, composite occupancy detection, and BLE tracking settings. Make sure to modify the WiFi credentials and BLE MAC addresses before flashing.

### Home Assistant

- Set up MQTT integration
- Copy configuration files from `home_assistant_integration/config/`
- Configure Matter integration for your AC

---

## 📈 Features & Usage

- **Real-Time Monitoring:** Instantly view occupancy statuses via Home Assistant.
- **Automated Efficiency:** Home Assistant adjusts your climate based on occupancy.

---

## Configuration

This repository contains template configuration files that need to be filled with your personal settings.

### ESP32 Firmware Configuration

#### Arduino Framework Configuration
1. Copy `esp32_firmware/src/config-sample.h` to `esp32_firmware/src/config.h`
2. Edit `config.h` with your:
   - WiFi credentials
   - MQTT server details
   - Your device MAC addresses for BLE tracking

Example:
```cpp
// WiFi settings
#define WIFI_SSID "MyHomeNetwork"
#define WIFI_PASSWORD "my-secure-password"

// MQTT settings
#define MQTT_SERVER "192.168.1.100"
#define MQTT_PORT 1883
#define MQTT_USERNAME "mqtt_user"
#define MQTT_PASSWORD "mqtt_password"

// Known occupant BLE MAC addresses
#define KNOWN_OCCUPANTS { \
  {"AA:BB:CC:DD:EE:FF", "person1"}, \
  {"11:22:33:44:55:66", "person2"} \
}
```

#### ESPHome Configuration (for mmWave sensor)
1. Edit `example-config.yaml` with your:
   - WiFi credentials
   - BLE device MAC addresses
   - Any specific sensor thresholds

The example-config.yaml already contains the proper settings for:
- mmWave presence detection
- BLE RSSI tracking
- Composite occupancy sensing logic
- All sensor connections and GPIO pins

## Security Notice

- **NEVER commit your actual configuration files with passwords or personal identifiers**
- All sensitive configuration files are excluded in .gitignore
- Double-check what you're committing with `git diff --cached` before pushing

---

## 🛠️ Troubleshooting & Support
- **ESP32 Nodes:** Monitor via serial logs, adjust BLE RSSI thresholds if necessary.
- **Home Assistant:** Validate automations manually and ensure MQTT integrity.

---

## 📃 License
MIT

## 👨‍💻 Created By
Jmi3030

## 🙏 Acknowledgements
- [Seeed Studio MR24HPC1 ESPHome External Components](https://github.com/limengdu/MR24HPC1_ESPHome_external_components) - For the mmWave sensor integration with ESPHome

---

✨ Enjoy smarter, automated living with precision occupancy detection! ✨
