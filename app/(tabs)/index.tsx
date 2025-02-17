import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert, Image, StyleSheet, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { addProduct, clearProducts, deleteProduct, setAmountPaid, setChangeAmount, setPaymentMethod, updateProduct } from '@/store/productsSlice';
import { Picker } from '@react-native-picker/picker';
import QRCode from 'react-native-qrcode-svg';
import { addTransaction } from '../../store/transactionSlice';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { fetchProducts, saveOrder, Product } from '../../services/fakeApi';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { PaymentTransaction } from '../../store/transactionSlice';

const CashierScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const products = useSelector((state: RootState) => state.products.products);
  const paymentMethod = useSelector((state: RootState) => state.products.paymentMethod);
  const amountPaid = useSelector((state: RootState) => state.products.amountPaid);
  const changeAmount = useSelector((state: RootState) => state.products.changeAmount);

  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productQuantity, setProductQuantity] = useState('');
  const [customerName, setCustomerName] = useState(''); // Thêm phần tên khách hàng
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isInvoiceGenerated, setIsInvoiceGenerated] = useState(false);

  const totalAmount = products.reduce((total, product) => total + product.price * product.quantity, 0);

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      const productsFromAPI = await fetchProducts();
      setAvailableProducts(productsFromAPI);
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (paymentMethod === 'qr') {
      setQrCodeUrl(generateQRCode(totalAmount));
    }
  }, [paymentMethod, totalAmount]);

  const generateQRCode = (totalAmount: number) => {
    // Giả sử bạn đã có URL API thanh toán qua QR
    const paymentUrl = `https://your-payment-gateway.com/qr?amount=${totalAmount}&orderId=${Date.now()}`;
    return paymentUrl;
  };

  const cancelOrder = () => {
    if (isInvoiceGenerated) {
      dispatch(clearProducts());
    } else {
      Alert.alert('Thông báo', 'Bạn chưa xuất hóa đơn, vẫn muốn hủy đơn?', [
        { text: 'Không', style: 'cancel' },
        { text: 'Có', onPress: () => dispatch(clearProducts()) },
      ]);
    }
  };

  const addProductHandler = () => {
    if (selectedProduct && productQuantity) {
      const existingProduct = products.find(product => product.name === selectedProduct.name);
      if (existingProduct) {
        dispatch(updateProduct({ ...existingProduct, quantity: existingProduct.quantity + parseInt(productQuantity) }));
      } else {
        const newProduct = {
          id: Date.now(),
          name: selectedProduct.name,
          price: selectedProduct.price,
          imgUrl: selectedProduct.imgUrl,
          quantity: parseInt(productQuantity),
        };
        dispatch(addProduct(newProduct));
      }
      setProductQuantity('');
    }
  };

  const handleAmountPaidChange = (value: string) => {
    dispatch(setAmountPaid(value));
  };

  useEffect(() => {
    if (amountPaid && totalAmount) {
      const change = parseFloat(amountPaid) - totalAmount;
      dispatch(setChangeAmount(change.toFixed(0)));
    }
  }, [amountPaid, totalAmount, dispatch]);

  const handlePayment = () => {
    if (paymentMethod === 'cash' && amountPaid) {
      const change = parseFloat(amountPaid) - totalAmount;
      if (change >= 0) {
        dispatch(setChangeAmount(change.toFixed(2)));
        const transaction: PaymentTransaction = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          totalAmount: totalAmount.toFixed(2),
          paymentMethod: 'cash',
          orderStatus: 'Done',
          products: products.map((product) => product.name),
          customerName: customerName,
        };
        dispatch(addTransaction(transaction));
        Alert.alert('Thông báo', 'Thanh toán thành công!', [
          { text: 'Có', onPress: generatePDF },
          { text: 'Không', onPress: async () => { 
            await saveOrder({ id: Date.now(), cart: products.map((product) => ({ id: product.id, name: product.name, price: product.price })), totalAmount, status: 'Done' });
            dispatch(clearProducts()); 
          }},
        ]);
      } else {
        Alert.alert('Thông báo', 'Số tiền trả không đủ');
      }
    } else if (paymentMethod === 'qr') {
      const transaction: PaymentTransaction = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        totalAmount: totalAmount.toFixed(2),
        paymentMethod: 'qr',
        orderStatus: 'Done',
        products: products.map((product) => product.name),
        customerName: customerName,
      };
      dispatch(addTransaction(transaction));
      Alert.alert('Thông báo', 'Thanh toán qua QR thành công!', [
        { text: 'Có', onPress: generatePDF },
        { text: 'Không', onPress: async () => { 
          await saveOrder({ id: Date.now(), cart: products.map((product) => ({ id: product.id, name: product.name, price: product.price })), totalAmount, status: 'Done' });
          dispatch(clearProducts()); 
        }},
      ]);
    } else {
      Alert.alert('Thông báo', 'Vui lòng chọn phương thức thanh toán và nhập số tiền');
    }
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
          ${products.map(item => `
            <tr>
              <td>${customerName}</td>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>${item.price} VND</td>
              <td>${item.price * item.quantity} VND</td>
            </tr>
          `).join('')}
        </table>
        <h3 style="text-align:right;">Tổng cộng: ${totalAmount} VND</h3>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      if (uri) {
        Alert.alert('Hóa đơn đã được tạo', 'Bạn có muốn chia sẻ?', [
          { text: 'Đóng' },
          { text: 'Chia sẻ', onPress: () => Sharing.shareAsync(uri) },
        ]);
        dispatch(clearProducts());
      } else {
        Alert.alert('Lỗi', 'Không thể tạo file PDF.');
      }
    } catch (error) {
      console.error('Lỗi tạo PDF:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tạo PDF.');
    }
  };

  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Menu</Text>
          
          <FlatList
            data={availableProducts}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedProduct(item);
                  setProductQuantity('1');
                }}
                style={styles.productCard}
              >
                <Image source={{ uri: item.image }} style={styles.productImage} />
                <Text style={styles.productTitle}>{item.name}</Text>
                <Text style={styles.productPrice}>{item.price} VND</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    setSelectedProduct(item);
                    setProductQuantity('1');
                    addProductHandler();
                  }}
                >
                  <Text style={styles.addButtonText}>Thêm vào đơn</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
          <TextInput
            style={styles.customerNameInput}
            placeholder="Nhập tên khách hàng"
            value={customerName}
            onChangeText={setCustomerName}
          />
        </View>
      }
      data={products}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.cartItem}>
          <View style={styles.cartItemContent}>
            <Image source={{ uri: item.imgUrl }} style={styles.cartItemImage} />
            <View style={styles.cartItemDetails}>
              <Text style={styles.cartItemTitle}>{item.name}</Text>
              <Text style={styles.cartItemText}>Số lượng: {item.quantity}</Text>
              <Text style={styles.cartItemText}>{item.price} VND</Text>
              <TouchableOpacity onPress={() => dispatch(deleteProduct(item.id))} style={styles.deleteButton}>
                <FontAwesome name="trash-o" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      ListFooterComponent={
        <View style={styles.footerContainer}>
          <Text style={styles.totalText}>Tổng số tiền cần trả:</Text>
          <Text style={styles.totalAmount}>{totalAmount} VND</Text>
          <Picker
            selectedValue={paymentMethod}
            onValueChange={(itemValue) => dispatch(setPaymentMethod(itemValue))}
            style={styles.paymentMethodPicker}
          >
            <Picker.Item label="Tiền mặt" value="cash" />
            <Picker.Item label="QR" value="qr" />
          </Picker>
          {paymentMethod === 'qr' && qrCodeUrl && (
            <QRCode value={qrCodeUrl} size={200} />
          )}
          <TextInput
            placeholder="Nhập số tiền khách trả"
            value={paymentMethod === 'cash' ? amountPaid : ''}
            onChangeText={handleAmountPaidChange}
            keyboardType="numeric"
            editable={paymentMethod === 'cash'} 
            style={styles.amountInput}
          />
          <Text style={styles.changeText}>Tiền thối lại: {paymentMethod === 'cash' ? changeAmount : 'Không áp dụng'}</Text>
          <TouchableOpacity onPress={cancelOrder} style={styles.cancelButton} disabled={products.length === 0}>
            <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePayment} style={styles.paymentButton} disabled={products.length === 0}>
            <Text style={styles.paymentButtonText}>Thanh toán</Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  customerNameInput: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  headerContainer: {
    padding: 15,
    backgroundColor: '#fffdfd',
    marginBottom: 5,
    marginRight : 15,
    marginLeft: 15,
    marginTop: 40,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom : 20,
    marginTop: 10,
  },
  columnWrapper: {
    justifyContent: 'space-around',
  },
  productCard: {
    width: Dimensions.get('window').width *0.4 ,
    backgroundColor: '#fffafa',
    padding: 5,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 5,
    marginBottom: 10,

  },
  productImage: {
    width: 150,
    height: 100,
    borderRadius: 4,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  productPrice: {
    fontSize: 14,
    color: '#cd9a03',
  },
  addButton: {
    backgroundColor: '#0424d8',
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItem: {
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  cartItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#cdd3d4',
    padding: 10,
    borderRadius: 10,
    elevation: 3,
  },
  cartItemImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 10,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItemText: {
    fontSize: 14,
    color: '#333',
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  footerContainer: {
    padding: 20,
  },
  totalText: {
    fontSize: 16,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  paymentMethodPicker: {
    width: '100%',
    marginBottom: 15,
    backgroundColor: '#fff', 
    borderRadius: 8,        
    borderColor: '#ccc',     
    borderWidth: 1,          
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#ccc',    
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff', 
    marginBottom: 10,
  },
  changeText: {
    fontSize: 16,
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentButton: {
    backgroundColor: '#03dc1d',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qrContainer: {
    marginVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CashierScreen;
