import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import invoiceService from '../../services/invoiceService';

export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async (params, { rejectWithValue }) => {
    try {
      const response = await invoiceService.getInvoices(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState: {
    invoices: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload.results || action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default invoiceSlice.reducer;