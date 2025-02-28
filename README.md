# Occupant Presence Detection System

A comprehensive system for detecting occupant presence in "shift pods" using mmWave sensors and BLE scanning, with integration to Home Assistant for automated climate control.

## System Overview

This project creates an occupancy detection system for multiple "shift pods" that integrates with Home Assistant for climate control automation. The system consists of:

1. **ESP32C3 Nodes**: One per shift pod, equipped with:
   - MR24HPC1 24 GHz mmWave sensor for fine motion detection
   - BLE scanning to detect occupant-specific bracelets/devices

2. **Backend Server**: Node.js/TypeScript application that:
   - Collects occupancy data from the pods
   - Stores historical occupancy logs
   - Provides a REST API for the frontend
   - Pushes real-time updates via WebSockets
   - Integrates with Home Assistant via MQTT

3. **Frontend Dashboard**: React application that:
   - Displays the status of all pods
   - Shows detailed occupancy logs
   - Allows pod configuration
   - Updates in real-time

4. **Home Assistant Integration**: 
   - Receives occupancy data as binary sensors
   - Controls a Midea AC unit via Matter integration
   - Runs automations based on occupancy patterns

## Project Structure

```
├── esp32_firmware/         # ESP32C3 firmware for the pods
│   ├── platformio.ini      # PlatformIO configuration
│   └── src/                # Source code for ESP32
│       └── main.cpp        # Main firmware file
├── backend/                # Node.js/TypeScript backend
│   ├── src/                # Source code
│   │   ├── config/         # Configuration
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   └── services/       # Business logic services
│   ├── package.json        # Dependencies
│   └── tsconfig.json       # TypeScript configuration
├── frontend/               # React frontend
│   ├── public/             # Static files
│   └── src/                # Source code
│       ├── components/     # React components
│       ├── contexts/       # React contexts
│       ├── pages/          # Page components
│       ├── services/       # API services
│       └── types/          # TypeScript interfaces
└── home_assistant_integration/  # Home Assistant configuration
    └── config/             # Configuration files
```

## Setup Instructions

### Prerequisites

- Two Raspberry Pi 5 devices (16 GB RAM recommended):
  - One for the backend server and frontend
  - One for Home Assistant OS
- ESP32C3 boards (Seeed XIAO ESP32C3) for each pod
- MR24HPC1 mmWave sensors for each pod
- BLE bracelets or devices for occupants
- MQTT broker (can be installed on either Raspberry Pi)
- PostgreSQL database
- Midea AC unit with Matter support

### ESP32 Setup

1. Install PlatformIO
2. Update WiFi and MQTT credentials in `esp32_firmware/src/main.cpp`
3. Update known BLE MAC addresses for occupants
4. Build and flash to your ESP32C3 boards
5. Connect the mmWave sensor to GPIO4 (RX) and GPIO5 (TX)

### Backend Setup

1. Install Node.js and PostgreSQL
2. Create a PostgreSQL database named `presence_sensor`
3. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
4. Update the `.env` file with your configuration
5. Build and start the server:
   ```bash
   npm run build
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Update any environment variables in `.env` if needed
3. Start the development server:
   ```bash
   npm start
   ```
4. Build for production:
   ```bash
   npm run build
   ```

### Home Assistant Setup

1. Install Home Assistant OS on your second Raspberry Pi 5
2. Set up the MQTT integration
3. Copy the configuration files from `home_assistant_integration/config/` to your Home Assistant configuration directory
4. Set up a Matter integration for your Midea AC unit
5. Restart Home Assistant

## Usage

### ESP32 Nodes

- Each ESP32 node continuously scans for mmWave presence and BLE signals
- When both mmWave motion and a known BLE device are detected, the pod is considered occupied
- The occupancy status is published via MQTT

### Backend

- Receives occupancy updates from ESP32 nodes
- Stores current status and historical logs
- Provides REST API endpoints
- Establishes WebSocket connections for real-time updates
- Forwards occupancy data to Home Assistant via MQTT

### Frontend Dashboard

- Displays all pods with their current status
- Shows detailed view of a selected pod
- Displays historical log data
- Updates in real-time via WebSockets

### Home Assistant Automations

- Turns on the AC when a pod becomes occupied
- Turns off the AC when all pods are unoccupied for 15 minutes
- Adjusts temperature based on how many pods are occupied

## Maintenance and Troubleshooting

### ESP32 Nodes

- Check the serial monitor for debugging information
- Verify that the mmWave sensor is correctly wired
- Ensure the BLE scanning is detecting the correct MAC addresses
- Adjust the RSSI threshold if occupants are being detected from adjacent pods

### Backend

- Check the logs for any errors
- Verify database connection
- Ensure the MQTT broker is running and accessible

### Frontend

- Check the browser console for errors
- Verify the API endpoints are accessible

### Home Assistant

- Check that the MQTT integration is working
- Verify that the binary sensors are being created
- Test the automations manually to ensure they work as expected

## License

MIT

## Authors

Your Name