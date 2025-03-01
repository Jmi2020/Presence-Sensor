import React, { useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Paper,
  Box,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import PodCard from '../components/PodCard';
import PodLogs from '../components/PodLogs';
import PodEditForm from '../components/PodEditForm';
import SensorReadings from '../components/SensorReadings';
import { usePodContext } from '../contexts/PodContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`pod-tabpanel-${index}`}
      aria-labelledby={`pod-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Dashboard: React.FC = () => {
  const { pods, loading, error, selectedPod, podLogs, logsLoading, refreshPods, selectPod } = usePodContext();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  const handlePodClick = (podId: string) => {
    selectPod(podId);
  };
  
  const handleRefreshClick = () => {
    refreshPods();
  };
  
  const handleEditClick = () => {
    setEditDialogOpen(true);
  };
  
  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };
  
  const handlePodUpdated = () => {
    refreshPods();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Occupant Presence Dashboard
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={handleRefreshClick}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={4}>
        {/* Left side - Pod List */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Pods
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {loading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : pods.length === 0 ? (
              <Typography variant="body1" textAlign="center" color="textSecondary">
                No pods found. Please check your ESP32 devices or backend connectivity.
              </Typography>
            ) : (
              <Box sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto', pr: 1 }}>
                {pods.map(pod => (
                  <PodCard 
                    key={pod.id} 
                    pod={pod} 
                    onClick={() => handlePodClick(pod.podId)}
                    onEdit={selectedPod?.id === pod.id ? handleEditClick : undefined}
                  />
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Right side - Pod Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              {selectedPod ? `${selectedPod.name} Details` : 'Pod Details'}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {!selectedPod ? (
              <Typography variant="body1" textAlign="center" color="textSecondary" py={10}>
                Select a pod to view its details
              </Typography>
            ) : (
              <>
                <PodCard 
                  pod={selectedPod} 
                  onEdit={handleEditClick}
                />

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
                  <Tabs value={tabValue} onChange={handleTabChange} aria-label="pod details tabs">
                    <Tab label="Activity Logs" id="pod-tab-0" />
                    <Tab label="Sensor Readings" id="pod-tab-1" />
                  </Tabs>
                </Box>
                
                <TabPanel value={tabValue} index={0}>
                  <PodLogs logs={podLogs} loading={logsLoading} />
                </TabPanel>
                
                <TabPanel value={tabValue} index={1}>
                  <SensorReadings 
                    loading={logsLoading} 
                    mmwaveDetected={selectedPod.lastMmwaveDetection}
                    bleDetected={selectedPod.lastBleDetection}
                    rssi={selectedPod.lastRssi}
                    motionEnergy={65} // Example value - would come from actual sensor API
                    existenceEnergy={78} // Example value - would come from actual sensor API
                    motionDistance={1.5} // Example value - would come from actual sensor API
                    motionSpeed={0.3} // Example value - would come from actual sensor API
                    staticDistance={2.0} // Example value - would come from actual sensor API
                  />
                </TabPanel>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Edit Pod Dialog */}
      <PodEditForm 
        pod={selectedPod} 
        open={editDialogOpen && !!selectedPod} 
        onClose={handleEditDialogClose}
        onSave={handlePodUpdated} 
      />
    </Container>
  );
};

export default Dashboard;