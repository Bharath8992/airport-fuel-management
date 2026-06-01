import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import airlineService from '../../services/airlineService';

// Async thunks
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

const airlineSlice = createSlice({
  name: 'airlines',
  initialState: {
    airlines: [],
    selectedAirline: null,
    total: 0,
    isLoading: false,
    error: null,
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
        state.airlines = action.payload.results || action.payload;
        state.total = action.payload.count || (action.payload.results?.length || 0);
      })
      .addCase(fetchAirlines.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.airlines = [];
      })
      // Create Airline
      .addCase(createAirline.fulfilled, (state, action) => {
        state.airlines = [action.payload, ...state.airlines];
        state.total += 1;
      })
      // Update Airline
      .addCase(updateAirline.fulfilled, (state, action) => {
        const index = state.airlines.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.airlines[index] = action.payload;
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
      });
  },
});

export const { setFilters, clearError } = airlineSlice.actions;
export default airlineSlice.reducer;