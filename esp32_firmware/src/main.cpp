#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <BLEDevice.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>
#include <ArduinoJson.h>
#include "config.h" // Include the config file with sensitive information

// Pod identification
String podId = "pod1"; // Unique ID for this pod
const int rssiThreshold = -65; // BLE signal threshold (adjust based on testing)

// MR24HPC1 mmWave sensor settings
#define MMWAVE_RX_PIN 4  // Connect to sensor TX
#define MMWAVE_TX_PIN 5  // Connect to sensor RX
const unsigned long mmwavePollingInterval = 200; // Poll every 200ms

// BLE settings
int scanTime = 5; // BLE scan time in seconds
BLEScan* pBLEScan;
BLEClient* pClient;

// Known occupant BLE MAC addresses
std::map<std::string, std::string> knownOccupants = KNOWN_OCCUPANTS;

// State variables
bool mmwaveDetected = false;
bool bleDetected = false;
String currentOccupantId = "";
bool podOccupied = false;
unsigned long lastMmwaveCheck = 0;
unsigned long lastBleCheck = 0;
unsigned long lastPublish = 0;
const unsigned long publishInterval = 5000; // Publish every 5 seconds

// Task handles
TaskHandle_t mmwaveTaskHandle;
TaskHandle_t bleTaskHandle;

// MQTT client
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Buffer for mmWave data
uint8_t mmwaveBuffer[255];
int mmwaveBufferIndex = 0;

// Function declarations
void setupWifi();
void reconnectMQTT();
void setupBLE();
void mmwaveTask(void * parameter);
void bleTask(void * parameter);
bool parseMmwaveData();
void publishPresence();

void setup() {
  Serial.begin(115200);
  Serial1.begin(115200, SERIAL_8N1, MMWAVE_RX_PIN, MMWAVE_TX_PIN);
  
  Serial.println("Occupant Presence Detection System - Pod: " + podId);
  
  setupWifi();
  mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
  
  setupBLE();
  
  // Create FreeRTOS tasks
  xTaskCreatePinnedToCore(
    mmwaveTask,    // Task function
    "mmwaveTask",  // Task name
    10000,         // Stack size
    NULL,          // Parameters
    1,             // Priority
    &mmwaveTaskHandle,   // Task handle
    0              // Core (0 or 1)
  );
  
  xTaskCreatePinnedToCore(
    bleTask,       // Task function
    "bleTask",     // Task name
    10000,         // Stack size
    NULL,          // Parameters
    1,             // Priority
    &bleTaskHandle,      // Task handle
    1              // Core (0 or 1)
  );
}

void loop() {
  // Main loop handles MQTT reconnection
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();
  
  // Publish status at regular intervals
  unsigned long currentMillis = millis();
  if (currentMillis - lastPublish >= publishInterval) {
    lastPublish = currentMillis;
    publishPresence();
  }
}

void setupWifi() {
  delay(10);
  Serial.println("Connecting to WiFi");
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.println("Connecting to MQTT broker...");
    String clientId = "ESP32Client-" + podId;
    
    if (mqttClient.connect(clientId.c_str(), MQTT_USERNAME, MQTT_PASSWORD)) {
      Serial.println("Connected to MQTT broker");
    } else {
      Serial.print("MQTT connection failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" Retrying in 5 seconds");
      delay(5000);
    }
  }
}

void setupBLE() {
  BLEDevice::init("PodScanner-" + podId);
  pBLEScan = BLEDevice::getScan();
  pBLEScan->setActiveScan(true);
  pBLEScan->setInterval(100); // Set scan interval
  pBLEScan->setWindow(99);    // Less than interval
  Serial.println("BLE scanner initialized");
}

// Task to read mmWave sensor data
void mmwaveTask(void * parameter) {
  Serial.println("mmWave task started");
  
  while(true) {
    // Check if serial data is available from mmWave sensor
    while(Serial1.available()) {
      uint8_t c = Serial1.read();
      mmwaveBuffer[mmwaveBufferIndex++] = c;
      
      // Process buffer when we have enough data
      if (mmwaveBufferIndex > 10) {
        if (parseMmwaveData()) {
          mmwaveDetected = true;
          Serial.println("mmWave: Motion detected");
        } else {
          mmwaveDetected = false;
        }
        mmwaveBufferIndex = 0; // Reset buffer index
      }
    }
    
    delay(50); // Small delay to prevent task hogging CPU
  }
}

// Parse mmWave sensor data to detect presence
bool parseMmwaveData() {
  // This is a placeholder function
  // The actual implementation will depend on the specific MR24HPC1 protocol
  // Typically, you need to check for specific frame headers and decode the presence bit
  
  // For testing purposes, let's assume we find a presence frame
  for (int i = 0; i < mmwaveBufferIndex - 4; i++) {
    // Example check for header bytes and presence indication
    // This needs to be replaced with actual protocol implementation
    if (mmwaveBuffer[i] == 0x55 && mmwaveBuffer[i+1] == 0xAA) {
      // Check presence byte (hypothetical position)
      if (mmwaveBuffer[i+3] == 0x01) {
        return true; // Presence detected
      }
    }
  }
  return false;
}

// BLE scanning task
class MyAdvertisedDeviceCallbacks: public BLEAdvertisedDeviceCallbacks {
  void onResult(BLEAdvertisedDevice advertisedDevice) {
    std::string address = advertisedDevice.getAddress().toString();
    
    // Check if this is a known occupant
    auto it = knownOccupants.find(address);
    if (it != knownOccupants.end()) {
      // Check RSSI to determine proximity
      int rssi = advertisedDevice.getRSSI();
      Serial.printf("Known occupant found: %s, RSSI: %d\n", it->second.c_str(), rssi);
      
      if (rssi >= rssiThreshold) {
        bleDetected = true;
        currentOccupantId = it->second.c_str();
      }
    }
  }
};

void bleTask(void * parameter) {
  Serial.println("BLE scanning task started");
  pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());
  
  while(true) {
    bleDetected = false; // Reset detection flag before scan
    
    Serial.println("Starting BLE scan");
    BLEScanResults foundDevices = pBLEScan->start(scanTime, false);
    
    // If no BLE device was found in the callback, reset occupant ID
    if (!bleDetected) {
      currentOccupantId = "";
    }
    
    Serial.printf("BLE scan done, devices found: %d\n", foundDevices.getCount());
    pBLEScan->clearResults();
    
    // Short delay between scans
    delay(1000);
  }
}

void publishPresence() {
  // Determine pod occupancy status
  bool newOccupancyState = mmwaveDetected && bleDetected;
  
  if (newOccupancyState != podOccupied || podOccupied) {
    podOccupied = newOccupancyState;
    
    // Create JSON document
    StaticJsonDocument<200> doc;
    doc["pod_id"] = podId;
    doc["occupied"] = podOccupied;
    doc["occupant_id"] = currentOccupantId;
    doc["mmwave_detected"] = mmwaveDetected;
    doc["ble_detected"] = bleDetected;
    doc["rssi"] = bleDetected ? rssiThreshold : 0; // Just an example
    
    char jsonBuffer[200];
    serializeJson(doc, jsonBuffer);
    
    // Publish to MQTT
    String topic = String(mqtt_topic_presence) + podId;
    bool published = mqttClient.publish(topic.c_str(), jsonBuffer, true);
    
    Serial.print("Published to ");
    Serial.print(topic);
    Serial.print(": ");
    Serial.println(published ? "Success" : "Failed");
    Serial.println(jsonBuffer);
  }
}