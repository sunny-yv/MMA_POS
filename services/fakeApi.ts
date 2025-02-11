import AsyncStorage from "@react-native-async-storage/async-storage";
export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;  
}
export interface Order {
  id: number;
  cart: { id: number; name: string; price: number }[];  // Danh sách sản phẩm trong giỏ hàng
  totalAmount: number;
}

export interface Transaction {
  totalAmount: number;
  items: Product[];
  status: string;  // 'completed', 'pending', v.v.
}

// Giả lập việc lấy sản phẩm từ API
export const fetchProducts = async (): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: 'Bún Bò', price: 12, image: 'https://static.vinwonders.com/production/bun-bo-hue-ngon-o-sai-gon-1.jpg', quantity: 0 },
        { id: 2, name: 'Bánh Mì', price: 8, image: 'https://media-cdn-v2.laodong.vn/storage/newsportal/2024/5/31/1346983/Banh-Mi-8.jpg', quantity: 0 },
        { id: 3, name: 'Bánh Cuốn', price: 12, image: 'https://cdn.buffetposeidon.com/app/media/Kham-pha-am-thuc/11.2023/241123-banh-cuon-buffet-poseidon-4.jpg', quantity: 0 },
      ]);
    }, 1000); 
  });
};

// Giả lập lưu đơn hàng vào AsyncStorage
export const saveOrder = async (order: Order) => {
  const orders = await getOrders();
  orders.push(order);  // Thêm đơn hàng vào danh sách
  await AsyncStorage.setItem("orders", JSON.stringify(orders));  // Lưu vào AsyncStorage
};

// Lấy tất cả các đơn hàng đã lưu từ AsyncStorage
export const getOrders = async (): Promise<Order[]> => {
  const orders = await AsyncStorage.getItem("orders");
  return orders ? JSON.parse(orders) : [];
};

// Giả lập việc gửi giao dịch
export const submitTransaction = async (transaction: Transaction) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Transaction submitted:', transaction);  // Ghi log giao dịch
      resolve({ status: 'success', transaction });
    }, 1000);  // Giả lập delay 1 giây
  });
};
