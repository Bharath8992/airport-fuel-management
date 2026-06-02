// store/slices/dashboardSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardService from '../../services/dashboardService';

// Async Thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchDashboardStats',
  async ({ period = 'monthly', startDate = null, endDate = null } = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getStats(period, startDate, endDate);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFuelTrends = createAsyncThunk(
  'dashboard/fetchFuelTrends',
  async ({ period = 'weekly', year = null, month = null } = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getFuelTrends(period, year, month);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchRecentActivities = createAsyncThunk(
  'dashboard/fetchRecentActivities',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getRecentActivities(limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    stats: {
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
      fuel_type_distribution: [],
      top_suppliers: [],
      top_airlines: [],
    },
    fuelTrends: {
      weekly: [],
      monthly: [],
      yearly: [],
    },
    recentTransactions: [],
    recentActivities: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = { ...state.stats, ...action.payload };
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Fuel Trends
      .addCase(fetchFuelTrends.fulfilled, (state, action) => {
        state.fuelTrends = { ...state.fuelTrends, ...action.payload };
      })
      .addCase(fetchFuelTrends.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Fetch Recent Activities
      .addCase(fetchRecentActivities.fulfilled, (state, action) => {
        state.recentActivities = action.payload;
      })
      .addCase(fetchRecentActivities.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;