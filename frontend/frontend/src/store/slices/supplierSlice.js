// store/slices/supplierSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supplierService from '../../services/supplierService';

// Async Thunks
export const fetchSuppliers = createAsyncThunk(
  'suppliers/fetchSuppliers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await supplierService.getSuppliers(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSupplierById = createAsyncThunk(
  'suppliers/fetchSupplierById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await supplierService.getSupplier(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
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
      return rejectWithValue(error.response?.data || error.message);
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
      return rejectWithValue(error.response?.data || error.message);
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
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const toggleSupplierStatus = createAsyncThunk(
  'suppliers/toggleSupplierStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await supplierService.toggleStatus(id);
      return { id, status: response.status };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSupplierContracts = createAsyncThunk(
  'suppliers/fetchSupplierContracts',
  async ({ id, activeOnly }, { rejectWithValue }) => {
    try {
      const response = await supplierService.getContracts(id, activeOnly);
      return { id, contracts: response.contracts };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addSupplierContract = createAsyncThunk(
  'suppliers/addSupplierContract',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await supplierService.addContract(id, data);
      return { id, contract: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSupplierStats = createAsyncThunk(
  'suppliers/fetchSupplierStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await supplierService.getStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkCreateSuppliers = createAsyncThunk(
  'suppliers/bulkCreateSuppliers',
  async (suppliers, { rejectWithValue }) => {
    try {
      const response = await supplierService.bulkCreate(suppliers);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkDeleteSuppliers = createAsyncThunk(
  'suppliers/bulkDeleteSuppliers',
  async (ids, { rejectWithValue }) => {
    try {
      const response = await supplierService.bulkDelete(ids);
      return { ids, message: response.message };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const supplierSlice = createSlice({
  name: 'suppliers',
  initialState: {
    suppliers: [],
    selectedSupplier: null,
    selectedSupplierContracts: [],
    stats: {
      total: 0,
      active: 0,
      inactive: 0,
      total_contracts: 0,
      fuel_type_distribution: {}
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
    },
    bulkActions: {
      selectedIds: [],
      isBulkMode: false
    }
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    setSelectedSuppliers: (state, action) => {
      state.bulkActions.selectedIds = action.payload;
    },
    toggleBulkMode: (state, action) => {
      state.bulkActions.isBulkMode = action.payload;
      if (!action.payload) {
        state.bulkActions.selectedIds = [];
      }
    },
    clearSelectedSupplier: (state) => {
      state.selectedSupplier = null;
      state.selectedSupplierContracts = [];
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Suppliers
      .addCase(fetchSuppliers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle different response structures
        if (action.payload && Array.isArray(action.payload)) {
          state.suppliers = action.payload;
          state.total = action.payload.length;
        } else if (action.payload && action.payload.results) {
          state.suppliers = action.payload.results;
          state.total = action.payload.count || 0;
        } else if (action.payload && action.payload.data) {
          state.suppliers = action.payload.data;
          state.total = action.payload.data.length;
        } else {
          state.suppliers = [];
          state.total = 0;
        }
        state.pagination.totalPages = Math.ceil(state.total / state.pagination.pageSize);
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.suppliers = [];
        state.total = 0;
      })
      
      // Fetch Single Supplier
      .addCase(fetchSupplierById.fulfilled, (state, action) => {
        state.selectedSupplier = action.payload;
      })
      
      // Create Supplier
      .addCase(createSupplier.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Add the new supplier to the list
        const newSupplier = action.payload.data || action.payload;
        state.suppliers = [newSupplier, ...state.suppliers];
        state.total += 1;
        if (newSupplier.status) {
          state.stats.active += 1;
        } else {
          state.stats.inactive += 1;
        }
        state.stats.total += 1;
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })
      
      // Update Supplier
      .addCase(updateSupplier.fulfilled, (state, action) => {
        const updatedSupplier = action.payload.data || action.payload;
        const index = state.suppliers.findIndex(s => s.id === updatedSupplier.id);
        if (index !== -1) {
          const oldStatus = state.suppliers[index].status;
          const newStatus = updatedSupplier.status;
          
          if (oldStatus !== newStatus) {
            if (newStatus) {
              state.stats.active += 1;
              state.stats.inactive -= 1;
            } else {
              state.stats.active -= 1;
              state.stats.inactive += 1;
            }
          }
          
          state.suppliers[index] = updatedSupplier;
        }
        if (state.selectedSupplier?.id === updatedSupplier.id) {
          state.selectedSupplier = updatedSupplier;
        }
      })
      
      // Delete Supplier
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        const deletedSupplier = state.suppliers.find(s => s.id === action.payload);
        if (deletedSupplier) {
          if (deletedSupplier.status) {
            state.stats.active -= 1;
          } else {
            state.stats.inactive -= 1;
          }
          state.stats.total -= 1;
        }
        state.suppliers = state.suppliers.filter(s => s.id !== action.payload);
        state.total -= 1;
        state.bulkActions.selectedIds = state.bulkActions.selectedIds.filter(id => id !== action.payload);
      })
      
      // Toggle Status
      .addCase(toggleSupplierStatus.fulfilled, (state, action) => {
        const index = state.suppliers.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          const oldStatus = state.suppliers[index].status;
          const newStatus = action.payload.status;
          
          state.suppliers[index].status = newStatus;
          
          if (oldStatus !== newStatus) {
            if (newStatus) {
              state.stats.active += 1;
              state.stats.inactive -= 1;
            } else {
              state.stats.active -= 1;
              state.stats.inactive += 1;
            }
          }
        }
      })
      
      // Fetch Contracts
      .addCase(fetchSupplierContracts.fulfilled, (state, action) => {
        state.selectedSupplierContracts = action.payload.contracts;
      })
      
      // Add Contract
      .addCase(addSupplierContract.fulfilled, (state, action) => {
        state.selectedSupplierContracts.unshift(action.payload.contract);
      })
      
      // Fetch Stats
      .addCase(fetchSupplierStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      
      // Bulk Create
      .addCase(bulkCreateSuppliers.fulfilled, (state, action) => {
        if (action.payload.created) {
          state.suppliers.unshift(...action.payload.created);
          state.total += action.payload.created_count;
        }
      })
      
      // Bulk Delete
      .addCase(bulkDeleteSuppliers.fulfilled, (state, action) => {
        state.suppliers = state.suppliers.filter(s => !action.payload.ids.includes(s.id));
        state.total -= action.payload.ids.length;
        state.bulkActions.selectedIds = [];
      });
  },
});

export const { 
  setFilters, 
  clearError, 
  setSelectedSuppliers, 
  toggleBulkMode,
  clearSelectedSupplier,
  setPagination
} = supplierSlice.actions;

export default supplierSlice.reducer;