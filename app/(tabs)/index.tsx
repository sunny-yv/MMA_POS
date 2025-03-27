import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  addProduct,
  updateProduct,
  deleteProduct,
  clearProducts,
  setAmountPaid,
  setChangeAmount,
  setPaymentMethod
} from '../../store/productsSlice';
import { saveOrder } from '../../services/fakeApi';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import localProducts from '../../assets/data/products.json';
import { FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function CashierScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();
  const products = useSelector((state: RootState) => state.products.products);
  const paymentMethod = useSelector((state: RootState) => state.products.paymentMethod);
  const amountPaid = useSelector((state: RootState) => state.products.amountPaid);
  const changeAmount = useSelector((state: RootState) => state.products.changeAmount);

  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]); 
  const [customerName, setCustomerName] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All'); 

  useEffect(() => {
    setAvailableProducts(localProducts);
    setFilteredProducts(localProducts); 
  }, []);

  const filterProductsByCategory = (category: string) => {
    if (category === 'All') {
      setFilteredProducts(availableProducts);
    } else {
      const filtered = availableProducts.filter((product) => product.category === category);
      setFilteredProducts(filtered);
    }
  };

  const totalAmount = products.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const generateQRCode = (amount: number) => {
    const bankAccount = '123456789';
    return `https://img.vietqr.io/image/VCB-${bankAccount}-compact2.png?amount=${amount}&addInfo=ThanhToanDonHang_${Date.now()}`;
  };

  useEffect(() => {
    if (paymentMethod === 'qr') {
      setQrCodeUrl(generateQRCode(totalAmount));
    }
  }, [paymentMethod, totalAmount]);

  const addProductHandler = (product: any, quantity = 1) => {
    const existing = products.find((p) => p.name === product.name);
    if (existing) {
      dispatch(updateProduct({ ...existing, quantity: existing.quantity + quantity }));
    } else {
      dispatch(addProduct({ id: Date.now(), name: product.name, price: product.price, imgUrl: product.image, quantity }));
    }
  };

  const adjustQuantity = (item: any, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) {
      dispatch(deleteProduct(item.id));
    } else {
      dispatch(updateProduct({ ...item, quantity: newQty }));
    }
  };

  const cancelOrder = () => {
    Alert.alert('Thông báo', 'Bạn có chắc muốn hủy đơn hàng?', [
      { text: 'Không', style: 'cancel' },
      { text: 'Có', onPress: () => { dispatch(clearProducts()); setCustomerName(''); } }
    ]);
  };

  const generatePDF = async () => {
    try {
      const currentDate = new Date();
      const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
      const htmlContent = `
        <h1 style="text-align:center;">Hóa Đơn Thanh Toán</h1>
        <p style="text-align:right;">Ngày: ${formattedDate}</p>
        <p><strong>Tên khách hàng:</strong> ${customerName}</p>
        <table border="1" style="width:100%; text-align:center;">
          <tr>
            <th>Tên khách hàng</th>
            <th>Sản phẩm</th>
            <th>Số lượng</th>
            <th>Giá</th>
            <th>Thành tiền</th>
          </tr>
          ${products
            .map(
              (item) => `
            <tr>
              <td>${customerName}</td>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>${item.price} VND</td>
              <td>${item.price * item.quantity} VND</td>
            </tr>
          `
            )
            .join('')}
        </table>
        <h3 style="text-align:right;">Tổng cộng: ${totalAmount} VND</h3>
      `;
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      if (uri) {
        Alert.alert('Hóa đơn đã được tạo', 'Bạn có muốn chia sẻ?', [
          { text: 'Đóng' },
          { text: 'Chia sẻ', onPress: () => Sharing.shareAsync(uri) }
        ]);
        dispatch(clearProducts());
        setCustomerName('');
      } else {
        Alert.alert('Lỗi', 'Không thể tạo file PDF.');
      }
    } catch (error) {
      console.error('Lỗi tạo PDF:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tạo PDF.');
    }
  };

  const handlePayment = async () => {
    if (products.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng đang trống');
      return;
    }
    if (!paymentMethod) {
      Alert.alert('Thông báo', 'Vui lòng chọn phương thức thanh toán');
      return;
    }
    if (paymentMethod === 'cash') {
      if (!amountPaid) {
        Alert.alert('Thông báo', 'Vui lòng nhập số tiền khách đưa');
        return;
      }
      const change = parseFloat(amountPaid) - totalAmount;
      if (change < 0) {
        Alert.alert('Thông báo', 'Số tiền trả không đủ');
        return;
      }
      dispatch(setChangeAmount(change.toFixed(0)));
      Alert.alert('Đã thanh toán thành công', 'Bạn muốn làm gì?', [
        {
          text: 'Lưu đơn',
          onPress: async () => {
            await saveOrder({
              id: Date.now(),
              cart: products.map((p) => ({ id: p.id, name: p.name, price: p.price, quantity: p.quantity })),
              totalAmount,
              customerName,
              date: new Date().toISOString(),
              status: 'Done'
            });
            dispatch(clearProducts());
            setCustomerName('');
          }
        },
        {
          text: 'Xuất hóa đơn PDF',
          onPress: async () => {
            await saveOrder({
              id: Date.now(),
              cart: products.map((p) => ({ id: p.id, name: p.name, price: p.price, quantity: p.quantity })),
              totalAmount,
              customerName,
              date: new Date().toISOString(),
              status: 'Done'
            });
            generatePDF();
          }
        }
      ]);
    } else if (paymentMethod === 'qr') {
      Alert.alert('Đã thanh toán thành công', 'Bạn muốn làm gì?', [
        {
          text: 'Lưu đơn',
          onPress: async () => {
            await saveOrder({
              id: Date.now(),
              cart: products.map((p) => ({ id: p.id, name: p.name, price: p.price, quantity: p.quantity })),
              totalAmount,
              customerName,
              date: new Date().toISOString(),
              status: 'Done'
            });
            dispatch(clearProducts());
            setCustomerName('');
          }
        },
        {
          text: 'Xuất hóa đơn PDF',
          onPress: async () => {
            await saveOrder({
              id: Date.now(),
              cart: products.map((p) => ({ id: p.id, name: p.name, price: p.price, quantity: p.quantity })),
              totalAmount,
              customerName,
              date: new Date().toISOString(),
              status: 'Done'
            });
            generatePDF();
          }
        }
      ]);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };
  const handleAmountPaidChange = (value: string) => {
    const numericValue = parseFloat(value.replace(/,/g, '')); 
    if (!isNaN(numericValue)) {
      dispatch(setAmountPaid(numericValue.toFixed(0)));  
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <View style={styles.logoutContainer}>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.headerText}>KPOP GOODS</Text>

            {/* Category Buttons */}
            <View style={styles.categoryButtonsContainer}>
              {['All', 'Albums', 'Cards', 'Accessories'].map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.selectedCategoryButton
                  ]}
                  onPress={() => {
                    setSelectedCategory(category);
                    filterProductsByCategory(category);
                  }}
                >
                  <Text style={styles.categoryButtonText}>{category}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Product List */}
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => String(item.id)}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              renderItem={({ item }) => (
                <View style={styles.productCard}>
                  <Image source={{ uri: item.image }} style={styles.productImage} />
                  <Text style={styles.productTitle}>{item.name}</Text>
                  <Text style={styles.productPrice}>{item.price} VND</Text>
                  <TouchableOpacity style={styles.addButton} onPress={() => addProductHandler(item, 1)}>
                    <Text style={styles.addButtonText}>Thêm vào đơn</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        }
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <View style={styles.cartItemContent}>
              <Image source={{ uri: item.imgUrl }} style={styles.cartItemImage} />
              <View style={styles.cartItemDetails}>
                <Text style={styles.cartItemTitle}>{item.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                  <TouchableOpacity style={styles.quantityBtn} onPress={() => adjustQuantity(item, -1)}>
                    <Text style={styles.quantityBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={{ marginHorizontal: 10 }}>{item.quantity}</Text>
                  <TouchableOpacity style={styles.quantityBtn} onPress={() => adjustQuantity(item, 1)}>
                    <Text style={styles.quantityBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.cartItemText}>{item.price * item.quantity} VND</Text>
                <TouchableOpacity
                  onPress={() => dispatch(deleteProduct(item.id))}
                  style={[styles.deleteButton, { marginTop: 5 }]}
                >
                  <FontAwesome name="trash-o" size={24} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footerContainer}>
            <View style={styles.summaryBox}>
              <Text style={styles.totalText}>Tổng số tiền cần trả:</Text>
              <Text style={styles.totalAmount}>{totalAmount} VND</Text>
            </View>
            <Text>Phương thức thanh toán:</Text>
            <Picker
              selectedValue={paymentMethod}
              onValueChange={(value) => dispatch(setPaymentMethod(value))}
              style={styles.paymentMethodPicker}
            >
              <Picker.Item label="Tiền mặt" value="cash" />
              <Picker.Item label="QR" value="qr" />
            </Picker>

            {/* QR Code or Cash Payment */}
            {paymentMethod === 'qr' && qrCodeUrl ? (
              <Image source={{ uri: qrCodeUrl }} style={styles.qrImage} />
            ) : null}

            {paymentMethod === 'cash' && (
              <>
            <TextInput
              style={styles.amountInput}
              placeholder="Nhập số tiền khách trả"
              onChangeText={handleAmountPaidChange}
              value={amountPaid}
              keyboardType="default"  
              autoCapitalize="none"   
              />
                <Text style={styles.changeText}>
  Tiền thối lại: {changeAmount && changeAmount !== '0' ? changeAmount : '0'}
</Text>

              </>
            )}

            <TouchableOpacity onPress={cancelOrder} style={styles.cancelButton} disabled={products.length === 0}>
              <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePayment} style={styles.paymentButton} disabled={products.length === 0}>
              <Text style={styles.paymentButtonText}>Thanh toán</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 5,
    marginRight: 15,
    marginLeft: 15,
    marginTop: 10
  },
  logoutContainer: {
    alignItems: 'flex-end',
    marginBottom: 10
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10
  },
  categoryButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15
  },
  categoryButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  selectedCategoryButton: {
    backgroundColor: '#fef8be'
  },
  categoryButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold'
  },
  columnWrapper: {
    justifyContent: 'space-around'
  },
  productCard: {
    width: Dimensions.get('window').width * 0.4,
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 5,
    marginBottom: 10
  },
  productImage: {
    width: 150,
    height: 100,
    borderRadius: 4
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
    textAlign: 'center'
  },
  productPrice: {
    fontSize: 14,
    color: '#cd9a03'
  },
  addButton: {
    backgroundColor: '#0424d8',
    paddingVertical: 8,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
    alignItems: 'center'
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
  cartItem: {
    marginBottom: 15,
    paddingHorizontal: 20
  },
  cartItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 10,
    elevation: 3
  },
  cartItemImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 10
  },
  cartItemDetails: {
    flex: 1
  },
  cartItemTitle: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  cartItemText: {
    fontSize: 14,
    color: '#333'
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5
  },
  quantityBtn: {
    backgroundColor: '#ddd',
    width: 30,
    height: 30,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  quantityBtnText: {
    fontSize: 18
  },
  footerContainer: {
    padding: 20
  },
  summaryBox: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
  },
  totalText: {
    fontSize: 16
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5
  },
  qrImage: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    margin: 10
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    marginTop: 10,
    fontSize: 16,
  },
  changeText: {
    fontSize: 16,
    marginBottom: 20
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center'
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  paymentButton: {
    backgroundColor: '#03dc1d',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center'
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  paymentMethodPicker: {
    width: '100%',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    marginTop: 10
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10
  },
  paymentMethodButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    margin: 5,
    borderRadius: 5
  },
  selectedPaymentMethod: {
    backgroundColor: '#0424d8'
  },
  paymentMethodButtonText: {
    color: '#333',
    fontWeight: 'bold'
  }
});
