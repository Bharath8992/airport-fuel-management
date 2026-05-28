import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import supplierReducer from './slices/supplierSlice';
import airlineReducer from './slices/airlineSlice';
import airportReducer from './slices/airportSlice';
import transactionReducer from './slices/transactionSlice';
import invoiceReducer from './slices/invoiceSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    suppliers: supplierReducer,
    airlines: airlineReducer,
    airports: airportReducer,
    transactions: transactionReducer,
    invoices: invoiceReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});