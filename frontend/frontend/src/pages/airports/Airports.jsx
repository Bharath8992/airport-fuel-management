// Airports.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import {
  fetchAirports,
  createAirport,
  updateAirport,
  deleteAirport,
  toggleAirportStatus,
  updateAirportFuelStock,
  clearError,
} from '../../store/slices/airportSlice';

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
    const { name, value } = e.target;
    
    if (name === 'airport_code') {
      setFormData({ ...formData, [name]: value.toUpperCase() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.airport_name?.trim()) newErrors.airport_name = 'Airport name is required';
    if (!formData.airport_code?.trim()) newErrors.airport_code = 'Airport code is required';
    if (formData.airport_code.length < 3 || formData.airport_code.length > 4) {
      newErrors.airport_code = 'Airport code must be 3 or 4 characters';
    }
    if (!formData.city?.trim()) newErrors.city = 'City is required';
    if (!formData.country?.trim()) newErrors.country = 'Country is required';
    if (!formData.fuel_storage_capacity) {
      newErrors.fuel_storage_capacity = 'Fuel storage capacity is required';
    } else if (formData.fuel_storage_capacity <= 0) {
      newErrors.fuel_storage_capacity = 'Capacity must be greater than 0';
    }
    if (formData.current_fuel_stock > formData.fuel_storage_capacity) {
      newErrors.current_fuel_stock = 'Current stock cannot exceed capacity';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const submitData = {
        ...formData,
        runway_count: parseInt(formData.runway_count) || 1,
        fuel_storage_capacity: parseFloat(formData.fuel_storage_capacity),
        current_fuel_stock: parseFloat(formData.current_fuel_stock) || 0,
      };
      onSave(submitData);
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
              required
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
              required
              inputProps={{ maxLength: 4, style: { textTransform: 'uppercase' } }}
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
              required
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
              required
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
              inputProps={{ min: 0 }}
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
              required
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
              error={!!errors.current_fuel_stock}
              helperText={errors.current_fuel_stock}
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
    
    let newStock = airport.current_fuel_stock;
    if (operation === 'add') {
      newStock = Math.min(airport.current_fuel_stock + parseFloat(quantity), airport.fuel_storage_capacity);
    } else {
      newStock = Math.max(airport.current_fuel_stock - parseFloat(quantity), 0);
    }
    
    onUpdate(airport.id, newStock);
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
              {operation === 'add' && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  New Stock: <strong>{Math.min((airport?.current_fuel_stock || 0) + (parseFloat(quantity) || 0), airport?.fuel_storage_capacity || 0).toLocaleString()} L</strong>
                </Typography>
              )}
              {operation === 'subtract' && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  New Stock: <strong>{Math.max((airport?.current_fuel_stock || 0) - (parseFloat(quantity) || 0), 0).toLocaleString()} L</strong>
                </Typography>
              )}
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

// View Airport Dialog
const ViewAirportDialog = ({ open, airport, onClose }) => {
  const getStockPercentage = (current, capacity) => {
    return ((current / capacity) * 100).toFixed(1);
  };

  const formatNumber = (num) => {
    return num?.toLocaleString() || 0;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <AirportIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Airport Details
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {airport && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Airport Name</Typography>
              <Typography variant="body1" fontWeight="medium">{airport.airport_name}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Airport Code</Typography>
              <Chip label={airport.airport_code} size="small" />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Location</Typography>
              <Typography variant="body1">{airport.city}, {airport.country}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Runways</Typography>
              <Typography variant="body1">{airport.runway_count}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Status</Typography>
              <Chip
                label={airport.status ? 'Active' : 'Inactive'}
                color={airport.status ? 'success' : 'error'}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Fuel Storage</Typography>
              <Paper sx={{ p: 2, mt: 1, bgcolor: '#f5f5f5' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Capacity</Typography>
                    <Typography variant="h6">{formatNumber(airport.fuel_storage_capacity)} L</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Current Stock</Typography>
                    <Typography variant="h6" color={airport.current_fuel_stock < airport.fuel_storage_capacity * 0.2 ? 'error' : 'primary'}>
                      {formatNumber(airport.current_fuel_stock)} L
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <LinearProgress 
                      variant="determinate" 
                      value={getStockPercentage(airport.current_fuel_stock, airport.fuel_storage_capacity)} 
                      sx={{ height: 8, borderRadius: 4 }}
                      color={airport.current_fuel_stock / airport.fuel_storage_capacity > 0.7 ? 'success' : 'warning'}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {getStockPercentage(airport.current_fuel_stock, airport.fuel_storage_capacity)}% Full
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
              <Typography variant="body2">{new Date(airport.created_at).toLocaleString()}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
              <Typography variant="body2">{new Date(airport.updated_at).toLocaleString()}</Typography>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Airports Component
export default function Airports() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const dispatch = useDispatch();
  const { airports, total, isLoading, error } = useSelector((state) => state.airports);
  
  // Local state
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openStockDialog, setOpenStockDialog] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load airports on mount and when filters change
  useEffect(() => {
    loadAirports();
  }, [page, rowsPerPage, searchTerm, statusFilter]);

  const loadAirports = () => {
    const params = {
      page: page + 1,
      page_size: rowsPerPage,
      search: searchTerm,
      ...(statusFilter !== 'all' && { status: statusFilter === 'active' }),
      ordering: '-created_at',
    };
    dispatch(fetchAirports(params));
  };

  // Update rows per page on screen resize
  useEffect(() => {
    setRowsPerPage(isMobile ? 5 : 10);
  }, [isMobile]);

  // Calculate stats from actual data
  const stats = {
    total: total,
    active: airports.filter(a => a.status).length,
    inactive: airports.filter(a => !a.status).length,
    totalCapacity: airports.reduce((sum, a) => sum + (a.fuel_storage_capacity || 0), 0),
    totalStock: airports.reduce((sum, a) => sum + (a.current_fuel_stock || 0), 0),
  };

  const handleOpenDialog = (airport = null) => {
    setSelectedAirport(airport);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAirport(null);
  };

  const handleOpenViewDialog = (airport) => {
    setSelectedAirport(airport);
    setOpenViewDialog(true);
  };

  const handleOpenStockDialog = (airport) => {
    setSelectedAirport(airport);
    setOpenStockDialog(true);
  };

  const handleCloseStockDialog = () => {
    setOpenStockDialog(false);
    setSelectedAirport(null);
  };

  const handleSaveAirport = async (formData) => {
    setFormLoading(true);
    try {
      if (selectedAirport) {
        await dispatch(updateAirport({ id: selectedAirport.id, data: formData })).unwrap();
        showSnackbar('Airport updated successfully!', 'success');
      } else {
        await dispatch(createAirport(formData)).unwrap();
        showSnackbar('Airport created successfully!', 'success');
      }
      handleCloseDialog();
      loadAirports();
    } catch (err) {
      console.error('Save error:', err);
      const errorMessage = err?.message || err?.errors || 'Operation failed';
      showSnackbar(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage), 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStock = async (id, newStock) => {
    setStockLoading(true);
    try {
      await dispatch(updateAirportFuelStock({ id, current_fuel_stock: newStock })).unwrap();
      showSnackbar('Fuel stock updated successfully!', 'success');
      handleCloseStockDialog();
      loadAirports();
    } catch (err) {
      console.error('Stock update error:', err);
      showSnackbar(err?.message || 'Stock update failed', 'error');
    } finally {
      setStockLoading(false);
    }
  };

  const handleDeleteAirport = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      await dispatch(deleteAirport(deleteConfirm.id)).unwrap();
      showSnackbar('Airport deleted successfully!', 'success');
      setDeleteConfirm(null);
      loadAirports();
    } catch (err) {
      console.error('Delete error:', err);
      showSnackbar(err?.message || 'Delete failed', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await dispatch(toggleAirportStatus(id)).unwrap();
      showSnackbar(`Airport ${currentStatus ? 'deactivated' : 'activated'} successfully!`, 'success');
      loadAirports();
    } catch (err) {
      console.error('Toggle status error:', err);
      showSnackbar(err?.message || 'Status update failed', 'error');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPage(0);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => {
      dispatch(clearError());
    }, 3000);
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

  if (isLoading && airports.length === 0) {
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

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </Alert>
      )}

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
              {airports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isMobile ? 6 : 7} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">No airports found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                airports.map((airport) => {
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
                          <Tooltip title="View Details">
                            <IconButton size="small" color="info" onClick={() => handleOpenViewDialog(airport)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
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
                              onClick={() => handleToggleStatus(airport.id, airport.status)}
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
          count={total}
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

      {/* View Airport Dialog */}
      <ViewAirportDialog
        open={openViewDialog}
        airport={selectedAirport}
        onClose={() => setOpenViewDialog(false)}
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
          <Button onClick={handleDeleteAirport} color="error" variant="contained" disabled={deleteLoading}>
            {deleteLoading ? <CircularProgress size={24} /> : 'Delete'}
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