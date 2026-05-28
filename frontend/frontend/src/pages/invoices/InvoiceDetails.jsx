import React from 'react';
import { Typography, Paper } from '@mui/material';

export default function InvoiceDetails() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Invoice Details
      </Typography>
      <Typography>View invoice details</Typography>
    </Paper>
  );
}