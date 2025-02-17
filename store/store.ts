// redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './productsSlice';
import transactionReducer from './transactionSlice';

export const store = configureStore({
    reducer: {
        products: productsReducer,
        transaction: transactionReducer,
    },
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
