import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box, Paper, Typography, Button, Grid, MenuItem, TextField,
  Table, TableHead, TableRow, TableCell, TableBody, Chip,
  CircularProgress, Alert, Snackbar, Divider, Stack,
} from "@mui/material";
import DownloadIcon        from "@mui/icons-material/Download";
import ReceiptLongIcon     from "@mui/icons-material/ReceiptLong";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

const BASE_URL = "http://127.0.0.1:8000/api";

const api = axios.create({ baseURL: BASE_URL });
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

const fmt  = (iso) => iso
  ? new Date(iso).toLocaleString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })
  : "—";
const fmtN = (v) =>
  `₹${parseFloat(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

// today's date as YYYY-MM-DD for the date input default
const todayStr = () => new Date().toISOString().split("T")[0];

export default function Invoices() {

  const [invoices,   setInvoices]   = useState([]);
  const [suppliers,  setSuppliers]  = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [generating, setGenerating] = useState(false);
  const [snack,      setSnack]      = useState({ open:false, msg:"", sev:"success" });

  const [form, setForm] = useState({
    report_type: "daily",
    supplier_id: "",
    date: todayStr(),   // defaults to today, user can change
  });

  useEffect(() => { loadInvoices(); loadSuppliers(); }, []);

  // ── Loaders ────────────────────────────────────────────────────────────────
  const loadInvoices = async () => {
    setLoading(true);
    try {
      const r = await api.get("/invoices/");
      // handle plain array OR paginated { results: [...] }
      setInvoices(Array.isArray(r.data) ? r.data : (r.data.results ?? []));
    } catch {
      toast("Failed to load invoices.", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const r = await api.get("/suppliers/");
      // handle plain array OR paginated { results: [...] }
      const list = Array.isArray(r.data) ? r.data : (r.data.results ?? []);
      setSuppliers(list);
    } catch {
      console.warn("Could not load suppliers");
    }
  };

  // ── Generate ───────────────────────────────────────────────────────────────
  const generate = async () => {
    if (!form.date) { toast("Please pick a date.", "error"); return; }

    setGenerating(true);
    try {
      const payload = {
        report_type: form.report_type,
        date: form.date,                         // always send date
      };
      if (form.supplier_id) payload.supplier_id = form.supplier_id;

      await api.post("/invoices/generate/", payload);
      toast("Invoice generated successfully!", "success");
      loadInvoices();
    } catch (e) {
      toast(
        e.response?.data?.error ||
        e.response?.data?.detail ||
        "Failed to generate invoice.",
        "error"
      );
    } finally {
      setGenerating(false);
    }
  };

  // ── Download ───────────────────────────────────────────────────────────────
  const download = async (id, num) => {
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${BASE_URL}/invoices/${id}/download/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      Object.assign(document.createElement("a"), {
        href: url, download: `${num}.pdf`
      }).click();
      URL.revokeObjectURL(url);
    } catch {
      toast("Download failed.", "error");
    }
  };

  const toast = (msg, sev = "success") => setSnack({ open:true, msg, sev });

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <Box p={3}>

      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <ReceiptLongIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4" fontWeight="bold">Invoice Management</Typography>
      </Stack>

      {/* ── Generate card ── */}
      <Paper sx={{ p:3, mb:4, borderRadius:2 }} elevation={2}>
        <Typography variant="h6" fontWeight={600} mb={1}>Generate Invoice</Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Pick a <b>date</b> and <b>report type</b>.
          For monthly reports the full month of the chosen date is used.
          Leave supplier as <b>All Companies</b> to include everyone.
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2} alignItems="center">

          {/* Report Type */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth select label="Report Type"
              value={form.report_type}
              onChange={(e) => setForm(f => ({ ...f, report_type: e.target.value }))}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </TextField>
          </Grid>

          {/* Date picker — for daily: exact date; for monthly: any day in that month */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              label={form.report_type === "daily" ? "Date" : "Any day in the month"}
              InputLabelProps={{ shrink: true }}
              value={form.date}
              onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
              helperText={
                form.report_type === "daily"
                  ? "Transactions on this date"
                  : "Entire month will be used"
              }
            />
          </Grid>

          {/* Supplier dropdown */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth select label="Supplier"
              value={form.supplier_id}
              onChange={(e) => setForm(f => ({ ...f, supplier_id: e.target.value }))}
              helperText={suppliers.length === 0 ? "Loading suppliers…" : `${suppliers.length} suppliers`}
            >
              <MenuItem value="">All Companies</MenuItem>
              {suppliers.map(s => (
                <MenuItem key={s.id} value={s.id}>
                  {s.company_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Generate button */}
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth variant="contained" size="large"
              startIcon={
                generating
                  ? <CircularProgress size={18} color="inherit" />
                  : <InsertDriveFileIcon />
              }
              onClick={generate}
              disabled={generating}
              sx={{ height: 56 }}
            >
              {generating ? "Generating…" : "Generate Invoice"}
            </Button>
          </Grid>

        </Grid>
      </Paper>

      {/* ── Invoice history table ── */}
      <Paper sx={{ borderRadius:2, overflow:"hidden" }} elevation={2}>
        <Box p={2.5} display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={600}>Invoice History</Typography>
          <Chip
            label={`${invoices.length} invoice${invoices.length !== 1 ? "s" : ""}`}
            size="small" color="primary" variant="outlined"
          />
        </Box>
        <Divider />

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : invoices.length === 0 ? (
          <Box py={6} textAlign="center">
            <Typography color="text.secondary">
              No invoices yet. Generate one above.
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                {["Invoice #", "Company", "Type", "Quantity", "Amount", "Generated", ""].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map(inv => (
                <TableRow key={inv.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace" fontWeight="bold" color="primary">
                      {inv.invoice_number}
                    </Typography>
                  </TableCell>
                  <TableCell>{inv.company_name || "All Companies"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={inv.report_type === "daily" ? "Daily" : "Monthly"}
                      color={inv.report_type === "daily" ? "info" : "warning"}
                    />
                  </TableCell>
                  <TableCell>
                    {parseFloat(inv.total_quantity || 0).toLocaleString("en-IN")} L
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {fmtN(inv.total_amount)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {fmt(inv.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined" size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => download(inv.id, inv.invoice_number)}
                    >
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.sev}
          variant="filled"
          onClose={() => setSnack(s => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>

    </Box>
  );
}