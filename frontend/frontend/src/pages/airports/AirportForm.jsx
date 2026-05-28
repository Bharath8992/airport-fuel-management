import React from 'react';
import { Typography, Paper } from '@mui/material';

export default function AirportForm() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Airport Form
      </Typography>
      <Typography>Add/Edit airport form</Typography>
    </Paper>
  );
}