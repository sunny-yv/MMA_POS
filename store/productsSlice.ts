import { createSlice } from '@reduxjs/toolkit';

const initialState = [
  { id: 1, name: 'Berry Cake', price: 12, image: 'https://via.placeholder.com/60', quantity: 0 },
  { id: 2, name: 'Apple', price: 8, image: 'https://via.placeholder.com/60', quantity: 0 },
  { id: 3, name: 'Black Tea', price: 12, image: 'https://via.placeholder.com/60', quantity: 0 },
];

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addToCart(state, action) {
      const existingProduct = state.find((product) => product.id === action.payload.id);
      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        state.push({ ...action.payload, quantity: 1 });
      }
    },
    removeFromCart(state, action) {
      return state.filter((product) => product.id !== action.payload.id);
    },
  },
});

export const { addToCart, removeFromCart } = productsSlice.actions;
export default productsSlice.reducer;
