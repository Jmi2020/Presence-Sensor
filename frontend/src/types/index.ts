export interface Pod {
  id: number;
  podId: string;
  name: string;
  location: string;
  isOccupied: boolean;
  lastOccupantId: string | null;
  lastMmwaveDetection: boolean;
  lastBleDetection: boolean;
  lastRssi: number | null;
  lastUpdated: string;
  isActive: boolean;
  // New sensor fields
  staticDistance?: number;
  motionDistance?: number;
  existenceEnergy?: number;
  motionEnergy?: number;
  motionSpeed?: number;
  bodyMovement?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OccupantLog {
  id: number;
  podId: number;
  podExternalId: string;
  occupantId: string | null;
  mmwaveDetected: boolean;
  bleDetected: boolean;
  rssi: number | null;
  isOccupied: boolean;
  // New sensor fields
  staticDistance?: number;
  motionDistance?: number;
  existenceEnergy?: number;
  motionEnergy?: number;
  motionSpeed?: number;
  bodyMovement?: number;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface PodUpdateData {
  name?: string;
  location?: string;
  isOccupied?: boolean;
  lastOccupantId?: string | null;
  lastMmwaveDetection?: boolean;
  lastBleDetection?: boolean;
  lastRssi?: number | null;
}