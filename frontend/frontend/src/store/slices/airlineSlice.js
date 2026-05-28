import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import airlineService from '../../services/airlineService';

export const fetchAirlines = createAsyncThunk(
  'airlines/fetchAirlines',
  async (params, { rejectWithValue }) => {
    try {
      const response = await airlineService.getAirlines(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
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
      return rejectWithValue(error.response?.data);
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
      return rejectWithValue(error.response?.data);
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
      return rejectWithValue(error.response?.data);
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
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAirlines.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAirlines.fulfilled, (state, action) => {
        state.isLoading = false;
        state.airlines = action.payload.results || action.payload;
        state.total = action.payload.count || action.payload.length;
      })
      .addCase(fetchAirlines.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createAirline.fulfilled, (state, action) => {
        state.airlines.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateAirline.fulfilled, (state, action) => {
        const index = state.airlines.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.airlines[index] = action.payload;
        }
      })
      .addCase(deleteAirline.fulfilled, (state, action) => {
        state.airlines = state.airlines.filter(a => a.id !== action.payload);
        state.total -= 1;
      });
  },
});

export default airlineSlice.reducer;