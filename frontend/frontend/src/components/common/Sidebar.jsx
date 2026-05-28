import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import AirlineStopsIcon from '@mui/icons-material/AirlineStops';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/suppliers', label: 'Suppliers', icon: <LocalShippingIcon /> },
  { path: '/airlines', label: 'Airlines', icon: <AirlineStopsIcon /> },
  { path: '/airports', label: 'Airports', icon: <FlightTakeoffIcon /> },
  { path: '/transactions', label: 'Transactions', icon: <LocalGasStationIcon /> },
  { path: '/invoices', label: 'Invoices', icon: <ReceiptIcon /> },
  { path: '/reports', label: 'Reports', icon: <AssessmentIcon /> },
];

export default function Sidebar() {
  return (
    <List
      component="nav"
      subheader={
        <ListSubheader component="div" sx={{ mt: 2, mb: 1 }}>
          MENU
        </ListSubheader>
      }
    >
      {menuItems.map((item) => (
        <ListItem key={item.path} disablePadding>
          <ListItemButton
            component={NavLink}
            to={item.path}
            sx={{
              '&.active': {
                backgroundColor: '#1e3a8a',
                color: '#fff',
                '& .MuiListItemIcon-root': { color: '#fff' },
              },
              '&:hover': { backgroundColor: '#e0e7ff' },
              borderRadius: '8px',
              mx: 1,
              mb: 0.5,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}