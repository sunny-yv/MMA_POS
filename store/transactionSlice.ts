import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Transaction {
    id: string;
    date: string;
    totalAmount: string;
    paymentMethod: 'cash' | 'qr';
}

interface TransactionState {
    transactions: Transaction[];
}

const initialState: TransactionState = {
    transactions: [],
};

const transactionSlice = createSlice({
    name: 'transaction',
    initialState,
    reducers: {
        addTransaction: (state, action: PayloadAction<Transaction>) => {
            state.transactions.push(action.payload);
        },
    },
});

export const { addTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;
