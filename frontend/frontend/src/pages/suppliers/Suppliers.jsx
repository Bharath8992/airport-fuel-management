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
  InputLabel,
  OutlinedInput,
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
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Clear as ClearIcon,
  LocalShipping as SupplierIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  toggleSupplierStatus,
  clearError,
} from '../../store/slices/supplierSlice';

const FUEL_TYPES = ['Jet A-1', 'Avgas', 'Jet Fuel', 'Aviation Gasoline'];

// Supplier Form Dialog Component
const SupplierFormDialog = ({ open, supplier, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    gst_number: '',
    fuel_types: [],
    status: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (supplier) {
      setFormData({
        company_name: supplier.company_name || '',
        contact_person: supplier.contact_person || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        gst_number: supplier.gst_number || '',
        fuel_types: Array.isArray(supplier.fuel_types) ? supplier.fuel_types : [],
        status: supplier.status !== undefined ? supplier.status : true,
      });
    } else {
      setFormData({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        gst_number: '',
        fuel_types: [],
        status: true,
      });
    }
    setErrors({});
  }, [supplier, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleFuelTypesChange = (event) => {
    const value = event.target.value;
    const fuelTypes = Array.isArray(value) ? value : [value];
    setFormData({ ...formData, fuel_types: fuelTypes });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.company_name.trim()) newErrors.company_name = 'Company name is required';
    if (!formData.contact_person.trim()) newErrors.contact_person = 'Contact person is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.gst_number.trim()) newErrors.gst_number = 'GST number is required';
    if (!formData.fuel_types || formData.fuel_types.length === 0) newErrors.fuel_types = 'Select at least one fuel type';
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
            <SupplierIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            {supplier ? 'Edit Supplier' : 'Add New Supplier'}
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
              label="Company Name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              error={!!errors.company_name}
              helperText={errors.company_name}
              size="small"
              required
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
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="GST Number"
              name="gst_number"
              value={formData.gst_number}
              onChange={handleChange}
              error={!!errors.gst_number}
              helperText={errors.gst_number}
              size="small"
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small" error={!!errors.fuel_types}>
              <InputLabel>Fuel Types</InputLabel>
              <Select
                multiple
                value={formData.fuel_types || []}
                onChange={handleFuelTypesChange}
                input={<OutlinedInput label="Fuel Types" />}
                renderValue={(selected) => {
                  if (!selected || !Array.isArray(selected) || selected.length === 0) {
                    return <em style={{ color: '#999' }}>Select fuel types</em>;
                  }
                  return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  );
                }}
              >
                {FUEL_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
              {errors.fuel_types && (
                <Typography variant="caption" color="error">
                  {errors.fuel_types}
                </Typography>
              )}
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : (supplier ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Delete Confirmation Dialog
const DeleteConfirmDialog = ({ open, supplier, onClose, onConfirm, loading }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: '#f44336', color: 'white' }}>
        Confirm Delete
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Typography>
          Are you sure you want to delete <strong>"{supplier?.company_name}"</strong>?
        </Typography>
        <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// View Supplier Dialog
const ViewSupplierDialog = ({ open, supplier, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Supplier Details
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {supplier && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Company Name</Typography>
              <Typography variant="body1" fontWeight="medium">{supplier.company_name}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Contact Person</Typography>
              <Typography variant="body1">{supplier.contact_person}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Email</Typography>
              <Typography variant="body1">{supplier.email}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
              <Typography variant="body1">{supplier.phone}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Address</Typography>
              <Typography variant="body1">{supplier.address}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">GST Number</Typography>
              <Typography variant="body1">{supplier.gst_number}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Fuel Types</Typography>
              <Box sx={{ mt: 1 }}>
                {Array.isArray(supplier.fuel_types) && supplier.fuel_types.map((type, idx) => (
                  <Chip key={idx} label={type} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Status</Typography>
              <Chip
                label={supplier.status ? 'Active' : 'Inactive'}
                color={supplier.status ? 'success' : 'error'}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
              <Typography variant="body1">{new Date(supplier.created_at).toLocaleDateString()}</Typography>
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

// Main Suppliers Component
export default function Suppliers() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const dispatch = useDispatch();
  const { suppliers, total, isLoading, error } = useSelector((state) => state.suppliers);
  
  // Local state
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load suppliers on mount and when filters change
  useEffect(() => {
    loadSuppliers();
  }, [page, rowsPerPage, searchTerm, statusFilter]);

  const loadSuppliers = () => {
    const params = {
      page: page + 1,
      page_size: rowsPerPage,
      search: searchTerm,
      ...(statusFilter !== 'all' && { status: statusFilter === 'active' }),
    };
    dispatch(fetchSuppliers(params));
  };

  // Update rows per page on screen resize
  useEffect(() => {
    setRowsPerPage(isMobile ? 5 : 10);
  }, [isMobile]);

  // Calculate stats from actual data
  const stats = {
    total: total,
    active: suppliers.filter(s => s.status).length,
    inactive: suppliers.filter(s => !s.status).length,
  };

  const handleOpenDialog = (supplier = null) => {
    setSelectedSupplier(supplier);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSupplier(null);
  };

  const handleOpenViewDialog = (supplier) => {
    setSelectedSupplier(supplier);
    setOpenViewDialog(true);
  };

  const handleSaveSupplier = async (formData) => {
    setFormLoading(true);
    try {
      if (selectedSupplier) {
        await dispatch(updateSupplier({ id: selectedSupplier.id, data: formData })).unwrap();
        showSnackbar('Supplier updated successfully!', 'success');
      } else {
        await dispatch(createSupplier(formData)).unwrap();
        showSnackbar('Supplier created successfully!', 'success');
      }
      handleCloseDialog();
      loadSuppliers();
    } catch (err) {
      showSnackbar(err?.message || 'Operation failed', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSupplier = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      await dispatch(deleteSupplier(deleteConfirm.id)).unwrap();
      showSnackbar('Supplier deleted successfully!', 'success');
      setDeleteConfirm(null);
      loadSuppliers();
    } catch (err) {
      showSnackbar(err?.message || 'Delete failed', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await dispatch(toggleSupplierStatus(id)).unwrap();
      showSnackbar(`Supplier ${currentStatus ? 'deactivated' : 'activated'} successfully!`, 'success');
      loadSuppliers();
    } catch (err) {
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

  if (isLoading && suppliers.length === 0) {
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
            Supplier Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage fuel suppliers, track status, and monitor operations
          </Typography>
        </Box>
      </Fade>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#1976d2', color: 'white', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Suppliers</Typography>
              <Typography variant="h3" fontWeight="bold">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#4caf50', color: 'white', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Active</Typography>
              <Typography variant="h3" fontWeight="bold">{stats.active}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#f44336', color: 'white', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Inactive</Typography>
              <Typography variant="h3" fontWeight="bold">{stats.inactive}</Typography>
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
            placeholder="Search by name, contact or email..."
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
            Add Supplier
          </Button>
        </Stack>
      </Paper>

      {/* Suppliers Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Company</strong></TableCell>
                {!isTablet && <TableCell><strong>Contact</strong></TableCell>}
                <TableCell><strong>Email</strong></TableCell>
                {!isTablet && <TableCell><strong>Phone</strong></TableCell>}
                {!isMobile && <TableCell><strong>GST</strong></TableCell>}
                <TableCell><strong>Fuel Types</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isMobile ? 6 : 8} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">No suppliers found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier) => (
                  <TableRow key={supplier.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {supplier.company_name}
                      </Typography>
                      {isTablet && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {supplier.contact_person}
                        </Typography>
                      )}
                    </TableCell>
                    {!isTablet && <TableCell>{supplier.contact_person}</TableCell>}
                    <TableCell sx={{ maxWidth: 150 }}>
                      <Typography variant="body2" noWrap>
                        {supplier.email}
                      </Typography>
                    </TableCell>
                    {!isTablet && <TableCell>{supplier.phone}</TableCell>}
                    {!isMobile && <TableCell>{supplier.gst_number}</TableCell>}
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {Array.isArray(supplier.fuel_types) && supplier.fuel_types.slice(0, isMobile ? 1 : 2).map((type, idx) => (
                          <Chip key={idx} label={type} size="small" variant="outlined" />
                        ))}
                        {Array.isArray(supplier.fuel_types) && supplier.fuel_types.length > (isMobile ? 1 : 2) && (
                          <Chip label={`+${supplier.fuel_types.length - (isMobile ? 1 : 2)}`} size="small" />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>{getStatusChip(supplier.status)}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="View">
                          <IconButton size="small" color="info" onClick={() => handleOpenViewDialog(supplier)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary" onClick={() => handleOpenDialog(supplier)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={supplier.status ? 'Deactivate' : 'Activate'}>
                          <IconButton
                            size="small"
                            color={supplier.status ? 'warning' : 'success'}
                            onClick={() => handleToggleStatus(supplier.id, supplier.status)}
                          >
                            {supplier.status ? <CancelIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteConfirm({ id: supplier.id, company_name: supplier.company_name })}
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

      {/* Supplier Form Dialog */}
      <SupplierFormDialog
        open={openDialog}
        supplier={selectedSupplier}
        onClose={handleCloseDialog}
        onSave={handleSaveSupplier}
        loading={formLoading}
      />

      {/* View Supplier Dialog */}
      <ViewSupplierDialog
        open={openViewDialog}
        supplier={selectedSupplier}
        onClose={() => setOpenViewDialog(false)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deleteConfirm}
        supplier={deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteSupplier}
        loading={deleteLoading}
      />

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}