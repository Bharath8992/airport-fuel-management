import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  useTheme,
  Box,
  Switch,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import AirlineStopsIcon from '@mui/icons-material/AirlineStops';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/suppliers', label: 'Suppliers', icon: <LocalShippingIcon /> },
  { path: '/airlines', label: 'Airlines', icon: <AirlineStopsIcon /> },
  { path: '/airports', label: 'Airports', icon: <FlightTakeoffIcon /> },
  { path: '/transactions', label: 'Transactions', icon: <LocalGasStationIcon /> },
  { path: '/invoices', label: 'Invoices', icon: <ReceiptIcon /> },
  { path: '/reports', label: 'Reports', icon: <AssessmentIcon /> },
];

export default function Sidebar({ onThemeChange }) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [darkMode, setDarkMode] = useState(isDarkMode);

  useEffect(() => {
    setDarkMode(isDarkMode);
  }, [isDarkMode]);

  const handleThemeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (onThemeChange) {
      onThemeChange(newMode);
    }
  };

  const getStyles = () => ({
    listSubheader: {
      mt: 2,
      mb: 1,
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
      color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
    },
    listItemButton: {
      '&.active': {
        backgroundColor: isDarkMode ? 'rgba(30, 58, 138, 0.8)' : '#1e3a8a',
        color: isDarkMode ? '#fff' : '#fff',
        '& .MuiListItemIcon-root': {
          color: isDarkMode ? '#fff' : '#fff',
        },
      },
      '&:hover': {
        backgroundColor: isDarkMode ? 'rgba(66, 133, 244, 0.15)' : '#e0e7ff',
      },
      color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.87)',
      borderRadius: '8px',
      mx: 1,
      mb: 0.5,
      transition: 'all 0.3s ease',
    },
    listItemIcon: {
      minWidth: 40,
      color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'inherit',
    },
  });

  const styles = getStyles();

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isDarkMode ? '#121212' : '#ffffff',
      }}
    >
      <List
        component="nav"
        subheader={
          <ListSubheader component="div" sx={styles.listSubheader}>
            MENU
          </ListSubheader>
        }
        sx={{
          flex: 1,
          overflowY: 'auto',
        }}
      >
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              sx={styles.listItemButton}
            >
              <ListItemIcon sx={styles.listItemIcon}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        
        {/* Theme Switch Section - Directly under Reports link */}
        <Box sx={{ mt: 2, px: 1 }}>
          <Divider sx={{ mb: 2, backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)' }} />
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleThemeToggle}
              sx={{
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: isDarkMode ? 'rgba(66, 133, 244, 0.15)' : '#e0e7ff',
                },
                ...styles.listItemButton,
              }}
            >
              <ListItemIcon sx={styles.listItemIcon}>
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </ListItemIcon>
              <ListItemText 
                primary={isDarkMode ? "Light Mode" : "Dark Mode"}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              />
              <Switch
                checked={isDarkMode}
                onChange={handleThemeToggle}
                color="primary"
                size="medium"
              />
            </ListItemButton>
          </ListItem>
        </Box>
      </List>
    </Box>
  );
}