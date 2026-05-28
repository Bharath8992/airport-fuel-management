import React from 'react';
import { Typography, Paper } from '@mui/material';

export default function AirlineForm() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Airline Form
      </Typography>
      <Typography>Add/Edit airline form</Typography>
    </Paper>
  );
}