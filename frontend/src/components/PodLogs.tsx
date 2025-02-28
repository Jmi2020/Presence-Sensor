import React from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  CircularProgress
} from '@mui/material';
import { OccupantLog } from '../types';

interface PodLogsProps {
  logs: OccupantLog[];
  loading: boolean;
}

const PodLogs: React.FC<PodLogsProps> = ({ logs, loading }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Typography variant="subtitle1" textAlign="center" my={4}>
        No logs available for this pod.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Recent Activity
      </Typography>
      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Occupant</TableCell>
              <TableCell>mmWave</TableCell>
              <TableCell>BLE</TableCell>
              <TableCell>RSSI</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log: OccupantLog) => (
              <TableRow key={log.id}>
                <TableCell>
                  {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                </TableCell>
                <TableCell>
                  <Chip
                    label={log.isOccupied ? 'Occupied' : 'Unoccupied'}
                    color={log.isOccupied ? 'success' : 'default'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{log.occupantId || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={log.mmwaveDetected ? 'Detected' : 'Clear'}
                    color={log.mmwaveDetected ? 'info' : 'default'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={log.bleDetected ? 'Detected' : 'Clear'}
                    color={log.bleDetected ? 'info' : 'default'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{log.rssi !== null ? log.rssi : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PodLogs;