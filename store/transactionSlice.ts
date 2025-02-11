// src/store/transactionSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Transaction {
  id: number;
  totalAmount: number;
  items: { name: string; quantity: number; price: number }[];
  status: string; // 'pending', 'completed', etc.
}

const initialState: Transaction[] = [];

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addTransaction(state, action: PayloadAction<Transaction>) {
      state.push(action.payload);
    },
    updateTransactionStatus(state, action: PayloadAction<{ id: number; status: string }>) {
      const transaction = state.find((t) => t.id === action.payload.id);
      if (transaction) {
        transaction.status = action.payload.status;
      }
    },
  },
});

export const { addTransaction, updateTransactionStatus } = transactionSlice.actions;
export default transactionSlice.reducer;
