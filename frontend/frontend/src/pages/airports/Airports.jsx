import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Stack,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
  Divider,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  FlightTakeoff as AirportIcon,
  LocationOn as LocationIcon,
  LocalGasStation as FuelIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Clear as ClearIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

// Airport Form Dialog Component
const AirportFormDialog = ({ open, airport, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    airport_name: '',
    airport_code: '',
    city: '',
    country: 'India',
    runway_count: 1,
    fuel_storage_capacity: '',
    current_fuel_stock: 0,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (airport) {
      setFormData({
        airport_name: airport.airport_name || '',
        airport_code: airport.airport_code || '',
        city: airport.city || '',
        country: airport.country || 'India',
        runway_count: airport.runway_count || 1,
        fuel_storage_capacity: airport.fuel_storage_capacity || '',
        current_fuel_stock: airport.current_fuel_stock || 0,
      });
    } else {
      setFormData({
        airport_name: '',
        airport_code: '',
        city: '',
        country: 'India',
        runway_count: 1,
        fuel_storage_capacity: '',
        current_fuel_stock: 0,
      });
    }
    setErrors({});
  }, [airport, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.airport_name.trim()) newErrors.airport_name = 'Airport name is required';
    if (!formData.airport_code.trim()) newErrors.airport_code = 'Airport code is required';
    if (formData.airport_code.length < 3) newErrors.airport_code = 'Airport code must be at least 3 characters';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.fuel_storage_capacity) newErrors.fuel_storage_capacity = 'Fuel storage capacity is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth TransitionComponent={Grow}>
      <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <AirportIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            {airport ? 'Edit Airport' : 'Add New Airport'}
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Airport Name"
              name="airport_name"
              value={formData.airport_name}
              onChange={handleChange}
              error={!!errors.airport_name}
              helperText={errors.airport_name}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Airport Code (IATA)"
              name="airport_code"
              value={formData.airport_code}
              onChange={handleChange}
              error={!!errors.airport_code}
              helperText={errors.airport_code}
              size="small"
              inputProps={{ style: { textTransform: 'uppercase' } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              error={!!errors.city}
              helperText={errors.city}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              error={!!errors.country}
              helperText={errors.country}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Number of Runways"
              name="runway_count"
              type="number"
              value={formData.runway_count}
              onChange={handleChange}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Fuel Storage Capacity (Liters)"
              name="fuel_storage_capacity"
              type="number"
              value={formData.fuel_storage_capacity}
              onChange={handleChange}
              error={!!errors.fuel_storage_capacity}
              helperText={errors.fuel_storage_capacity}
              size="small"
              InputProps={{ startAdornment: <InputAdornment position="start">L</InputAdornment> }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Current Fuel Stock (Liters)"
              name="current_fuel_stock"
              type="number"
              value={formData.current_fuel_stock}
              onChange={handleChange}
              size="small"
              InputProps={{ startAdornment: <InputAdornment position="start">L</InputAdornment> }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : (airport ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Stock Update Dialog
const StockUpdateDialog = ({ open, airport, onClose, onUpdate, loading }) => {
  const [quantity, setQuantity] = useState('');
  const [operation, setOperation] = useState('add');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!quantity || quantity <= 0) {
      setError('Please enter a valid quantity');
      return;
    }
    onUpdate(airport.id, parseFloat(quantity), operation);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#ff9800', color: 'white' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <FuelIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Update Fuel Stock - {airport?.airport_name}
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <Select
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
              >
                <MenuItem value="add">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <TrendingUpIcon color="success" />
                    <span>Add Fuel (Increase Stock)</span>
                  </Stack>
                </MenuItem>
                <MenuItem value="subtract">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <TrendingDownIcon color="error" />
                    <span>Remove Fuel (Decrease Stock)</span>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Quantity (Liters)"
              type="number"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setError('');
              }}
              error={!!error}
              helperText={error}
              size="small"
              InputProps={{ startAdornment: <InputAdornment position="start">L</InputAdornment> }}
            />
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Typography variant="body2" color="text.secondary">
                Current Stock: <strong>{airport?.current_fuel_stock?.toLocaleString()} L</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Capacity: <strong>{airport?.fuel_storage_capacity?.toLocaleString()} L</strong>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color={operation === 'add' ? 'success' : 'warning'}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : (operation === 'add' ? 'Add Fuel' : 'Remove Fuel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Airports Component
export default function Airports() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [airports, setAirports] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openStockDialog, setOpenStockDialog] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formLoading, setFormLoading] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);

  // Load airports from localStorage
  useEffect(() => {
    loadAirports();
  }, []);

  const loadAirports = () => {
    setLoading(true);
    const savedAirports = localStorage.getItem('airports');
    if (savedAirports) {
      setAirports(JSON.parse(savedAirports));
    } else {
      const defaultAirports = [
        {
          id: 1,
          airport_name: 'Indira Gandhi International Airport',
          airport_code: 'DEL',
          city: 'New Delhi',
          country: 'India',
          runway_count: 3,
          fuel_storage_capacity: 5000000,
          current_fuel_stock: 2500000,
          status: true,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          airport_name: 'Chhatrapati Shivaji International Airport',
          airport_code: 'BOM',
          city: 'Mumbai',
          country: 'India',
          runway_count: 2,
          fuel_storage_capacity: 4000000,
          current_fuel_stock: 1800000,
          status: true,
          created_at: new Date().toISOString(),
        },
        {
          id: 3,
          airport_name: 'Kempegowda International Airport',
          airport_code: 'BLR',
          city: 'Bangalore',
          country: 'India',
          runway_count: 2,
          fuel_storage_capacity: 3000000,
          current_fuel_stock: 1200000,
          status: true,
          created_at: new Date().toISOString(),
        },
        {
          id: 4,
          airport_name: 'Chennai International Airport',
          airport_code: 'MAA',
          city: 'Chennai',
          country: 'India',
          runway_count: 2,
          fuel_storage_capacity: 3500000,
          current_fuel_stock: 1500000,
          status: false,
          created_at: new Date().toISOString(),
        },
      ];
      setAirports(defaultAirports);
      localStorage.setItem('airports', JSON.stringify(defaultAirports));
    }
    setLoading(false);
  };

  // Save to localStorage
  useEffect(() => {
    if (airports.length > 0) {
      localStorage.setItem('airports', JSON.stringify(airports));
    }
  }, [airports]);

  // Filter airports
  useEffect(() => {
    let filtered = [...airports];

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.airport_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.airport_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(a =>
        statusFilter === 'active' ? a.status : !a.status
      );
    }

    setFilteredData(filtered);
    setPage(0);
  }, [airports, searchTerm, statusFilter]);

  useEffect(() => {
    setRowsPerPage(isMobile ? 5 : 10);
  }, [isMobile]);

  const stats = {
    total: airports.length,
    active: airports.filter(a => a.status).length,
    inactive: airports.filter(a => !a.status).length,
    totalCapacity: airports.reduce((sum, a) => sum + (a.fuel_storage_capacity || 0), 0),
    totalStock: airports.reduce((sum, a) => sum + (a.current_fuel_stock || 0), 0),
  };

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleOpenDialog = (airport = null) => {
    setSelectedAirport(airport);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAirport(null);
  };

  const handleOpenStockDialog = (airport) => {
    setSelectedAirport(airport);
    setOpenStockDialog(true);
  };

  const handleCloseStockDialog = () => {
    setOpenStockDialog(false);
    setSelectedAirport(null);
  };

  const handleSaveAirport = (formData) => {
    setFormLoading(true);
    
    setTimeout(() => {
      if (selectedAirport) {
        const updatedAirports = airports.map(a =>
          a.id === selectedAirport.id 
            ? { ...a, ...formData, updated_at: new Date().toISOString() }
            : a
        );
        setAirports(updatedAirports);
        setSnackbar({ open: true, message: 'Airport updated successfully!', severity: 'success' });
      } else {
        const newAirport = {
          id: Date.now(),
          ...formData,
          status: true,
          created_at: new Date().toISOString(),
        };
        setAirports([newAirport, ...airports]);
        setSnackbar({ open: true, message: 'Airport created successfully!', severity: 'success' });
      }
      setFormLoading(false);
      handleCloseDialog();
    }, 500);
  };

  const handleUpdateStock = (id, quantity, operation) => {
    setStockLoading(true);
    
    setTimeout(() => {
      const updatedAirports = airports.map(a => {
        if (a.id === id) {
          let newStock = a.current_fuel_stock;
          if (operation === 'add') {
            newStock = Math.min(a.current_fuel_stock + quantity, a.fuel_storage_capacity);
          } else {
            newStock = Math.max(a.current_fuel_stock - quantity, 0);
          }
          return { ...a, current_fuel_stock: newStock };
        }
        return a;
      });
      setAirports(updatedAirports);
      setSnackbar({ 
        open: true, 
        message: `Fuel ${operation === 'add' ? 'added' : 'removed'} successfully!`, 
        severity: 'success' 
      });
      setStockLoading(false);
      handleCloseStockDialog();
    }, 500);
  };

  const handleDeleteAirport = () => {
    if (deleteConfirm) {
      setAirports(airports.filter(a => a.id !== deleteConfirm.id));
      setSnackbar({ open: true, message: 'Airport deleted successfully!', severity: 'success' });
      setDeleteConfirm(null);
    }
  };

  const handleToggleStatus = (id) => {
    const updatedAirports = airports.map(a =>
      a.id === id ? { ...a, status: !a.status } : a
    );
    setAirports(updatedAirports);
    
    const airport = airports.find(a => a.id === id);
    setSnackbar({
      open: true,
      message: `Airport ${airport?.status ? 'deactivated' : 'activated'} successfully!`,
      severity: 'success',
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  const getStatusChip = (status) => {
    return status ? (
      <Chip
        icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
        label="Active"
        color="success"
        size="small"
        sx={{ fontWeight: 600 }}
      />
    ) : (
      <Chip
        icon={<CancelIcon sx={{ fontSize: 16 }} />}
        label="Inactive"
        color="error"
        size="small"
        sx={{ fontWeight: 600 }}
      />
    );
  };

  const getStockPercentage = (current, capacity) => {
    return (current / capacity) * 100;
  };

  const formatNumber = (num) => {
    return num?.toLocaleString() || 0;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header */}
      <Fade in timeout={500}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Airport Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage airports, fuel storage, and operations
          </Typography>
        </Box>
      </Fade>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#1976d2', color: 'white', height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Airports</Typography>
                  <Typography variant="h3" fontWeight="bold">{stats.total}</Typography>
                </Box>
                <AirportIcon sx={{ fontSize: 40, opacity: 0.7 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#4caf50', color: 'white', height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Active</Typography>
                  <Typography variant="h3" fontWeight="bold">{stats.active}</Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.7 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#ff9800', color: 'white', height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Capacity</Typography>
                  <Typography variant="h6" fontWeight="bold">{formatNumber(stats.totalCapacity)} L</Typography>
                </Box>
                <FuelIcon sx={{ fontSize: 40, opacity: 0.7 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#9c27b0', color: 'white', height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Current Stock</Typography>
                  <Typography variant="h6" fontWeight="bold">{formatNumber(stats.totalStock)} L</Typography>
                </Box>
                <LocationIcon sx={{ fontSize: 40, opacity: 0.7 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            placeholder="Search by name, code, city, country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              displayEmpty
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active Only</MenuItem>
              <MenuItem value="inactive">Inactive Only</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={handleResetFilters} startIcon={<RefreshIcon />}>
            Reset
          </Button>
          <Button variant="contained" onClick={() => handleOpenDialog()} startIcon={<AddIcon />}>
            Add Airport
          </Button>
        </Stack>
      </Paper>

      {/* Airports Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Airport</strong></TableCell>
                <TableCell><strong>Code</strong></TableCell>
                <TableCell><strong>Location</strong></TableCell>
                {!isTablet && <TableCell><strong>Runways</strong></TableCell>}
                <TableCell><strong>Fuel Stock</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isMobile ? 5 : 7} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">No airports found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((airport) => {
                  const stockPercentage = getStockPercentage(airport.current_fuel_stock, airport.fuel_storage_capacity);
                  return (
                    <TableRow key={airport.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {airport.airport_name}
                        </Typography>
                        {isTablet && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {airport.city}, {airport.country}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label={airport.airport_code} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        {!isTablet ? `${airport.city}, ${airport.country}` : null}
                        {isTablet && null}
                      </TableCell>
                      {!isTablet && <TableCell>{airport.runway_count}</TableCell>}
                      <TableCell sx={{ minWidth: 150 }}>
                        <Box>
                          <Typography variant="caption" display="block">
                            {formatNumber(airport.current_fuel_stock)} / {formatNumber(airport.fuel_storage_capacity)} L
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={stockPercentage} 
                            sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                            color={stockPercentage > 70 ? 'success' : stockPercentage > 30 ? 'warning' : 'error'}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>{getStatusChip(airport.status)}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Update Fuel Stock">
                            <IconButton size="small" color="warning" onClick={() => handleOpenStockDialog(airport)}>
                              <FuelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" color="primary" onClick={() => handleOpenDialog(airport)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={airport.status ? 'Deactivate' : 'Activate'}>
                            <IconButton
                              size="small"
                              color={airport.status ? 'warning' : 'success'}
                              onClick={() => handleToggleStatus(airport.id)}
                            >
                              {airport.status ? <CancelIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteConfirm({ id: airport.id, name: airport.airport_name })}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Divider />
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Airport Form Dialog */}
      <AirportFormDialog
        open={openDialog}
        airport={selectedAirport}
        onClose={handleCloseDialog}
        onSave={handleSaveAirport}
        loading={formLoading}
      />

      {/* Stock Update Dialog */}
      <StockUpdateDialog
        open={openStockDialog}
        airport={selectedAirport}
        onClose={handleCloseStockDialog}
        onUpdate={handleUpdateStock}
        loading={stockLoading}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle sx={{ bgcolor: '#f44336', color: 'white' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography>
            Are you sure you want to delete <strong>"{deleteConfirm?.name}"</strong>?
          </Typography>
          <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button onClick={handleDeleteAirport} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}