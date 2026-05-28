import React from 'react';
import { Typography, Paper } from '@mui/material';

export default function SupplierForm() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Supplier Form
      </Typography>
      <Typography>Add/Edit supplier form</Typography>
    </Paper>
  );
}