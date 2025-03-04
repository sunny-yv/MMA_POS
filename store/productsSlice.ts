// store/productsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imgUrl?: string;  // Thuộc tính này sẽ lưu ảnh
  image?: string;   // Hoặc tuỳ theo file JSON
}

interface ProductsState {
  products: Product[];
  paymentMethod: 'cash' | 'qr' | null;
  amountPaid: string;
  changeAmount: string;
}

const initialState: ProductsState = {
  products: [],
  paymentMethod: null,
  amountPaid: '',
  changeAmount: '',
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addProduct(state, action: PayloadAction<Product>) {
      state.products.push(action.payload);
    },
    updateProduct(state, action: PayloadAction<Product>) {
      const index = state.products.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    deleteProduct(state, action: PayloadAction<number>) {
      state.products = state.products.filter((p) => p.id !== action.payload);
    },
    clearProducts(state) {
      state.products = [];
      state.paymentMethod = null;
      state.amountPaid = '';
      state.changeAmount = '';
    },
    setPaymentMethod(state, action: PayloadAction<'cash' | 'qr' | null>) {
      state.paymentMethod = action.payload;
    },
    setAmountPaid(state, action: PayloadAction<string>) {
      state.amountPaid = action.payload;
    },
    setChangeAmount(state, action: PayloadAction<string>) {
      state.changeAmount = action.payload;
    },
  },
});

export const {
  addProduct,
  updateProduct,
  deleteProduct,
  clearProducts,
  setPaymentMethod,
  setAmountPaid,
  setChangeAmount,
} = productsSlice.actions;

export default productsSlice.reducer;
