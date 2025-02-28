import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Box
} from '@mui/material';
import { Pod, PodUpdateData } from '../types';
import { updatePod } from '../services/api';

interface PodEditFormProps {
  pod: Pod | null;
  open: boolean;
  onClose: () => void;
  onSave: (pod: Pod) => void;
}

const PodEditForm: React.FC<PodEditFormProps> = ({ pod, open, onClose, onSave }) => {
  const [name, setName] = useState(pod?.name || '');
  const [location, setLocation] = useState(pod?.location || '');
  const [isActive, setIsActive] = useState<boolean>(pod?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Reset form when pod changes
  React.useEffect(() => {
    if (pod) {
      setName(pod.name);
      setLocation(pod.location || '');
      setIsActive(pod.isActive);
    }
  }, [pod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pod) return;
    
    setSaving(true);
    setError('');
    
    try {
      const updateData: PodUpdateData = {
        name,
        location
      };
      
      const updatedPod = await updatePod(pod.podId, updateData);
      onSave(updatedPod);
      onClose();
    } catch (err) {
      console.error('Error updating pod:', err);
      setError('Failed to update pod. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!pod) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Pod: {pod.name}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Pod Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />
            
            <TextField
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              fullWidth
              placeholder="e.g., Room A, Second Floor"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  color="primary"
                />
              }
              label="Active"
            />

            {error && (
              <Box sx={{ color: 'error.main', mt: 1 }}>
                {error}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PodEditForm;