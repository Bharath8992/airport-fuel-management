import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transactionService from '../../services/transactionService';

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await transactionService.getTransactions(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    transactions: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.results || action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default transactionSlice.reducer;