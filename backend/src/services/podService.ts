import { Pod, OccupantLog } from '../models';

interface PodUpdateData {
  podId: string;
  name?: string;
  location?: string;
  isOccupied: boolean;
  lastOccupantId: string | null;
  lastMmwaveDetection: boolean;
  lastBleDetection: boolean;
  lastRssi: number | null;
  lastUpdated: Date;
}

/**
 * Create or update a pod and log the occupancy event
 */
export const createOrUpdatePod = async (data: PodUpdateData): Promise<Pod> => {
  try {
    // Find pod or create if it doesn't exist
    const [pod, created] = await Pod.findOrCreate({
      where: { podId: data.podId },
      defaults: {
        podId: data.podId,
        name: data.name || `Pod ${data.podId}`,
        location: data.location || 'Unknown',
        isOccupied: data.isOccupied,
        lastOccupantId: data.lastOccupantId,
        lastMmwaveDetection: data.lastMmwaveDetection,
        lastBleDetection: data.lastBleDetection,
        lastRssi: data.lastRssi,
        lastUpdated: data.lastUpdated,
        isActive: true
      }
    });

    if (!created) {
      // Update existing pod
      pod.isOccupied = data.isOccupied;
      pod.lastOccupantId = data.lastOccupantId;
      pod.lastMmwaveDetection = data.lastMmwaveDetection;
      pod.lastBleDetection = data.lastBleDetection;
      pod.lastRssi = data.lastRssi;
      pod.lastUpdated = data.lastUpdated;
      
      if (data.name) pod.name = data.name;
      if (data.location) pod.location = data.location;
      
      await pod.save();
    }

    // Make sure we have valid IDs before creating the log
    if (pod && pod.id) {
      try {
        // Create occupant log
        await OccupantLog.create({
          podId: pod.id,
          podExternalId: data.podId, // Use the external ID directly from input data
          occupantId: data.lastOccupantId,
          mmwaveDetected: data.lastMmwaveDetection,
          bleDetected: data.lastBleDetection,
          rssi: data.lastRssi,
          isOccupied: data.isOccupied,
          timestamp: data.lastUpdated
        });
      } catch (logError) {
        console.error('Error creating occupancy log, but pod was updated:', logError);
        // Continue without failing the whole operation - we at least updated the pod
      }
    }

    return pod;
  } catch (error) {
    console.error('Error in createOrUpdatePod:', error);
    throw error;
  }
};

/**
 * Get all pods
 */
export const getAllPods = async (): Promise<Pod[]> => {
  try {
    return await Pod.findAll({
      order: [['podId', 'ASC']]
    });
  } catch (error) {
    console.error('Error in getAllPods:', error);
    throw error;
  }
};

/**
 * Get pod by ID
 */
export const getPodById = async (podId: string): Promise<Pod | null> => {
  try {
    return await Pod.findOne({
      where: { podId }
    });
  } catch (error) {
    console.error('Error in getPodById:', error);
    throw error;
  }
};

/**
 * Get recent logs for a pod
 */
export const getPodLogs = async (podId: string, limit: number = 100): Promise<OccupantLog[]> => {
  try {
    const pod = await Pod.findOne({
      where: { podId }
    });

    if (!pod) {
      throw new Error(`Pod with ID ${podId} not found`);
    }

    return await OccupantLog.findAll({
      where: { podId: pod.id },
      order: [['timestamp', 'DESC']],
      limit
    });
  } catch (error) {
    console.error('Error in getPodLogs:', error);
    throw error;
  }
};