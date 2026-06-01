
import React, { useEffect, useState } from "react";

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
} from "@mui/material";

import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";


// ================= DEFAULT DATA =================

const defaultTransactions = [
  {
    id: 1,
    airline: "IndiGo",
    fuelCompany: "Bharat Petroleum",
    quantity: 5000,
    amount: 450000,
    status: "Completed",
    date: "2026-05-29",
  },
  {
    id: 2,
    airline: "Air India",
    fuelCompany: "HP Petroleum",
    quantity: 7200,
    amount: 650000,
    status: "Pending",
    date: "2026-05-28",
  },
  {
    id: 3,
    airline: "SpiceJet",
    fuelCompany: "Indian Oil",
    quantity: 3500,
    amount: 310000,
    status: "Completed",
    date: "2026-05-27",
  },
];


// ================= COMPONENT =================

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openDialog, setOpenDialog] = useState(false);

  const [formData, setFormData] = useState({
    airline: "",
    fuelCompany: "",
    quantity: "",
    amount: "",
    status: "Pending",
    date: new Date(),
  });

  // ================= LOAD DATA =================

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    setTransactions(defaultTransactions);
  };

  // ================= SEARCH FILTER =================

  const filteredTransactions = transactions.filter((item) => {
    const matchSearch =
      item.airline.toLowerCase().includes(search.toLowerCase()) ||
      item.fuelCompany.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "All" || item.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // ================= PAGINATION =================

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // ================= FORM =================

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTransaction = () => {
    const newTransaction = {
      id: transactions.length + 1,
      ...formData,
      date: formData.date.toISOString().split("T")[0],
    };

    setTransactions([newTransaction, ...transactions]);

    setFormData({
      airline: "",
      fuelCompany: "",
      quantity: "",
      amount: "",
      status: "Pending",
      date: new Date(),
    });

    handleCloseDialog();
  };

  // ================= DELETE =================

  const handleDelete = (id) => {
    const updated = transactions.filter((item) => item.id !== id);
    setTransactions(updated);
  };

  // ================= UI =================

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={3}>

        {/* HEADER */}

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4" fontWeight="bold">
            Fuel Transactions
          </Typography>

          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={loadTransactions}
            >
              Refresh
            </Button>

            <Button
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              Add Transaction
            </Button>
          </Box>
        </Box>

        {/* FILTERS */}

        <Paper sx={{ p: 2, mb: 3 }}>

          <Box display="flex" gap={2} flexWrap="wrap">

            <TextField
              fullWidth
              placeholder="Search airline or fuel company"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl sx={{ minWidth: 180 }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
              </Select>
            </FormControl>

          </Box>
        </Paper>

        {/* TABLE */}

        <Paper>

          <TableContainer>

            <Table>

              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Airline</TableCell>
                  <TableCell>Fuel Company</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>

                {filteredTransactions
                  .slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                  .map((row) => (
                    <TableRow key={row.id} hover>

                      <TableCell>{row.id}</TableCell>

                      <TableCell>{row.airline}</TableCell>

                      <TableCell>{row.fuelCompany}</TableCell>

                      <TableCell>{row.quantity} L</TableCell>

                      <TableCell>
                        ₹ {row.amount.toLocaleString()}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={row.status}
                          color={
                            row.status === "Completed"
                              ? "success"
                              : "warning"
                          }
                        />
                      </TableCell>

                      <TableCell>{row.date}</TableCell>

                      <TableCell align="center">

                        <Tooltip title="Edit">
                          <IconButton color="primary">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(row.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>

                      </TableCell>

                    </TableRow>
                  ))}

              </TableBody>

            </Table>

          </TableContainer>

          <TablePagination
            component="div"
            count={filteredTransactions.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />

        </Paper>

        {/* DIALOG */}

        <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>

          <DialogTitle>Add Transaction</DialogTitle>

          <DialogContent>

            <Box display="flex" flexDirection="column" gap={2} mt={1}>

              <TextField
                label="Airline"
                value={formData.airline}
                onChange={(e) =>
                  handleInputChange("airline", e.target.value)
                }
              />

              <TextField
                label="Fuel Company"
                value={formData.fuelCompany}
                onChange={(e) =>
                  handleInputChange("fuelCompany", e.target.value)
                }
              />

              <TextField
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  handleInputChange("quantity", e.target.value)
                }
              />

              <TextField
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  handleInputChange("amount", e.target.value)
                }
              />

              <FormControl>

                <Select
                  value={formData.status}
                  onChange={(e) =>
                    handleInputChange("status", e.target.value)
                  }
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>

              </FormControl>

              <DatePicker
                label="Transaction Date"
                value={formData.date}
                onChange={(newValue) =>
                  handleInputChange("date", newValue)
                }
              />

            </Box>

          </DialogContent>

          <DialogActions>

            <Button onClick={handleCloseDialog}>
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleAddTransaction}
            >
              Save
            </Button>

          </DialogActions>

        </Dialog>

      </Box>
    </LocalizationProvider>
  );
};

export default Transactions;

