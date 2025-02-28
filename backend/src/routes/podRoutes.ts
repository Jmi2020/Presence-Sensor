import express, { Request, Response } from 'express';
import { getAllPods, getPodById, getPodLogs, createOrUpdatePod } from '../services/podService';

const router = express.Router();

// GET all pods
router.get('/', async (req: Request, res: Response) => {
  try {
    const pods = await getAllPods();
    res.json(pods);
  } catch (error) {
    console.error('Error fetching pods:', error);
    res.status(500).json({ error: 'Failed to fetch pods' });
  }
});

// GET pod by ID
router.get('/:podId', async (req: Request, res: Response) => {
  try {
    const { podId } = req.params;
    const pod = await getPodById(podId);
    
    if (!pod) {
      return res.status(404).json({ error: 'Pod not found' });
    }
    
    res.json(pod);
  } catch (error) {
    console.error('Error fetching pod:', error);
    res.status(500).json({ error: 'Failed to fetch pod' });
  }
});

// GET pod logs
router.get('/:podId/logs', async (req: Request, res: Response) => {
  try {
    const { podId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    
    const logs = await getPodLogs(podId, limit);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching pod logs:', error);
    res.status(500).json({ error: 'Failed to fetch pod logs' });
  }
});

// POST update pod occupancy (for ESP32 nodes that use HTTP instead of MQTT)
router.post('/:podId/occupancy', async (req: Request, res: Response) => {
  try {
    const { podId } = req.params;
    const { 
      occupied,
      occupant_id,
      mmwave_detected,
      ble_detected,
      rssi,
      name,
      location
    } = req.body;
    
    // Validate required fields
    if (typeof occupied !== 'boolean') {
      return res.status(400).json({ error: 'Occupied status is required and must be a boolean' });
    }
    
    const pod = await createOrUpdatePod({
      podId,
      name,
      location,
      isOccupied: occupied,
      lastOccupantId: occupant_id || null,
      lastMmwaveDetection: mmwave_detected || false,
      lastBleDetection: ble_detected || false,
      lastRssi: rssi || null,
      lastUpdated: new Date()
    });
    
    res.status(200).json(pod);
  } catch (error) {
    console.error('Error updating pod occupancy:', error);
    res.status(500).json({ error: 'Failed to update pod occupancy' });
  }
});

// PUT update pod details
router.put('/:podId', async (req: Request, res: Response) => {
  try {
    const { podId } = req.params;
    const { name, location } = req.body;
    
    const existingPod = await getPodById(podId);
    
    if (!existingPod) {
      return res.status(404).json({ error: 'Pod not found' });
    }
    
    const pod = await createOrUpdatePod({
      podId,
      name,
      location,
      isOccupied: existingPod.isOccupied,
      lastOccupantId: existingPod.lastOccupantId,
      lastMmwaveDetection: existingPod.lastMmwaveDetection,
      lastBleDetection: existingPod.lastBleDetection,
      lastRssi: existingPod.lastRssi,
      lastUpdated: existingPod.lastUpdated
    });
    
    res.status(200).json(pod);
  } catch (error) {
    console.error('Error updating pod:', error);
    res.status(500).json({ error: 'Failed to update pod' });
  }
});

export default router;