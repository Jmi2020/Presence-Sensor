import axios from 'axios';
import { Pod, OccupantLog, PodUpdateData } from '../types';

// Use Vite's environment variable system
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Pod API calls
export const getPods = async (): Promise<Pod[]> => {
  const response = await api.get<Pod[]>('/pods');
  return response.data;
};

export const getPod = async (podId: string): Promise<Pod> => {
  const response = await api.get<Pod>(`/pods/${podId}`);
  return response.data;
};

export const updatePod = async (podId: string, data: PodUpdateData): Promise<Pod> => {
  const response = await api.put<Pod>(`/pods/${podId}`, data);
  return response.data;
};

export const getPodLogs = async (podId: string, limit: number = 100): Promise<OccupantLog[]> => {
  const response = await api.get<OccupantLog[]>(`/pods/${podId}/logs?limit=${limit}`);
  return response.data;
};

// Pod occupancy manual update (for testing or overriding)
export const updatePodOccupancy = async (
  podId: string, 
  occupied: boolean,
  occupantId?: string | null,
  mmwaveDetected?: boolean,
  bleDetected?: boolean,
  rssi?: number | null
): Promise<Pod> => {
  const response = await api.post<Pod>(`/pods/${podId}/occupancy`, {
    occupied,
    occupant_id: occupantId,
    mmwave_detected: mmwaveDetected,
    ble_detected: bleDetected,
    rssi
  });
  return response.data;
};