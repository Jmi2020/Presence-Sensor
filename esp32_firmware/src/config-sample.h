// config-sample.h
// RENAME THIS FILE TO config.h AND FILL IN YOUR VALUES
#ifndef CONFIG_H
#define CONFIG_H

// WiFi settings
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// MQTT settings
#define MQTT_SERVER "YOUR_MQTT_SERVER_IP"
#define MQTT_PORT 1883
#define MQTT_USERNAME "YOUR_MQTT_USERNAME"
#define MQTT_PASSWORD "YOUR_MQTT_PASSWORD"

// Known occupant BLE MAC addresses
// Format: {"MAC_ADDRESS", "OCCUPANT_ID"}, 
#define KNOWN_OCCUPANTS { \
  {"11:22:33:44:55:66", "occupant1"}, \
  {"aa:bb:cc:dd:ee:ff", "occupant2"}, \
  {"00:00:00:00:00:00", "wristband1"} \
}

#endif