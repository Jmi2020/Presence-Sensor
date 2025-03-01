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
- **Backend:** Node.js/TypeScript server managing occupancy data, real-time updates via WebSockets, and MQTT integration.
- **Frontend Dashboard:** Interactive React dashboard showing real-time pod status, occupancy logs, and configurations.
- **Home Assistant Integration:** Automations triggered via MQTT and Matter to maintain optimal climate conditions.

---

## 📂 Project Structure

```
.
├── esp32_firmware/            # ESP32C3 sensor firmware
├── backend/                   # Node.js/TypeScript server
├── frontend/                  # Interactive React UI
└── home_assistant_integration/# Home Assistant configs
```

---

## 🚦 Quick Start

### Hardware Checklist
- Raspberry Pi 5 (two recommended)
- ESP32C3 boards (Seeed XIAO recommended)
- MR24HPC1 mmWave sensors
- BLE bracelets or devices
- MQTT Broker
- PostgreSQL Database
- Matter-compatible Midea AC

### ESP32 Setup

```bash
# Install PlatformIO, configure credentials & BLE MAC addresses
# Flash firmware
cd esp32_firmware
platformio run --target upload
```

### Backend Server

```bash
cd backend
npm install
npm run build
npm start
```

### Frontend Dashboard

```bash
cd frontend
npm install
npm start # for development
npm run build # for production
```

### Home Assistant

- Set up MQTT integration
- Copy configuration files from `home_assistant_integration/config/`
- Configure Matter integration for your AC

---

## 📈 Features & Usage

- **Real-Time Monitoring:** Instantly view occupancy statuses via the interactive dashboard.
- **Historical Logs:** Keep track of occupancy patterns for smarter management.
- **Automated Efficiency:** Home Assistant adjusts your climate based on occupancy.

---

## Configuration

This repository contains template configuration files that need to be filled with your personal settings.

### ESP32 Firmware Configuration

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

### Backend Configuration

1. Copy `backend/.env.sample` to `backend/.env`
2. Fill in your database credentials, MQTT broker details, and other settings

## Security Notice

- **NEVER commit your actual configuration files with passwords or personal identifiers**
- All sensitive configuration files are excluded in .gitignore
- Double-check what you're committing with `git diff --cached` before pushing

---

## 🛠️ Troubleshooting & Support
- **ESP32 Nodes:** Monitor via serial logs, adjust BLE RSSI thresholds if necessary.
- **Backend:** Check server logs and MQTT connectivity.
- **Frontend:** Browser console debugging.
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
