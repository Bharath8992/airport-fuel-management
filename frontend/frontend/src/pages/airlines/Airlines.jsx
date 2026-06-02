// Airlines.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  
  Visibility as VisibilityIcon,  
} from '@mui/icons-material';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Clear as ClearIcon,
  Flight as FlightIcon,
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import {
  fetchAirlines,
  createAirline,
  updateAirline,
  deleteAirline,
  toggleAirlineStatus,
  clearError,
} from '../../store/slices/airlineSlice';

// Airline Form Dialog Component
const AirlineFormDialog = ({ open, airline, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    airline_name: '',
    airline_code: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    credit_limit: '',
    payment_terms: 30,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (airline) {
      setFormData({
        airline_name: airline.airline_name || '',
        airline_code: airline.airline_code || '',
        contact_person: airline.contact_person || '',
        email: airline.email || '',
        phone: airline.phone || '',
        address: airline.address || '',
        credit_limit: airline.credit_limit || '',
        payment_terms: airline.payment_terms || 30,
      });
    } else {
      setFormData({
        airline_name: '',
        airline_code: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        credit_limit: '',
        payment_terms: 30,
      });
    }
    setErrors({});
  }, [airline, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Convert airline code to uppercase
    if (name === 'airline_code') {
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
    
    if (!formData.airline_name?.trim()) {
      newErrors.airline_name = 'Airline name is required';
    }
    
    if (!formData.airline_code?.trim()) {
      newErrors.airline_code = 'Airline code is required';
    } else if (formData.airline_code.length !== 3) {
      newErrors.airline_code = 'Airline code must be exactly 3 characters';
    } else if (!/^[A-Z]{3}$/.test(formData.airline_code)) {
      newErrors.airline_code = 'Airline code must contain only letters';
    }
    
    if (!formData.contact_person?.trim()) {
      newErrors.contact_person = 'Contact person is required';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!formData.phone.match(/^\d+$/)) {
      newErrors.phone = 'Phone must contain only digits';
    }
    
    if (formData.credit_limit && formData.credit_limit < 0) {
      newErrors.credit_limit = 'Credit limit cannot be negative';
    }
    
    if (formData.payment_terms && formData.payment_terms < 0) {
      newErrors.payment_terms = 'Payment terms cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const submitData = {
        ...formData,
        credit_limit: parseFloat(formData.credit_limit) || 0,
        payment_terms: parseInt(formData.payment_terms) || 30,
      };
      onSave(submitData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth TransitionComponent={Grow}>
      <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <FlightIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            {airline ? 'Edit Airline' : 'Add New Airline'}
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
              label="Airline Name"
              name="airline_name"
              value={formData.airline_name}
              onChange={handleChange}
              error={!!errors.airline_name}
              helperText={errors.airline_name}
              size="small"
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Airline Code (3 letters)"
              name="airline_code"
              value={formData.airline_code}
              onChange={handleChange}
              error={!!errors.airline_code}
              helperText={errors.airline_code}
              size="small"
              required
              inputProps={{ maxLength: 3, style: { textTransform: 'uppercase' } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Contact Person"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              error={!!errors.contact_person}
              helperText={errors.contact_person}
              size="small"
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              size="small"
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              size="small"
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Credit Limit (₹)"
              name="credit_limit"
              type="number"
              value={formData.credit_limit}
              onChange={handleChange}
              error={!!errors.credit_limit}
              helperText={errors.credit_limit}
              size="small"
              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Payment Terms (days)"
              name="payment_terms"
              type="number"
              value={formData.payment_terms}
              onChange={handleChange}
              error={!!errors.payment_terms}
              helperText={errors.payment_terms}
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              multiline
              rows={2}
              value={formData.address}
              onChange={handleChange}
              size="small"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : (airline ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// View Airline Dialog
const ViewAirlineDialog = ({ open, airline, onClose }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <FlightIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Airline Details
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {airline && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Airline Name</Typography>
              <Typography variant="body1" fontWeight="medium">{airline.airline_name}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Airline Code</Typography>
              <Chip label={airline.airline_code} size="small" />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Contact Person</Typography>
              <Typography variant="body1">{airline.contact_person}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Email</Typography>
              <Typography variant="body1">{airline.email}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
              <Typography variant="body1">{airline.phone}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Status</Typography>
              <Chip
                label={airline.status ? 'Active' : 'Inactive'}
                color={airline.status ? 'success' : 'error'}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Credit Limit</Typography>
              <Typography variant="body1" color="primary" fontWeight="bold">
                {formatCurrency(airline.credit_limit || 0)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Payment Terms</Typography>
              <Typography variant="body1">{airline.payment_terms} days</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Address</Typography>
              <Typography variant="body1">{airline.address || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
              <Typography variant="body2">{new Date(airline.created_at).toLocaleString()}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
              <Typography variant="body2">{new Date(airline.updated_at).toLocaleString()}</Typography>
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

// Main Airlines Component
export default function Airlines() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const dispatch = useDispatch();
  const { airlines, total, isLoading, error } = useSelector((state) => state.airlines);
  
  // Local state
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedAirline, setSelectedAirline] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load airlines on mount and when filters change
  useEffect(() => {
    loadAirlines();
  }, [page, rowsPerPage, searchTerm, statusFilter]);

  const loadAirlines = () => {
    const params = {
      page: page + 1,
      page_size: rowsPerPage,
      search: searchTerm,
      ...(statusFilter !== 'all' && { status: statusFilter === 'active' }),
      ordering: '-created_at',
    };
    dispatch(fetchAirlines(params));
  };

  // Update rows per page on screen resize
  useEffect(() => {
    setRowsPerPage(isMobile ? 5 : 10);
  }, [isMobile]);

  // Calculate stats from actual data
  const stats = {
    total: total,
    active: airlines.filter(a => a.status).length,
    inactive: airlines.filter(a => !a.status).length,
    totalCredit: airlines.reduce((sum, a) => sum + (a.credit_limit || 0), 0),
  };

  const handleOpenDialog = (airline = null) => {
    setSelectedAirline(airline);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAirline(null);
  };

  const handleSaveAirline = async (formData) => {
    setFormLoading(true);
    try {
      if (selectedAirline) {
        await dispatch(updateAirline({ id: selectedAirline.id, data: formData })).unwrap();
        showSnackbar('Airline updated successfully!', 'success');
      } else {
        await dispatch(createAirline(formData)).unwrap();
        showSnackbar('Airline created successfully!', 'success');
      }
      handleCloseDialog();
      loadAirlines();
    } catch (err) {
      console.error('Save error:', err);
      const errorMessage = err?.message || err?.errors || 'Operation failed';
      showSnackbar(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage), 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAirline = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      await dispatch(deleteAirline(deleteConfirm.id)).unwrap();
      showSnackbar('Airline deleted successfully!', 'success');
      setDeleteConfirm(null);
      loadAirlines();
    } catch (err) {
      console.error('Delete error:', err);
      showSnackbar(err?.message || 'Delete failed', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await dispatch(toggleAirlineStatus(id)).unwrap();
      showSnackbar(`Airline ${currentStatus ? 'deactivated' : 'activated'} successfully!`, 'success');
      loadAirlines();
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (isLoading && airlines.length === 0) {
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
            Airline Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage airlines, credit limits, and payment terms
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
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Airlines</Typography>
                  <Typography variant="h3" fontWeight="bold">{stats.total}</Typography>
                </Box>
                <FlightIcon sx={{ fontSize: 40, opacity: 0.7 }} />
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
          <Card sx={{ bgcolor: '#f44336', color: 'white', height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Inactive</Typography>
                  <Typography variant="h3" fontWeight="bold">{stats.inactive}</Typography>
                </Box>
                <CancelIcon sx={{ fontSize: 40, opacity: 0.7 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#ff9800', color: 'white', height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Credit</Typography>
                  <Typography variant="h6" fontWeight="bold">{formatCurrency(stats.totalCredit)}</Typography>
                </Box>
                <CreditCardIcon sx={{ fontSize: 40, opacity: 0.7 }} />
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
            placeholder="Search by name, code, contact or email..."
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
            Add Airline
          </Button>
        </Stack>
      </Paper>

      {/* Airlines Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Airline</strong></TableCell>
                <TableCell><strong>Code</strong></TableCell>
                {!isTablet && <TableCell><strong>Contact</strong></TableCell>}
                <TableCell><strong>Email</strong></TableCell>
                {!isTablet && <TableCell><strong>Phone</strong></TableCell>}
                {!isMobile && <TableCell><strong>Credit Limit</strong></TableCell>}
                {!isMobile && <TableCell><strong>Payment Terms</strong></TableCell>}
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {airlines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isMobile ? 6 : 9} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">No airlines found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                airlines.map((airline) => (
                  <TableRow key={airline.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {airline.airline_name}
                      </Typography>
                      {isTablet && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {airline.contact_person}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={airline.airline_code} size="small" variant="outlined" />
                    </TableCell>
                    {!isTablet && <TableCell>{airline.contact_person}</TableCell>}
                    <TableCell sx={{ maxWidth: 150 }}>
                      <Typography variant="body2" noWrap>
                        {airline.email}
                      </Typography>
                    </TableCell>
                    {!isTablet && <TableCell>{airline.phone}</TableCell>}
                    {!isMobile && <TableCell>{formatCurrency(airline.credit_limit || 0)}</TableCell>}
                    {!isMobile && <TableCell>{airline.payment_terms} days</TableCell>}
                    <TableCell>{getStatusChip(airline.status)}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="View">
                          <IconButton 
                            size="small" 
                            color="info" 
                            onClick={() => {
                              setSelectedAirline(airline);
                              setOpenViewDialog(true);
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary" onClick={() => handleOpenDialog(airline)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={airline.status ? 'Deactivate' : 'Activate'}>
                          <IconButton
                            size="small"
                            color={airline.status ? 'warning' : 'success'}
                            onClick={() => handleToggleStatus(airline.id, airline.status)}
                          >
                            {airline.status ? <CancelIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteConfirm({ id: airline.id, name: airline.airline_name })}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
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

      {/* Airline Form Dialog */}
      <AirlineFormDialog
        open={openDialog}
        airline={selectedAirline}
        onClose={handleCloseDialog}
        onSave={handleSaveAirline}
        loading={formLoading}
      />

      {/* View Airline Dialog */}
      <ViewAirlineDialog
        open={openViewDialog}
        airline={selectedAirline}
        onClose={() => setOpenViewDialog(false)}
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
          <Button onClick={handleDeleteAirline} color="error" variant="contained" disabled={deleteLoading}>
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