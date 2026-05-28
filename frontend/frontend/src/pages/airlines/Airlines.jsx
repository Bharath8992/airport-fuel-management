import React from 'react';
import { Typography, Paper, Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

export default function Airlines() {
  const navigate = useNavigate();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Airlines Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/airlines/new')}
        >
          Add Airline
        </Button>
      </Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 10 }}>
          Airlines list will appear here. Connect to backend to view data.
        </Typography>
      </Paper>
    </Box>
  );
}