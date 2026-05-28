import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
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
  TrendingUp,
  Receipt,
} from '@mui/icons-material';
import { fetchDashboardStats } from '../../store/slices/dashboardSlice';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Dashboard() {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const statCards = [
    {
      title: 'Total Suppliers',
      value: stats.total_suppliers || 0,
      icon: <LocalGasStation sx={{ fontSize: 40 }} />,
      color: '#3b82f6',
    },
    {
      title: 'Total Airlines',
      value: stats.total_airlines || 0,
      icon: <AirlineStops sx={{ fontSize: 40 }} />,
      color: '#10b981',
    },
    {
      title: "Today's Fuel (L)",
      value: (stats.today_fuel_supplied || 0).toLocaleString(),
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#f59e0b',
    },
    {
      title: 'Monthly Revenue (₹)',
      value: `₹${(stats.monthly_revenue || 0).toLocaleString()}`,
      icon: <Receipt sx={{ fontSize: 40 }} />,
      color: '#ef4444',
    },
  ];

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" mb={3}>
        Dashboard Overview
      </Typography>

      <Grid container spacing={3} mb={4}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
              <CardContent>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: 20,
                    backgroundColor: card.color,
                    borderRadius: 2,
                    p: 1.5,
                    color: 'white',
                  }}
                >
                  {card.icon}
                </Box>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="h4" component="div" fontWeight="bold">
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weekly Fuel Supply Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.weekly_fuel_supply || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="fuel_supplied"
                    stroke="#3b82f6"
                    name="Fuel Supplied (L)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {(stats.recent_transactions || []).map((transaction, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 2,
                      borderBottom: '1px solid #e5e7eb',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      {transaction.transaction_number}
                    </Typography>
                    <Typography variant="body1">
                      {transaction.supplier_name} → {transaction.airline_name}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      ₹{transaction.total_amount?.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}