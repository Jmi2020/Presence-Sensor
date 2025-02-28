import mqtt from 'mqtt';
import dotenv from 'dotenv';
import { Pod, OccupantLog } from '../models';
import { createOrUpdatePod } from './podService';
import { Server as SocketIOServer } from 'socket.io';
import { publishToHomeAssistant } from './homeAssistantService';

dotenv.config();

let io: SocketIOServer | null = null;

// MQTT Client configuration
const mqttConfig = {
  clientId: `backend_${Math.random().toString(16).slice(2, 8)}`,
  clean: true,
  connectTimeout: 4000,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  reconnectPeriod: 1000,
};

// MQTT Client instance
let client: mqtt.MqttClient | null = null;

/**
 * Initialize MQTT client and subscribe to topics
 */
export const initMqtt = (socketIo?: SocketIOServer): void => {
  if (socketIo) {
    io = socketIo;
  }

  const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
  console.log(`Connecting to MQTT broker at ${brokerUrl}`);
  
  client = mqtt.connect(brokerUrl, mqttConfig);

  client.on('connect', () => {
    console.log('Connected to MQTT broker');
    
    // Subscribe to pod presence topics
    const presenceTopic = process.env.MQTT_TOPIC_PRESENCE || 'presence/pod/#';
    // Check if client is available before subscribing
    if (client) {
      client.subscribe(presenceTopic, (err) => {
        if (err) {
          console.error(`Failed to subscribe to ${presenceTopic}:`, err);
        } else {
          console.log(`Subscribed to topic: ${presenceTopic}`);
        }
      });
    }
  });

  client.on('message', handleMqttMessage);

  client.on('error', (err: Error) => {
    console.error('MQTT client error:', err);
  });

  client.on('disconnect', () => {
    console.log('Disconnected from MQTT broker');
  });
};

/**
 * Handle incoming MQTT messages
 */
const handleMqttMessage = async (topic: string, message: Buffer) => {
  try {
    console.log(`Received message on topic ${topic}: ${message.toString()}`);
    
    // Check if the topic matches our presence topic pattern
    if (topic.startsWith('presence/pod/')) {
      const podId = topic.split('/').pop();
      const payload = JSON.parse(message.toString());
      
      if (!podId || !payload) {
        console.error('Invalid message format or missing podId');
        return;
      }
      
      console.log(`Processing presence data for pod ${podId}:`, payload);
      
      // Validate required fields
      if (typeof payload.occupied !== 'boolean') {
        console.error('Missing required occupied field in payload');
        return;
      }
      
      // Create or update pod and log the occupancy event
      const podData = await createOrUpdatePod({
        podId: payload.pod_id || podId,
        isOccupied: payload.occupied,
        lastOccupantId: payload.occupant_id || null,
        lastMmwaveDetection: payload.mmwave_detected || false,
        lastBleDetection: payload.ble_detected || false,
        lastRssi: payload.rssi || null,
        lastUpdated: new Date()
      });

      // Emit event to WebSocket clients if io is initialized
      if (io) {
        io.emit('podUpdate', podData);
      }
      
      // Forward data to Home Assistant
      publishToHomeAssistant(podData);
    }
  } catch (error) {
    console.error('Error processing MQTT message:', error);
  }
};

/**
 * Publish a message to an MQTT topic
 */
export const publishMqttMessage = (topic: string, message: string | Buffer): void => {
  if (!client || !client.connected) {
    console.error('MQTT client not connected');
    return;
  }
  
  client.publish(topic, message, { qos: 0, retain: false }, (error) => {
    if (error) {
      console.error(`Error publishing to ${topic}:`, error);
    } else {
      console.log(`Message published to ${topic}`);
    }
  });
};

/**
 * Close MQTT client connection
 */
export const closeMqttConnection = (): void => {
  if (client && client.connected) {
    client.end();
    console.log('MQTT client connection closed');
  }
};