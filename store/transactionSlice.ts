// store/transactionSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PaymentTransaction {
  id: string;
  date: string;
  totalAmount: string;
  paymentMethod: 'cash' | 'qr';
  orderStatus: 'Done' | 'Canceled';
  products: string[];
  customerName: string;
}

interface TransactionState {
  transactions: PaymentTransaction[];
}

const initialState: TransactionState = {
  transactions: [],
};

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    addTransaction: (state, action: PayloadAction<PaymentTransaction>) => {
      state.transactions.push(action.payload);
    },
  },
});

export const { addTransaction } = transactionSlice.actions;

export default transactionSlice.reducer;
