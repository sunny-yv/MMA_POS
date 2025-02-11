
// src/services/fakeApi.ts

export interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
  }
  
  export interface Transaction {
    totalAmount: number;
    items: Product[];
    status: string;  // Ví dụ: 'completed', 'pending'
  }
  
  export const submitTransaction = async (transaction: Transaction) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Transaction submitted:', transaction);
        resolve({ status: 'success', transaction });
      }, 1000);
    });
  };
  
  export const fetchProducts = async (): Promise<Product[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, name: 'Bún Bò', price: 12, image: 'https://static.vinwonders.com/production/bun-bo-hue-ngon-o-sai-gon-1.jpg',quantity: 0 },
          { id: 2, name: 'Bánh Mì', price: 8, image: 'https://media-cdn-v2.laodong.vn/storage/newsportal/2024/5/31/1346983/Banh-Mi-8.jpg',quantity: 0 },
          { id: 3, name: 'Bánh Cuốn', price: 12, image: 'https://cdn.buffetposeidon.com/app/media/Kham-pha-am-thuc/11.2023/241123-banh-cuon-buffet-poseidon-4.jpg',quantity: 0 },
        ]);
      }, 1000); // Delay 1 giây
    });
  };

  