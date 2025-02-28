import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  PersonOutline as PersonOutlineIcon,
  Sensors as SensorsIcon,
  SignalCellular4Bar as SignalIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { Pod } from '../types';

interface PodCardProps {
  pod: Pod;
  onClick?: () => void;
  onEdit?: () => void;
}

const PodCard: React.FC<PodCardProps> = ({ pod, onClick, onEdit }) => {
  const lastUpdatedText = formatDistanceToNow(new Date(pod.lastUpdated), { addSuffix: true });
  
  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onEdit) onEdit();
  };

  return (
    <Card 
      sx={{ 
        mb: 2, 
        cursor: onClick ? 'pointer' : 'default',
        borderLeft: 6, 
        borderColor: pod.isOccupied ? 'success.main' : 'grey.400'
      }}
      onClick={onClick}
      elevation={2}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h2">
            {pod.name}
          </Typography>
          {onEdit && (
            <IconButton size="small" onClick={handleEditClick}>
              <EditIcon />
            </IconButton>
          )}
        </Box>
        
        <Typography color="textSecondary" gutterBottom>
          ID: {pod.podId}
        </Typography>
        
        {pod.location && (
          <Typography color="textSecondary" variant="body2">
            Location: {pod.location}
          </Typography>
        )}
        
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Chip
                icon={pod.isOccupied ? <PersonIcon /> : <PersonOutlineIcon />}
                label={pod.isOccupied ? 'Occupied' : 'Unoccupied'}
                color={pod.isOccupied ? 'success' : 'default'}
                variant="outlined"
                size="small"
              />
            </Grid>
            
            {pod.lastOccupantId && pod.isOccupied && (
              <Grid item xs={6}>
                <Chip
                  label={`Occupant: ${pod.lastOccupantId}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Grid>
            )}
            
            <Grid item xs={6}>
              <Chip
                icon={<SensorsIcon />}
                label={`mmWave: ${pod.lastMmwaveDetection ? 'Detected' : 'Clear'}`}
                color={pod.lastMmwaveDetection ? 'info' : 'default'}
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid item xs={6}>
              <Chip
                icon={<SignalIcon />}
                label={`BLE: ${pod.lastBleDetection ? 'Detected' : 'Clear'}`}
                color={pod.lastBleDetection ? 'info' : 'default'}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </Box>
        
        <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
          Last updated: {lastUpdatedText}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PodCard;