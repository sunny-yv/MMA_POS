import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Button, Alert, Modal, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import QRCode from 'react-native-qrcode-svg';
import { fetchProducts, Product } from '../../services/fakeApi';
import ProductCard from '../../components/ProductCard';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../store/types';
import { useNavigation } from '@react-navigation/native';

const IndexScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [cashAmount, setCashAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qr'>('cash');
  const [changeAmount, setChangeAmount] = useState<number>(0);
  const [showInvoicePrompt, setShowInvoicePrompt] = useState<boolean>(false);
  const [qrCodeValue, setQrCodeValue] = useState<string>('');
  const [newProductName, setNewProductName] = useState<string>('');
  const [newProductPrice, setNewProductPrice] = useState<string>('');
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);

  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Home'>>();

  useEffect(() => {
    const loadProducts = async () => {
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
    };
    loadProducts();
  }, []);

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity > 0) {
      setCart(cart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      ));
    } else {
      setCart(cart.filter((item) => item.id !== productId));
    }
  };

  const handlePayment = async () => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (paymentMethod === 'cash' && parseFloat(cashAmount) < total) {
      Alert.alert('Lỗi', 'Số tiền khách đưa không đủ');
      return;
    }

    const change = parseFloat(cashAmount) - total;
    setChangeAmount(change > 0 ? change : 0);

    const transaction = {
      totalAmount: total,
      items: cart,
      status: 'completed',
    };

    setShowInvoicePrompt(true);
  };

  const handleGeneratePDF = () => {
    Alert.alert('Thành công', 'Hóa đơn đã được xuất và chia sẻ thành công!');
    setShowInvoicePrompt(false);
    navigation.navigate('Statistics', { transaction: cart });
  };

  const handleAddProduct = () => {
    if (newProductName && newProductPrice) {
      const newProduct: Product = {
        id: products.length + 1,
        name: newProductName,
        price: parseFloat(newProductPrice),
        image: 'https://via.placeholder.com/60',
        quantity: 0,
      };
      setProducts([...products, newProduct]);
      setIsAddingProduct(false);
      setNewProductName('');
      setNewProductPrice('');
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>

      <TouchableOpacity style={styles.addProductButton} onPress={() => setIsAddingProduct(true)}>
        <Text style={styles.addProductButtonText}>Thêm sản phẩm mới</Text>
      </TouchableOpacity>

      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductCard product={item} onAddToCart={addToCart} />
        )}
        keyExtractor={(item) => item.id.toString()}
      />

      <View style={styles.cartContainer}>
        <Text style={styles.cartTitle}>Giỏ hàng</Text>
        {cart.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <Text style={styles.cartItemText}>{item.name} x {item.quantity}</Text>
            <Text style={styles.cartItemText}>${item.price * item.quantity}</Text>
            <View style={styles.quantityControl}>
              <Button title="-" onPress={() => updateQuantity(item.id, item.quantity - 1)} />
              <Text>{item.quantity}</Text>
              <Button title="+" onPress={() => updateQuantity(item.id, item.quantity + 1)} />
            </View>
          </View>
        ))}
        <Text style={styles.totalText}>Tổng tiền: ${total}</Text>

        <Text>Chọn phương thức thanh toán:</Text>
        <Picker
          selectedValue={paymentMethod}
          onValueChange={(itemValue: 'cash' | 'qr') => {
            setPaymentMethod(itemValue);
            if (itemValue === 'qr') {
              setQrCodeValue(total.toString());
            }
          }}
        >
          <Picker.Item label="Tiền mặt" value="cash" />
          <Picker.Item label="QR" value="qr" />
        </Picker>

        {paymentMethod === 'cash' && (
          <TextInput
            style={styles.input}
            placeholder="Nhập số tiền khách đưa"
            keyboardType="numeric"
            value={cashAmount}
            onChangeText={setCashAmount}
          />
        )}

        {paymentMethod === 'qr' && qrCodeValue && (
          <QRCode value={qrCodeValue} size={200} />
        )}

        <Text>Tiền thừa: ${changeAmount.toFixed(2)}</Text>
        <Button title="Hoàn thành đơn" onPress={handlePayment} />
      </View>

      <Modal visible={showInvoicePrompt} transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Bạn có muốn xuất hóa đơn PDF không?</Text>
            <View style={styles.modalButtons}>
              <Button title="Có" onPress={handleGeneratePDF} />
              <Button title="Không" onPress={() => setShowInvoicePrompt(false)} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isAddingProduct} transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Thêm sản phẩm mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Tên sản phẩm"
              value={newProductName}
              onChangeText={setNewProductName}
            />
            <TextInput
              style={styles.input}
              placeholder="Giá sản phẩm"
              keyboardType="numeric"
              value={newProductPrice}
              onChangeText={setNewProductPrice}
            />
            <View style={styles.modalButtons}>
              <Button title="Thêm" onPress={handleAddProduct} />
              <Button title="Hủy" onPress={() => setIsAddingProduct(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  addProductButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  addProductButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cartContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cartItemText: {
    fontSize: 16,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default IndexScreen;