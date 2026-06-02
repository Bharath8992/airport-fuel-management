// Transactions.jsx - Fixed version
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
  Tab,
  Tabs,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Clear as ClearIcon,
  LocalGasStation as TransactionIcon,
  Visibility as VisibilityIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  updateTransactionStatus,
  fetchTransactionSummary,
  clearError,
} from '../../store/slices/transactionSlice';
import { fetchSuppliers } from '../../store/slices/supplierSlice';
import { fetchAirlines } from '../../store/slices/airlineSlice';
import { fetchAirports } from '../../store/slices/airportSlice';

const FUEL_TYPES = [
  { value: 'JET_A1', label: 'Jet A-1' },
  { value: 'AVGAS', label: 'Avgas 100LL' },
  { value: 'JET_B', label: 'Jet B' },
];

const STATUS_CHOICES = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'error' },
  { value: 'invoiced', label: 'Invoiced', color: 'info' },
];

// Transaction Form Dialog Component
const TransactionFormDialog = ({ open, transaction, onClose, onSave, loading, suppliers, airlines, airports }) => {
  const [formData, setFormData] = useState({
    supplier: '',
    airline: '',
    airport: '',
    fuel_type: 'JET_A1',
    quantity: '',
    price_per_liter: '',
    gst_rate: 18,
    transaction_date: new Date(),
    status: 'pending',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (transaction) {
      setFormData({
        supplier: transaction.supplier?.id || transaction.supplier || '',
        airline: transaction.airline?.id || transaction.airline || '',
        airport: transaction.airport?.id || transaction.airport || '',
        fuel_type: transaction.fuel_type || 'JET_A1',
        quantity: transaction.quantity || '',
        price_per_liter: transaction.price_per_liter || '',
        gst_rate: transaction.gst_rate || 18,
        transaction_date: new Date(transaction.transaction_date) || new Date(),
        status: transaction.status || 'pending',
      });
    } else {
      setFormData({
        supplier: '',
        airline: '',
        airport: '',
        fuel_type: 'JET_A1',
        quantity: '',
        price_per_liter: '',
        gst_rate: 18,
        transaction_date: new Date(),
        status: 'pending',
      });
    }
    setErrors({});
  }, [transaction, open]);

  const calculateTotal = () => {
    const quantity = parseFloat(formData.quantity) || 0;
    const price = parseFloat(formData.price_per_liter) || 0;
    const gst = parseFloat(formData.gst_rate) || 0;
    
    const subtotal = quantity * price;
    const gstAmount = (subtotal * gst) / 100;
    const total = subtotal + gstAmount;
    
    return { subtotal, gstAmount, total };
  };

  const { subtotal, gstAmount, total } = calculateTotal();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.supplier) newErrors.supplier = 'Supplier is required';
    if (!formData.airline) newErrors.airline = 'Airline is required';
    if (!formData.airport) newErrors.airport = 'Airport is required';
    if (!formData.quantity) newErrors.quantity = 'Quantity is required';
    if (formData.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (!formData.price_per_liter) newErrors.price_per_liter = 'Price per liter is required';
    if (formData.price_per_liter <= 0) newErrors.price_per_liter = 'Price must be greater than 0';
    if (formData.gst_rate < 0 || formData.gst_rate > 100) newErrors.gst_rate = 'GST rate must be between 0 and 100';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const submitData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        price_per_liter: parseFloat(formData.price_per_liter),
        gst_rate: parseFloat(formData.gst_rate),
        transaction_date: formData.transaction_date.toISOString(),
      };
      onSave(submitData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth TransitionComponent={Grow}>
      <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <TransactionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            {transaction ? 'Edit Transaction' : 'Add New Transaction'}
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small" error={!!errors.supplier}>
              <InputLabel>Supplier</InputLabel>
              <Select
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                label="Supplier"
              >
                {suppliers && suppliers.map((supplier) => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.company_name}
                  </MenuItem>
                ))}
              </Select>
              {errors.supplier && <Typography variant="caption" color="error">{errors.supplier}</Typography>}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small" error={!!errors.airline}>
              <InputLabel>Airline</InputLabel>
              <Select
                name="airline"
                value={formData.airline}
                onChange={handleChange}
                label="Airline"
              >
                {airlines && airlines.map((airline) => (
                  <MenuItem key={airline.id} value={airline.id}>
                    {airline.airline_name}
                  </MenuItem>
                ))}
              </Select>
              {errors.airline && <Typography variant="caption" color="error">{errors.airline}</Typography>}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small" error={!!errors.airport}>
              <InputLabel>Airport</InputLabel>
              <Select
                name="airport"
                value={formData.airport}
                onChange={handleChange}
                label="Airport"
              >
                {airports && airports.map((airport) => (
                  <MenuItem key={airport.id} value={airport.id}>
                    {airport.airport_name} ({airport.airport_code})
                  </MenuItem>
                ))}
              </Select>
              {errors.airport && <Typography variant="caption" color="error">{errors.airport}</Typography>}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Fuel Type</InputLabel>
              <Select
                name="fuel_type"
                value={formData.fuel_type}
                onChange={handleChange}
                label="Fuel Type"
              >
                {FUEL_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Quantity (Liters)"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              error={!!errors.quantity}
              helperText={errors.quantity}
              size="small"
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Price per Liter (₹)"
              name="price_per_liter"
              type="number"
              value={formData.price_per_liter}
              onChange={handleChange}
              error={!!errors.price_per_liter}
              helperText={errors.price_per_liter}
              size="small"
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="GST Rate (%)"
              name="gst_rate"
              type="number"
              value={formData.gst_rate}
              onChange={handleChange}
              error={!!errors.gst_rate}
              helperText={errors.gst_rate}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <DatePicker
              label="Transaction Date"
              value={formData.transaction_date}
              onChange={(newValue) => setFormData({ ...formData, transaction_date: newValue })}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
          
          {/* Calculation Preview */}
          {(formData.quantity && formData.price_per_liter) && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle2" gutterBottom>Transaction Summary</Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2">Subtotal:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" align="right">₹ {subtotal.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">GST Amount ({formData.gst_rate}%):</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" align="right">₹ {gstAmount.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Total Amount:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" align="right" color="primary">₹ {total.toLocaleString()}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : (transaction ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// View Transaction Dialog
const ViewTransactionDialog = ({ open, transaction, onClose }) => {
  // Safe number formatting function
  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0';
    return Number(value).toLocaleString();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Transaction Details
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {transaction && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Transaction Number</Typography>
              <Typography variant="body1" fontWeight="medium">{transaction.transaction_number || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Status</Typography>
              <Chip 
                label={transaction.status_display || transaction.status || 'N/A'} 
                color={transaction.status === 'completed' ? 'success' : transaction.status === 'cancelled' ? 'error' : 'warning'} 
                size="small" 
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Supplier</Typography>
              <Typography variant="body1">{transaction.supplier_name || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Airline</Typography>
              <Typography variant="body1">{transaction.airline_name || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Airport</Typography>
              <Typography variant="body1">{transaction.airport_name || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Fuel Type</Typography>
              <Typography variant="body1">{transaction.fuel_type_display || transaction.fuel_type || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Quantity</Typography>
              <Typography variant="body1">{formatNumber(transaction.quantity)} Liters</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Price per Liter</Typography>
              <Typography variant="body1">₹ {formatNumber(transaction.price_per_liter)}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" gutterBottom>Financial Details</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Subtotal</Typography>
              <Typography variant="body1">₹ {formatNumber(transaction.subtotal)}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">GST Amount</Typography>
              <Typography variant="body1">₹ {formatNumber(transaction.gst_amount)}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Total Amount</Typography>
              <Typography variant="h6" color="primary">₹ {formatNumber(transaction.total_amount)}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Transaction Date</Typography>
              <Typography variant="body1">{transaction.transaction_date ? new Date(transaction.transaction_date).toLocaleString() : 'N/A'}</Typography>
            </Grid>
            {transaction.invoice_number && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Invoice Number</Typography>
                <Typography variant="body1" fontWeight="medium">{transaction.invoice_number}</Typography>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Transactions Component
export default function Transactions() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const dispatch = useDispatch();
  const { transactions, total, isLoading, error } = useSelector((state) => state.transactions);
  const { suppliers } = useSelector((state) => state.suppliers);
  const { airlines } = useSelector((state) => state.airlines);
  const { airports } = useSelector((state) => state.airports);
  
  // Local state
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Load data on mount
  useEffect(() => {
    loadTransactions();
    loadDropdownData();
  }, [page, rowsPerPage, searchTerm, statusFilter, fuelTypeFilter]);

  const loadTransactions = () => {
    const params = {
      page: page + 1,
      page_size: rowsPerPage,
      search: searchTerm,
      status: statusFilter,
      fuel_type: fuelTypeFilter,
      ordering: '-transaction_date',
    };
    dispatch(fetchTransactions(params));
  };

  const loadDropdownData = () => {
    dispatch(fetchSuppliers({ page_size: 100 }));
    dispatch(fetchAirlines({ page_size: 100 }));
    dispatch(fetchAirports({ page_size: 100 }));
  };

  const handleOpenDialog = (transaction = null) => {
    setSelectedTransaction(transaction);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTransaction(null);
  };

  const handleSaveTransaction = async (formData) => {
    setFormLoading(true);
    try {
      if (selectedTransaction) {
        await dispatch(updateTransaction({ id: selectedTransaction.id, data: formData })).unwrap();
        showSnackbar('Transaction updated successfully!', 'success');
      } else {
        await dispatch(createTransaction(formData)).unwrap();
        showSnackbar('Transaction created successfully!', 'success');
      }
      handleCloseDialog();
      loadTransactions();
    } catch (err) {
      console.error('Save error:', err);
      showSnackbar(err?.message || 'Operation failed', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      await dispatch(deleteTransaction(deleteConfirm.id)).unwrap();
      showSnackbar('Transaction deleted successfully!', 'success');
      setDeleteConfirm(null);
      loadTransactions();
    } catch (err) {
      showSnackbar(err?.message || 'Delete failed', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await dispatch(updateTransactionStatus({ id, status: newStatus })).unwrap();
      showSnackbar(`Transaction status updated to ${newStatus}!`, 'success');
      loadTransactions();
    } catch (err) {
      showSnackbar(err?.message || 'Status update failed', 'error');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setFuelTypeFilter('');
    setPage(0);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => {
      dispatch(clearError());
    }, 3000);
  };

  const getStatusChip = (status) => {
    const statusConfig = STATUS_CHOICES.find(s => s.value === status);
    return (
      <Chip
        key={`status-${status}`}
        label={statusConfig?.label || status}
        color={statusConfig?.color || 'default'}
        size="small"
        sx={{ fontWeight: 600 }}
      />
    );
  };

  // Safe number formatter for table display
  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0';
    return Number(value).toLocaleString();
  };

  if (isLoading && transactions.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
              Fuel Transactions
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage fuel transactions, track deliveries, and generate invoices
            </Typography>
          </Box>
        </Fade>

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
              placeholder="Search by transaction number, supplier, airline..."
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
                <MenuItem value="">All Status</MenuItem>
                {STATUS_CHOICES.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <Select
                value={fuelTypeFilter}
                onChange={(e) => setFuelTypeFilter(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">All Fuel Types</MenuItem>
                {FUEL_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="outlined" onClick={handleResetFilters} startIcon={<RefreshIcon />}>
              Reset
            </Button>
            <Button variant="contained" onClick={() => handleOpenDialog()} startIcon={<AddIcon />}>
              Add Transaction
            </Button>
          </Stack>
        </Paper>

        {/* Transactions Table */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell><strong>Transaction #</strong></TableCell>
                  <TableCell><strong>Supplier</strong></TableCell>
                  <TableCell><strong>Airline</strong></TableCell>
                  {!isTablet && <TableCell><strong>Airport</strong></TableCell>}
                  <TableCell><strong>Quantity</strong></TableCell>
                  {!isMobile && <TableCell><strong>Total Amount</strong></TableCell>}
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!transactions || transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isMobile ? 6 : 9} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">No transactions found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id || transaction.transaction_number} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {transaction.transaction_number || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>{transaction.supplier_name || 'N/A'}</TableCell>
                      <TableCell>{transaction.airline_name || 'N/A'}</TableCell>
                      {!isTablet && <TableCell>{transaction.airport_name || 'N/A'}</TableCell>}
                      <TableCell>{formatNumber(transaction.quantity)} L</TableCell>
                      {!isMobile && (
                        <TableCell>
                          ₹ {formatNumber(transaction.total_amount)}
                        </TableCell>
                      )}
                      <TableCell>{getStatusChip(transaction.status)}</TableCell>
                      <TableCell>
                        {transaction.transaction_date ? new Date(transaction.transaction_date).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="View">
                            <IconButton size="small" color="info" onClick={() => {
                              setSelectedTransaction(transaction);
                              setOpenViewDialog(true);
                            }}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" color="primary" onClick={() => handleOpenDialog(transaction)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {transaction.status === 'pending' && (
                            <React.Fragment key={`actions-${transaction.id}`}>
                              <Tooltip title="Mark as Completed">
                                <IconButton size="small" color="success" onClick={() => handleUpdateStatus(transaction.id, 'completed')}>
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Cancel">
                                <IconButton size="small" color="error" onClick={() => handleUpdateStatus(transaction.id, 'cancelled')}>
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </React.Fragment>
                          )}
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteConfirm({ id: transaction.id, transaction_number: transaction.transaction_number })}
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
            count={total || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>

        {/* Transaction Form Dialog */}
        <TransactionFormDialog
          open={openDialog}
          transaction={selectedTransaction}
          onClose={handleCloseDialog}
          onSave={handleSaveTransaction}
          loading={formLoading}
          suppliers={suppliers || []}
          airlines={airlines || []}
          airports={airports || []}
        />

        {/* View Transaction Dialog */}
        <ViewTransactionDialog
          open={openViewDialog}
          transaction={selectedTransaction}
          onClose={() => setOpenViewDialog(false)}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
          <DialogTitle sx={{ bgcolor: '#f44336', color: 'white' }}>
            Confirm Delete
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography>
              Are you sure you want to delete transaction <strong>"{deleteConfirm?.transaction_number}"</strong>?
            </Typography>
            <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button onClick={handleDeleteTransaction} color="error" variant="contained" disabled={deleteLoading}>
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
          <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}