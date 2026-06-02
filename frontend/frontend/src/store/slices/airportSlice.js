// store/slices/airportSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import airportService from '../../services/airportService';

export const fetchAirports = createAsyncThunk(
  'airports/fetchAirports',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await airportService.getAirports(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAirportById = createAsyncThunk(
  'airports/fetchAirportById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await airportService.getAirport(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createAirport = createAsyncThunk(
  'airports/createAirport',
  async (data, { rejectWithValue }) => {
    try {
      const response = await airportService.createAirport(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateAirport = createAsyncThunk(
  'airports/updateAirport',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await airportService.updateAirport(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteAirport = createAsyncThunk(
  'airports/deleteAirport',
  async (id, { rejectWithValue }) => {
    try {
      await airportService.deleteAirport(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const toggleAirportStatus = createAsyncThunk(
  'airports/toggleAirportStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await airportService.toggleStatus(id);
      return { id, status: response.status };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Export this with the name your component is expecting
export const updateAirportFuelStock = createAsyncThunk(
  'airports/updateAirportFuelStock',
  async ({ id, current_fuel_stock }, { rejectWithValue }) => {
    try {
      const response = await airportService.updateFuelStock(id, current_fuel_stock);
      return { id, current_fuel_stock: response.new_stock };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Keep the old name for backward compatibility
export const updateAirportStock = createAsyncThunk(
  'airports/updateAirportStock',
  async ({ id, quantity, operation }, { rejectWithValue }) => {
    try {
      const response = await airportService.updateStock(id, quantity, operation);
      return { id, current_fuel_stock: response.current_fuel_stock };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const airportSlice = createSlice({
  name: 'airports',
  initialState: {
    airports: [],
    selectedAirport: null,
    total: 0,
    isLoading: false,
    error: null,
    filters: {
      search: '',
      status: '',
      country: '',
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
      .addCase(fetchAirports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAirports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.airports = action.payload.results || action.payload;
        state.total = action.payload.count || (action.payload.results?.length || 0);
      })
      .addCase(fetchAirports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.airports = [];
      })
      .addCase(createAirport.fulfilled, (state, action) => {
        state.airports = [action.payload, ...state.airports];
        state.total += 1;
      })
      .addCase(updateAirport.fulfilled, (state, action) => {
        const index = state.airports.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.airports[index] = action.payload;
        }
      })
      .addCase(deleteAirport.fulfilled, (state, action) => {
        state.airports = state.airports.filter(a => a.id !== action.payload);
        state.total -= 1;
      })
      .addCase(toggleAirportStatus.fulfilled, (state, action) => {
        const index = state.airports.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.airports[index].status = action.payload.status;
        }
      })
      .addCase(updateAirportFuelStock.fulfilled, (state, action) => {
        const index = state.airports.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.airports[index].current_fuel_stock = action.payload.current_fuel_stock;
        }
      })
      .addCase(updateAirportStock.fulfilled, (state, action) => {
        const index = state.airports.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.airports[index].current_fuel_stock = action.payload.current_fuel_stock;
        }
      });
  },
});

export const { setFilters, clearError } = airportSlice.actions;
export default airportSlice.reducer;