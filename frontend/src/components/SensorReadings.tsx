import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Divider, 
  Chip,
  CircularProgress
} from '@mui/material';
import { 
  SignalCellular4Bar as SignalIcon, 
  Sensors as SensorsIcon,
  Speed as SpeedIcon,
  BluetoothSearching as BluetoothIcon
} from '@mui/icons-material';

interface SensorProps {
  loading: boolean;
  mmwaveDetected: boolean;
  bleDetected: boolean;
  rssi: number | null;
  motionEnergy: number | null;
  existenceEnergy: number | null;
  motionDistance: number | null;
  motionSpeed: number | null;
  staticDistance: number | null;
}

const SensorReadings: React.FC<SensorProps> = ({
  loading,
  mmwaveDetected = false,
  bleDetected = false,
  rssi = null,
  motionEnergy = null,
  existenceEnergy = null,
  motionDistance = null,
  motionSpeed = null,
  staticDistance = null
}) => {
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress size={40} />
        <Typography variant="body1" ml={2}>
          Loading sensor data...
        </Typography>
      </Box>
    );
  }

  const getSensorValueColor = (value: number | null, threshold: number): string => {
    if (value === null) return 'text.secondary';
    return value > threshold ? 'success.main' : 'text.secondary';
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Sensor Readings
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          {/* Detection Status Indicators */}
          <Grid item xs={6} md={3}>
            <Chip
              icon={<SensorsIcon />}
              label={`mmWave: ${mmwaveDetected ? 'Active' : 'Inactive'}`}
              color={mmwaveDetected ? 'info' : 'default'}
              variant="outlined"
              size="small"
            />
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Chip
              icon={<BluetoothIcon />}
              label={`BLE: ${bleDetected ? 'Connected' : 'Searching'}`}
              color={bleDetected ? 'info' : 'default'}
              variant="outlined"
              size="small"
            />
          </Grid>
          
          {rssi !== null && (
            <Grid item xs={6} md={3}>
              <Chip
                icon={<SignalIcon />}
                label={`RSSI: ${rssi} dBm`}
                color={rssi > -70 ? 'success' : 'default'}
                variant="outlined"
                size="small"
              />
            </Grid>
          )}
        </Grid>
        
        {/* Sensor Value Display */}
        <Box mt={3}>
          <Grid container spacing={2}>
            {existenceEnergy !== null && (
              <Grid item xs={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Existence Energy:
                </Typography>
                <Typography 
                  variant="h6" 
                  color={getSensorValueColor(existenceEnergy, 50)}
                  fontWeight="bold"
                >
                  {existenceEnergy}
                </Typography>
              </Grid>
            )}
            
            {motionEnergy !== null && (
              <Grid item xs={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Motion Energy:
                </Typography>
                <Typography 
                  variant="h6" 
                  color={getSensorValueColor(motionEnergy, 30)}
                  fontWeight="bold"
                >
                  {motionEnergy}
                </Typography>
              </Grid>
            )}
            
            {staticDistance !== null && (
              <Grid item xs={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Static Distance:
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {staticDistance} m
                </Typography>
              </Grid>
            )}
            
            {motionDistance !== null && (
              <Grid item xs={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Motion Distance:
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {motionDistance} m
                </Typography>
              </Grid>
            )}
            
            {motionSpeed !== null && (
              <Grid item xs={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Motion Speed:
                </Typography>
                <Box display="flex" alignItems="center">
                  <Typography variant="h6" fontWeight="bold" mr={1}>
                    {motionSpeed}
                  </Typography>
                  <SpeedIcon 
                    color={motionSpeed > 0.5 ? "warning" : "disabled"} 
                    fontSize="small" 
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SensorReadings;