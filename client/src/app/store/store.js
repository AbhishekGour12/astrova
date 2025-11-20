import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import  productTypeSlice from './features/productTypeSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        productType: productTypeSlice
        // Add other slices here (e.g., tasks, expenses)
    },
});