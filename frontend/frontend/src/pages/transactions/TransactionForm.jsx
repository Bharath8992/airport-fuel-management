import React from 'react';
import { Typography, Paper } from '@mui/material';

export default function TransactionForm() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        New Transaction
      </Typography>
      <Typography>Add new fuel transaction</Typography>
    </Paper>
  );
}