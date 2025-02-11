// // src/components/ProductCard.tsx
// import React from 'react';
// import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
// import { Product } from '../services/fakeApi'; // Đảm bảo rằng import đúng kiểu Product từ fakeApi.ts

// interface ProductCardProps {
//   product: Product; // Đảm bảo rằng product là kiểu Product đầy đủ
//   onAddToCart: (product: Product) => void; // onAddToCart nhận vào Product đầy đủ
// }

// const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
//   return (
//     <View style={styles.productCard}>
//       <Image source={{ uri: product.image }} style={styles.productImage} />
//       <View style={styles.productInfo}>
//         <Text style={styles.productName}>{product.name}</Text>
//         <Text style={styles.productPrice}>${product.price}</Text>
//       </View>
//       <TouchableOpacity onPress={() => onAddToCart(product)} style={styles.addButton}>
//         <Text style={styles.addButtonText}>Thêm vào giỏ</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   productCard: {
//     flexDirection: 'row',
//     backgroundColor: '#f9f9f9',
//     padding: 10,
//     marginBottom: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   productImage: {
//     width: 60,
//     height: 60,
//     borderRadius: 5,
//     marginRight: 10,
//   },
//   productInfo: {
//     flex: 1,
//   },
//   productName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   productPrice: {
//     fontSize: 16,
//     color: '#333',
//   },
//   addButton: {
//     backgroundColor: '#4CAF50',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 5,
//   },
//   addButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
// });

// export default ProductCard;
