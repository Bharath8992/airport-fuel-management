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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,  // Add this line
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.airline_name.trim()) newErrors.airline_name = 'Airline name is required';
    if (!formData.airline_code.trim()) newErrors.airline_code = 'Airline code is required';
    if (formData.airline_code.length !== 3) newErrors.airline_code = 'Airline code must be 3 characters';
    if (!formData.contact_person.trim()) newErrors.contact_person = 'Contact person is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
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

// Main Airlines Component
export default function Airlines() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [airlines, setAirlines] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAirline, setSelectedAirline] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formLoading, setFormLoading] = useState(false);

  // Load airlines from localStorage
  useEffect(() => {
    loadAirlines();
  }, []);

  const loadAirlines = () => {
    setLoading(true);
    const savedAirlines = localStorage.getItem('airlines');
    if (savedAirlines) {
      setAirlines(JSON.parse(savedAirlines));
    } else {
      const defaultAirlines = [
        {
          id: 1,
          airline_name: 'Indigo Airlines',
          airline_code: '6E',
          contact_person: 'Rahul Mehta',
          email: 'operations@indigo.com',
          phone: '+91-9876543210',
          address: 'Gurugram, India',
          credit_limit: 5000000,
          payment_terms: 30,
          status: true,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          airline_name: 'Air India',
          airline_code: 'AI',
          contact_person: 'Priya Sharma',
          email: 'contact@airindia.com',
          phone: '+91-9876543211',
          address: 'New Delhi, India',
          credit_limit: 10000000,
          payment_terms: 45,
          status: true,
          created_at: new Date().toISOString(),
        },
        {
          id: 3,
          airline_name: 'SpiceJet',
          airline_code: 'SG',
          contact_person: 'Ajay Singh',
          email: 'info@spicejet.com',
          phone: '+91-9876543212',
          address: 'Gurugram, India',
          credit_limit: 3000000,
          payment_terms: 30,
          status: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 4,
          airline_name: 'Vistara',
          airline_code: 'UK',
          contact_person: 'Vinod Kannan',
          email: 'contact@vistara.com',
          phone: '+91-9876543213',
          address: 'Gurugram, India',
          credit_limit: 4000000,
          payment_terms: 30,
          status: true,
          created_at: new Date().toISOString(),
        },
      ];
      setAirlines(defaultAirlines);
      localStorage.setItem('airlines', JSON.stringify(defaultAirlines));
    }
    setLoading(false);
  };

  // Save to localStorage
  useEffect(() => {
    if (airlines.length > 0) {
      localStorage.setItem('airlines', JSON.stringify(airlines));
    }
  }, [airlines]);

  // Filter airlines
  useEffect(() => {
    let filtered = [...airlines];

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.airline_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.airline_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(a =>
        statusFilter === 'active' ? a.status : !a.status
      );
    }

    setFilteredData(filtered);
    setPage(0);
  }, [airlines, searchTerm, statusFilter]);

  useEffect(() => {
    setRowsPerPage(isMobile ? 5 : 10);
  }, [isMobile]);

  const stats = {
    total: airlines.length,
    active: airlines.filter(a => a.status).length,
    inactive: airlines.filter(a => !a.status).length,
    totalCredit: airlines.reduce((sum, a) => sum + (a.credit_limit || 0), 0),
  };

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleOpenDialog = (airline = null) => {
    setSelectedAirline(airline);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAirline(null);
  };

  const handleSaveAirline = (formData) => {
    setFormLoading(true);
    
    setTimeout(() => {
      if (selectedAirline) {
        const updatedAirlines = airlines.map(a =>
          a.id === selectedAirline.id 
            ? { ...a, ...formData, updated_at: new Date().toISOString() }
            : a
        );
        setAirlines(updatedAirlines);
        setSnackbar({ open: true, message: 'Airline updated successfully!', severity: 'success' });
      } else {
        const newAirline = {
          id: Date.now(),
          ...formData,
          status: true,
          created_at: new Date().toISOString(),
        };
        setAirlines([newAirline, ...airlines]);
        setSnackbar({ open: true, message: 'Airline created successfully!', severity: 'success' });
      }
      setFormLoading(false);
      handleCloseDialog();
    }, 500);
  };

  const handleDeleteAirline = () => {
    if (deleteConfirm) {
      setAirlines(airlines.filter(a => a.id !== deleteConfirm.id));
      setSnackbar({ open: true, message: 'Airline deleted successfully!', severity: 'success' });
      setDeleteConfirm(null);
    }
  };

  const handleToggleStatus = (id) => {
    const updatedAirlines = airlines.map(a =>
      a.id === id ? { ...a, status: !a.status } : a
    );
    setAirlines(updatedAirlines);
    
    const airline = airlines.find(a => a.id === id);
    setSnackbar({
      open: true,
      message: `Airline ${airline?.status ? 'deactivated' : 'activated'} successfully!`,
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
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
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isMobile ? 6 : 9} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">No airlines found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((airline) => (
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
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary" onClick={() => handleOpenDialog(airline)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={airline.status ? 'Deactivate' : 'Activate'}>
                          <IconButton
                            size="small"
                            color={airline.status ? 'warning' : 'success'}
                            onClick={() => handleToggleStatus(airline.id)}
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

      {/* Airline Form Dialog */}
      <AirlineFormDialog
        open={openDialog}
        airline={selectedAirline}
        onClose={handleCloseDialog}
        onSave={handleSaveAirline}
        loading={formLoading}
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
          <Button onClick={handleDeleteAirline} color="error" variant="contained">
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