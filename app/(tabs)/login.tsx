// app/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import localUsers from '../../assets/data/users.json';
import { saveLoginLog } from '../../services/fakeApi';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập username và password');
      return;
    }
    const foundUser = localUsers.find(
      (u) => u.username === username && u.password === password
    );
    if (!foundUser) {
      Alert.alert('Thông báo', 'Tên đăng nhập hoặc mật khẩu không đúng');
      return;
    }
    // Yêu cầu quyền truy cập vị trí
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Thông báo', 'Ứng dụng cần quyền truy cập vị trí');
      return;
    }
    let lat = 0, lon = 0;
    try {
      const location = await Location.getCurrentPositionAsync({});
      lat = location.coords.latitude;
      lon = location.coords.longitude;
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại. Hãy bật GPS hoặc cấu hình mock location.');
      return;
    }
    try {
      await saveLoginLog({
        username,
        latitude: lat,
        longitude: lon,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu log đăng nhập');
      return;
    }
    login(foundUser);
    Alert.alert('Đăng nhập thành công', `Xin chào, ${foundUser.username}`);
    // Đợi một chút để đảm bảo Root Layout đã mount
    setTimeout(() => {
      router.replace('/');
    }, 500);
    // Reset ô nhập
    setUsername('');
    setPassword('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Đăng nhập</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={setUsername}
        value={username}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10, backgroundColor: '#fff' },
  loginButton: { backgroundColor: 'blue', padding: 15, borderRadius: 8, alignItems: 'center' },
  loginButtonText: { color: '#fff', fontWeight: 'bold' }
});
