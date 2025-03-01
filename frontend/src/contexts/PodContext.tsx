import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Pod, OccupantLog } from '../types';
import { getPods, getPodLogs } from '../services/api';
import { initializeSocket } from '../services/socket';

interface PodContextType {
  pods: Pod[];
  loading: boolean;
  error: string | null;
  selectedPod: Pod | null;
  podLogs: OccupantLog[];
  logsLoading: boolean;
  refreshPods: () => void;
  selectPod: (podId: string | null) => void;
}

const PodContext = createContext<PodContextType | undefined>(undefined);

export const usePodContext = () => {
  const context = useContext(PodContext);
  if (!context) {
    throw new Error('usePodContext must be used within a PodProvider');
  }
  return context;
};

interface PodProviderProps {
  children: ReactNode;
}

export const PodProvider: React.FC<PodProviderProps> = ({ children }) => {
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPod, setSelectedPod] = useState<Pod | null>(null);
  const [podLogs, setPodLogs] = useState<OccupantLog[]>([]);
  const [logsLoading, setLogsLoading] = useState<boolean>(false);

  const refreshPods = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedPods = await getPods();
      setPods(fetchedPods);
    } catch (err) {
      console.error('Error fetching pods:', err);
      setError('Failed to connect to the backend server. Please ensure the backend is running on port 3000.');
      // Set empty pods array to avoid undefined errors
      setPods([]);
    } finally {
      setLoading(false);
    }
  };

  const selectPod = async (podId: string | null) => {
    if (!podId) {
      setSelectedPod(null);
      setPodLogs([]);
      return;
    }

    const pod = pods.find((p: Pod) => p.podId === podId) || null;
    setSelectedPod(pod);

    if (pod) {
      fetchPodLogs(podId);
    }
  };

  const fetchPodLogs = useCallback(async (podId: string) => {
    setLogsLoading(true);
    try {
      const logs = await getPodLogs(podId, 100);
      setPodLogs(logs);
    } catch (err) {
      console.error('Error fetching pod logs:', err);
      setPodLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  // Initialize WebSocket for real-time updates
  useEffect(() => {
    try {
      const handlePodUpdate = (updatedPod: Pod) => {
        // Update pods list
        setPods((prevPods: Pod[]) => {
          const index = prevPods.findIndex((p: Pod) => p.podId === updatedPod.podId);
          if (index === -1) {
            return [...prevPods, updatedPod];
          } else {
            const newPods = [...prevPods];
            newPods[index] = updatedPod;
            return newPods;
          }
        });

        // Update selected pod if it's the updated one
        if (selectedPod && selectedPod.podId === updatedPod.podId) {
          setSelectedPod(updatedPod);
          // Refresh logs for the selected pod
          fetchPodLogs(updatedPod.podId);
        }
      };

      initializeSocket(handlePodUpdate);
    } catch (err) {
      console.error('Socket initialization error:', err);
      // Socket errors are non-critical, so we don't need to set the error state
    }

    // Initial data fetch
    refreshPods();

    // Cleanup
    return () => {
      // Socket cleanup handled in socket.ts
    };
  }, [selectedPod, fetchPodLogs]);

  // Refresh selected pod logs when it changes
  useEffect(() => {
    if (selectedPod) {
      fetchPodLogs(selectedPod.podId);
    }
  }, [selectedPod, fetchPodLogs]);

  const value = {
    pods,
    loading,
    error,
    selectedPod,
    podLogs,
    logsLoading,
    refreshPods,
    selectPod
  };

  return <PodContext.Provider value={value}>{children}</PodContext.Provider>;
};