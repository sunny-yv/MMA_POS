// src/types.ts
export type RootStackParamList = {
  Home: undefined;  // Màn hình Home không nhận tham số gì
  Statistics: { transaction: Transaction };  // Màn hình Statistics nhận tham số transaction
};

interface Transaction {
  totalAmount: number;
  items: Product[];
  status: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}
