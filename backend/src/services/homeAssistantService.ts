import axios from 'axios';
import dotenv from 'dotenv';
import { Pod } from '../models';
import { publishMqttMessage } from './mqttService';

dotenv.config();

const hassUrl = process.env.HASS_URL || 'http://localhost:8123';
const hassToken = process.env.HASS_TOKEN;

// Initialize axios for Home Assistant API
const hassApi = axios.create({
  baseURL: `${hassUrl}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${hassToken}`
  }
});

/**
 * Publish pod presence data to Home Assistant
 */
export const publishToHomeAssistant = async (pod: Pod): Promise<void> => {
  try {
    // Multiple integration options are available:
    
    // Option 1: Use MQTT to publish to Home Assistant's MQTT broker
    publishViaHassMqtt(pod);
    
    // Option 2: Use REST API to update Home Assistant entities directly
    // await publishViaHassApi(pod);
    
  } catch (error) {
    console.error('Failed to publish to Home Assistant:', error);
  }
};

/**
 * Publish pod data to Home Assistant via MQTT
 */
const publishViaHassMqtt = (pod: Pod): void => {
  // Create a state topic for Home Assistant MQTT discovery
  const stateTopic = `homeassistant/binary_sensor/pod_${pod.podId}/state`;
  const configTopic = `homeassistant/binary_sensor/pod_${pod.podId}/config`;
  
  // Publish the state (ON if occupied, OFF if not)
  publishMqttMessage(stateTopic, pod.isOccupied ? 'ON' : 'OFF');
  
  // Publish the config message for MQTT discovery
  const config = {
    name: `Pod ${pod.podId}`,
    unique_id: `pod_${pod.podId}_occupancy`,
    device_class: 'occupancy',
    state_topic: stateTopic,
    payload_on: 'ON',
    payload_off: 'OFF',
    availability_topic: `homeassistant/binary_sensor/pod_${pod.podId}/availability`,
    device: {
      identifiers: [`pod_${pod.podId}`],
      name: pod.name || `Pod ${pod.podId}`,
      model: 'ESP32C3 + mmWave',
      manufacturer: 'Custom'
    },
    json_attributes_topic: `homeassistant/binary_sensor/pod_${pod.podId}/attributes`
  };
  
  publishMqttMessage(configTopic, JSON.stringify(config));
  
  // Publish additional attributes
  const attributes = {
    last_updated: pod.lastUpdated,
    occupant_id: pod.lastOccupantId,
    mmwave_detected: pod.lastMmwaveDetection,
    ble_detected: pod.lastBleDetection,
    rssi: pod.lastRssi,
    location: pod.location
  };
  
  publishMqttMessage(`homeassistant/binary_sensor/pod_${pod.podId}/attributes`, JSON.stringify(attributes));
  
  // Publish availability
  publishMqttMessage(`homeassistant/binary_sensor/pod_${pod.podId}/availability`, 'online');
};

/**
 * Publish pod data to Home Assistant via REST API
 */
const publishViaHassApi = async (pod: Pod): Promise<void> => {
  if (!hassToken) {
    console.error('Home Assistant token not configured');
    return;
  }
  
  try {
    // Create or update a sensor entity in Home Assistant
    const entityId = `binary_sensor.pod_${pod.podId}_occupancy`;
    
    // Update state via states API
    await hassApi.post('/states/' + entityId, {
      state: pod.isOccupied ? 'on' : 'off',
      attributes: {
        friendly_name: `${pod.name || `Pod ${pod.podId}`} Occupancy`,
        device_class: 'occupancy',
        last_updated: pod.lastUpdated,
        occupant_id: pod.lastOccupantId,
        mmwave_detected: pod.lastMmwaveDetection,
        ble_detected: pod.lastBleDetection,
        rssi: pod.lastRssi,
        location: pod.location
      }
    });
    
    console.log(`Updated Home Assistant entity ${entityId}`);
  } catch (error) {
    console.error('Error updating Home Assistant via API:', error);
  }
};