import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import airportService from '../../services/airportService';

export const fetchAirports = createAsyncThunk(
  'airports/fetchAirports',
  async (params, { rejectWithValue }) => {
    try {
      const response = await airportService.getAirports(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const airportSlice = createSlice({
  name: 'airports',
  initialState: {
    airports: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAirports.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAirports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.airports = action.payload.results || action.payload;
      })
      .addCase(fetchAirports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default airportSlice.reducer;