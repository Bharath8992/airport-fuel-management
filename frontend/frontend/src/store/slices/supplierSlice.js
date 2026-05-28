import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supplierService from '../../services/supplierService';

export const fetchSuppliers = createAsyncThunk(
  'suppliers/fetchSuppliers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await supplierService.getSuppliers(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createSupplier = createAsyncThunk(
  'suppliers/createSupplier',
  async (data, { rejectWithValue }) => {
    try {
      const response = await supplierService.createSupplier(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateSupplier = createAsyncThunk(
  'suppliers/updateSupplier',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await supplierService.updateSupplier(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deleteSupplier = createAsyncThunk(
  'suppliers/deleteSupplier',
  async (id, { rejectWithValue }) => {
    try {
      await supplierService.deleteSupplier(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const supplierSlice = createSlice({
  name: 'suppliers',
  initialState: {
    suppliers: [],
    selectedSupplier: null,
    total: 0,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuppliers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suppliers = action.payload.results || action.payload;
        state.total = action.payload.count || action.payload.length;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.suppliers.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        const index = state.suppliers.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.suppliers[index] = action.payload;
        }
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.suppliers = state.suppliers.filter(s => s.id !== action.payload);
        state.total -= 1;
      });
  },
});

export default supplierSlice.reducer;