// store/slices/airlineSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import airlineService from '../../services/airlineService';

// Async Thunks
export const fetchAirlines = createAsyncThunk(
  'airlines/fetchAirlines',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await airlineService.getAirlines(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAirlineById = createAsyncThunk(
  'airlines/fetchAirlineById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await airlineService.getAirline(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createAirline = createAsyncThunk(
  'airlines/createAirline',
  async (data, { rejectWithValue }) => {
    try {
      const response = await airlineService.createAirline(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateAirline = createAsyncThunk(
  'airlines/updateAirline',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await airlineService.updateAirline(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteAirline = createAsyncThunk(
  'airlines/deleteAirline',
  async (id, { rejectWithValue }) => {
    try {
      await airlineService.deleteAirline(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const toggleAirlineStatus = createAsyncThunk(
  'airlines/toggleAirlineStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await airlineService.toggleStatus(id);
      return { id, status: response.status };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAirlineStats = createAsyncThunk(
  'airlines/fetchAirlineStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await airlineService.getStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const airlineSlice = createSlice({
  name: 'airlines',
  initialState: {
    airlines: [],
    selectedAirline: null,
    stats: {
      total: 0,
      active: 0,
      inactive: 0,
      total_credit_limit: 0,
      credit_distribution: {
        high: 0,
        medium: 0,
        low: 0
      }
    },
    total: 0,
    isLoading: false,
    isSubmitting: false,
    error: null,
    pagination: {
      currentPage: 1,
      pageSize: 10,
      totalPages: 1
    },
    filters: {
      search: '',
      status: '',
      ordering: '-created_at'
    }
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedAirline: (state) => {
      state.selectedAirline = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Airlines
      .addCase(fetchAirlines.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAirlines.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload.results) {
          state.airlines = action.payload.results;
          state.total = action.payload.count || 0;
        } else if (Array.isArray(action.payload)) {
          state.airlines = action.payload;
          state.total = action.payload.length;
        } else {
          state.airlines = [];
          state.total = 0;
        }
        state.pagination.totalPages = Math.ceil(state.total / state.pagination.pageSize);
      })
      .addCase(fetchAirlines.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.airlines = [];
        state.total = 0;
      })
      
      // Create Airline
      .addCase(createAirline.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(createAirline.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const newAirline = action.payload.data || action.payload;
        state.airlines = [newAirline, ...state.airlines];
        state.total += 1;
        if (newAirline.status) {
          state.stats.active += 1;
        } else {
          state.stats.inactive += 1;
        }
        state.stats.total += 1;
      })
      .addCase(createAirline.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })
      
      // Update Airline
      .addCase(updateAirline.fulfilled, (state, action) => {
        const updatedAirline = action.payload.data || action.payload;
        const index = state.airlines.findIndex(a => a.id === updatedAirline.id);
        if (index !== -1) {
          state.airlines[index] = updatedAirline;
        }
        if (state.selectedAirline?.id === updatedAirline.id) {
          state.selectedAirline = updatedAirline;
        }
      })
      
      // Delete Airline
      .addCase(deleteAirline.fulfilled, (state, action) => {
        state.airlines = state.airlines.filter(a => a.id !== action.payload);
        state.total -= 1;
      })
      
      // Toggle Status
      .addCase(toggleAirlineStatus.fulfilled, (state, action) => {
        const index = state.airlines.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.airlines[index].status = action.payload.status;
        }
      })
      
      // Fetch Stats
      .addCase(fetchAirlineStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { 
  setFilters, 
  clearError, 
  clearSelectedAirline,
  setPagination
} = airlineSlice.actions;

export default airlineSlice.reducer;