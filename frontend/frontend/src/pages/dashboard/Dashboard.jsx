// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  LocalGasStation,
  AirlineStops,
  FlightTakeoff,
  TrendingUp,
  Receipt,
  PendingActions,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import api from '../../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_suppliers: 0,
    total_airlines: 0,
    total_airports: 0,
    total_transactions: 0,
    today_fuel_supplied: 0,
    monthly_revenue: 0,
    monthly_fuel_supplied: 0,
    pending_transactions: 0,
    completed_transactions: 0,
    cancelled_transactions: 0,
    invoiced_transactions: 0,
    fuel_type_distribution: [],
    top_suppliers: [],
    top_airlines: [],
  });
  const [trends, setTrends] = useState({ weekly: [] });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('weekly');

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, trendsRes, activitiesRes] = await Promise.all([
        api.get('/dashboard/stats/'),
        api.get(`/dashboard/fuel-trends/?period=${period}`),
        api.get('/dashboard/recent-activities/?limit=10'),
      ]);
      
      setStats(statsRes.data);
      setTrends(trendsRes.data);
      setRecentActivities(activitiesRes.data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return num?.toLocaleString() || 0;
  };

  const getTrendData = () => {
    switch(period) {
      case 'weekly': return trends.weekly || [];
      case 'monthly': return trends.monthly || [];
      case 'yearly': return trends.yearly || [];
      default: return [];
    }
  };

  const statCards = [
    { title: 'Total Suppliers', value: formatNumber(stats.total_suppliers), icon: <LocalGasStation />, color: '#3b82f6' },
    { title: 'Total Airlines', value: formatNumber(stats.total_airlines), icon: <AirlineStops />, color: '#10b981' },
    { title: 'Total Airports', value: formatNumber(stats.total_airports), icon: <FlightTakeoff />, color: '#8b5cf6' },
    { title: "Today's Fuel", value: `${formatNumber(stats.today_fuel_supplied)} L`, icon: <TrendingUp />, color: '#f59e0b' },
    { title: 'Monthly Revenue', value: formatCurrency(stats.monthly_revenue), icon: <Receipt />, color: '#ef4444' },
    { title: 'Monthly Fuel', value: `${formatNumber(stats.monthly_fuel_supplied)} L`, icon: <TrendingUp />, color: '#06b6d4' },
  ];

  const transactionStats = [
    { label: 'Pending', value: stats.pending_transactions, color: '#f59e0b', icon: <PendingActions /> },
    { label: 'Completed', value: stats.completed_transactions, color: '#10b981', icon: <CheckCircle /> },
    { label: 'Cancelled', value: stats.cancelled_transactions, color: '#ef4444', icon: <Cancel /> },
    { label: 'Invoiced', value: stats.invoiced_transactions, color: '#8b5cf6', icon: <Receipt /> },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
        Dashboard Overview
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome to the Fuel Management Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ p: 1, bgcolor: `${card.color}20`, borderRadius: 2, color: card.color }}>
                    {card.icon}
                  </Box>
                </Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="h5" component="div" fontWeight="bold">
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Period Selector */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2 }}>
        {['weekly', 'monthly', 'yearly'].map((p) => (
          <Chip
            key={p}
            label={p === 'weekly' ? 'Last 7 Days' : p === 'monthly' ? 'Last 30 Days' : 'This Year'}
            onClick={() => setPeriod(p)}
            color={period === p ? 'primary' : 'default'}
            variant={period === p ? 'filled' : 'outlined'}
          />
        ))}
      </Paper>

      {/* Transaction Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Transaction Overview
              </Typography>
              <Grid container spacing={2}>
                {transactionStats.map((stat, idx) => (
                  <Grid item xs={6} sm={3} key={idx}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: `${stat.color}10`, borderRadius: 2 }}>
                      <Box sx={{ color: stat.color, mb: 1 }}>{stat.icon}</Box>
                      <Typography variant="h5" fontWeight="bold" sx={{ color: stat.color }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Fuel Trend Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Fuel Supply Trend
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={getTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={period === 'yearly' ? 'month' : 'date'} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="fuel_supplied"
                    name="Fuel Supplied (L)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                  {period === 'weekly' && (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue (₹)"
                      stroke="#ef4444"
                      strokeWidth={2}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Fuel Type Distribution */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Fuel Type Distribution
              </Typography>
              {stats.fuel_type_distribution && stats.fuel_type_distribution.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={stats.fuel_type_distribution.map(item => ({
                          name: item.fuel_type?.replace('_', ' ') || 'Unknown',
                          value: item.total_quantity
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {stats.fuel_type_distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ mt: 2 }}>
                    {stats.fuel_type_distribution.map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{item.fuel_type?.replace('_', ' ') || 'Unknown'}:</Typography>
                        <Typography variant="body2" fontWeight="bold">{formatNumber(item.total_quantity)} L</Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
                  No data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Suppliers & Airlines */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Top Suppliers
              </Typography>
              {stats.top_suppliers && stats.top_suppliers.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Supplier</TableCell>
                        <TableCell align="right">Fuel (L)</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.top_suppliers.map((supplier, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell>{supplier.supplier__company_name}</TableCell>
                          <TableCell align="right">{formatNumber(supplier.total_fuel)}</TableCell>
                          <TableCell align="right">{formatCurrency(supplier.total_amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Top Airlines
              </Typography>
              {stats.top_airlines && stats.top_airlines.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Airline</TableCell>
                        <TableCell align="right">Fuel (L)</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.top_airlines.map((airline, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell>{airline.airline__airline_name}</TableCell>
                          <TableCell align="right">{formatNumber(airline.total_fuel)}</TableCell>
                          <TableCell align="right">{formatCurrency(airline.total_amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Transactions */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Recent Transactions
            </Typography>
            {recentActivities && recentActivities.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f9fafb' }}>
                      <TableCell>Transaction #</TableCell>
                      <TableCell>Supplier</TableCell>
                      <TableCell>Airline</TableCell>
                      <TableCell>Airport</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentActivities.map((activity) => (
                      <TableRow key={activity.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {activity.transaction_number}
                          </Typography>
                        </TableCell>
                        <TableCell>{activity.supplier_name}</TableCell>
                        <TableCell>{activity.airline_name}</TableCell>
                        <TableCell>{activity.airport_name}</TableCell>
                        <TableCell align="right">{formatNumber(activity.quantity)} L</TableCell>
                        <TableCell align="right">{formatCurrency(activity.total_amount)}</TableCell>
                        <TableCell>
                          <Chip
                            label={activity.status}
                            size="small"
                            sx={{
                              bgcolor: activity.status === 'completed' ? '#10b98120' : 
                                      activity.status === 'pending' ? '#f59e0b20' : '#ef444420',
                              color: activity.status === 'completed' ? '#10b981' : 
                                     activity.status === 'pending' ? '#f59e0b' : '#ef4444',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>{new Date(activity.timestamp).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No recent transactions
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Box>
  );
}