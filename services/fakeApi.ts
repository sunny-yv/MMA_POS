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
  cart: { id: number; name: string; price: number }[];  // List of products in the cart
  totalAmount: number;
  status: string;  // Add status to track the order status ('pending', 'completed', etc.)
}

export interface Transaction {
  totalAmount: number;
  items: Product[];
  status: string;  // 'completed', 'pending', etc.
}

// Simulating fetching product list from an API
export const fetchProducts = async (): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: 'Bún Bò', price: 42000,image: 'https://static.vinwonders.com/production/bun-bo-hue-ngon-o-sai-gon-1.jpg', quantity: 0 },
        { id: 2, name: 'Bánh Mì', price: 38000, image: 'https://media-cdn-v2.laodong.vn/storage/newsportal/2024/5/31/1346983/Banh-Mi-8.jpg', quantity: 0 },
        { id: 3, name: 'Bánh Cuốn', price: 32000, image: 'https://cdn.buffetposeidon.com/app/media/Kham-pha-am-thuc/11.2023/241123-banh-cuon-buffet-poseidon-4.jpg', quantity: 0 },
        { id: 4, name: 'Phở', price: 50000, image: 'https://noidiennaupho.com/wp-content/uploads/2024/07/Pho-bo-to-hieu.jpg', quantity: 0 },

      ]);
    }, 1000);  
  });
};

// Simulate saving an order to AsyncStorage
export const saveOrder = async (order: Order) => {
  const orders = await getOrders();
  orders.push(order);  // Add the new order to the list
  await AsyncStorage.setItem("orders", JSON.stringify(orders));  // Save to AsyncStorage
};

// Get all orders from AsyncStorage
export const getOrders = async (): Promise<Order[]> => {
  const orders = await AsyncStorage.getItem("orders");
  return orders ? JSON.parse(orders) : [];
};

// Simulate submitting a transaction
export const submitTransaction = async (transaction: Transaction) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Transaction submitted:', transaction);  // Log the transaction
      resolve({ status: 'success', transaction });
    }, 1000);  // Simulate delay of 1 second
  });
};

// Add completeOrder function to update the order's status to 'completed'
export const completeOrder = async (orderId: number): Promise<void> => {
  const orders = await getOrders();
  const orderIndex = orders.findIndex(order => order.id === orderId);
  
  if (orderIndex !== -1) {
    // Update the order's status to 'completed'
    orders[orderIndex].status = 'completed';
    await AsyncStorage.setItem("orders", JSON.stringify(orders));  // Save the updated orders to AsyncStorage
    console.log(`Order with ID ${orderId} is now completed.`);
  } else {
    console.log(`Order with ID ${orderId} not found.`);
  }
};
