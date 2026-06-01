import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Alert,
  CircularProgress,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';

// Mock data for now (will connect to API later)
const mockSuppliers = [
  {
    id: 1,
    company_name: 'Bharath Petroleum',
    contact_person: 'Rajesh Kumar',
    email: 'contact@bharathpetroleum.com',
    phone: '+91-9876543210',
    address: 'Mumbai, India',
    gst_number: '27AAACA1234A1Z',
    fuel_types: ['Jet A-1', 'Avgas'],
    status: true,
  },
  {
    id: 2,
    company_name: 'HP Petroleum',
    contact_person: 'Sunil Sharma',
    email: 'info@hppetroleum.com',
    phone: '+91-9876543211',
    address: 'Delhi, India',
    gst_number: '27AAACB5678B2Z',
    fuel_types: ['Jet A-1'],
    status: true,
  },
  {
    id: 3,
    company_name: 'Indian Oil',
    contact_person: 'Amit Patel',
    email: 'contact@indianoil.com',
    phone: '+91-9876543212',
    address: 'Bangalore, India',
    gst_number: '27AAACC9012C3Z',
    fuel_types: ['Jet A-1', 'Jet Fuel'],
    status: false,
  },
];

const FUEL_TYPES = ['Jet A-1', 'Avgas', 'Jet Fuel', 'Aviation Gasoline'];

// Supplier Form Component
const SupplierFormDialog = ({ open, supplier, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    gst_number: '',
    fuel_types: [],
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
        fuel_types: supplier.fuel_types || [],
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
      });
    }
    setErrors({});
  }, [supplier, open]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleFuelTypesChange = (event) => {
    setFormData({
      ...formData,
      fuel_types: event.target.value,
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.company_name) newErrors.company_name = 'Company name is required';
    if (!formData.contact_person) newErrors.contact_person = 'Contact person is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.gst_number) newErrors.gst_number = 'GST number is required';
    if (formData.fuel_types.length === 0) newErrors.fuel_types = 'Select at least one fuel type';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {supplier ? 'Edit Supplier' : 'Add New Supplier'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
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
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small" error={!!errors.fuel_types}>
              <InputLabel>Fuel Types</InputLabel>
              <Select
                multiple
                value={formData.fuel_types}
                onChange={handleFuelTypesChange}
                input={<OutlinedInput label="Fuel Types" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
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
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {supplier ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Suppliers Component
export default function Suppliers() {
  const [suppliers, setSuppliers] = useState(mockSuppliers);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch = supplier.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          supplier.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && supplier.status) ||
                          (statusFilter === 'inactive' && !supplier.status);
    return matchesSearch && matchesStatus;
  });

  const paginatedSuppliers = filteredSuppliers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleOpenDialog = (supplier = null) => {
    setSelectedSupplier(supplier);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSupplier(null);
  };

  const handleSaveSupplier = (formData) => {
    if (selectedSupplier) {
      // Update existing supplier
      setSuppliers(suppliers.map(s => 
        s.id === selectedSupplier.id ? { ...s, ...formData } : s
      ));
    } else {
      // Create new supplier
      const newSupplier = {
        id: suppliers.length + 1,
        ...formData,
        status: true,
      };
      setSuppliers([newSupplier, ...suppliers]);
    }
    handleCloseDialog();
  };

  const handleDeleteSupplier = () => {
    if (deleteConfirm) {
      setSuppliers(suppliers.filter(s => s.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    }
  };

  const handleToggleStatus = (id) => {
    setSuppliers(suppliers.map(s =>
      s.id === id ? { ...s, status: !s.status } : s
    ));
  };

  const getStatusChip = (status) => {
    return status ? (
      <Chip label="Active" color="success" size="small" sx={{ fontWeight: 500 }} />
    ) : (
      <Chip label="Inactive" color="error" size="small" sx={{ fontWeight: 500 }} />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
              Supplier Management
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Manage fuel suppliers, contracts, and pricing information
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ px: 4, py: 1 }}
          >
            Add New Supplier
          </Button>
        </Box>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Search by company name, contact person, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Suppliers Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell><strong>Company Name</strong></TableCell>
                <TableCell><strong>Contact Person</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Phone</strong></TableCell>
                <TableCell><strong>GST Number</strong></TableCell>
                <TableCell><strong>Fuel Types</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <Typography color="textSecondary">No suppliers found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSuppliers.map((supplier) => (
                  <TableRow key={supplier.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {supplier.company_name}
                      </Typography>
                    </TableCell>
                    <TableCell>{supplier.contact_person}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>{supplier.gst_number}</TableCell>
                    <TableCell>
                      {supplier.fuel_types.map((type, idx) => (
                        <Chip key={idx} label={type} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </TableCell>
                    <TableCell>{getStatusChip(supplier.status)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={() => handleOpenDialog(supplier)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={supplier.status ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          size="small"
                          color={supplier.status ? 'warning' : 'success'}
                          onClick={() => handleToggleStatus(supplier.id)}
                        >
                          {supplier.status ? <DeleteIcon /> : <AddIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteConfirm({ id: supplier.id, name: supplier.company_name })}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredSuppliers.length}
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
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button onClick={handleDeleteSupplier} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}