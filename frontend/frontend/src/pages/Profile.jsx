import React from 'react';
import { Typography, Paper } from '@mui/material';

export default function Profile() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        User Profile
      </Typography>
      <Typography>Profile settings page</Typography>
    </Paper>
  );
}