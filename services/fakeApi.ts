import * as Location from 'expo-location';
const API_URL = 'https://67bf28a7b2320ee05012cdf4.mockapi.io';

// Lưu log đăng nhập (tracking vị trí)
export const saveLoginLog = async (data: {
  username: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}) => {
  try {
    const response = await fetch(`${API_URL}/loguser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    return await response.json();
  } catch (error) {
    console.error('Error saving login log:', error);
    throw error;
  }
};

// Lấy vị trí hiện tại của người dùng
export const getLocation = async () => {
  try {
    // Yêu cầu quyền truy cập vị trí
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Vị trí không được phép truy cập');
    }

    // Lấy tọa độ hiện tại
    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return {
      latitude: 0,
      longitude: 0,
    };
  }
};

// Lưu order
export const saveOrder = async (orderData: any) => {
  try {
    const response = await fetch(`${API_URL}/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    return await response.json();
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
};

// (Nếu cần) Lấy danh sách order
export const fetchOrderList = async () => {
  const response = await fetch(`${API_URL}/order`);
  return await response.json();
};
