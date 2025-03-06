import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import localUsers from '../assets/data/users.json';
import { saveLoginLog, getLocation } from '../services/fakeApi';

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

    try {
      // Lấy vị trí của người dùng
      const location = await getLocation();
      const { latitude, longitude } = location;

      // Lưu log đăng nhập
      await saveLoginLog({
        username,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu log đăng nhập');
      return;
    }

    login(foundUser);
    Alert.alert('Đăng nhập thành công', `Xin chào, ${foundUser.username}`);
    router.replace('/');
  };

  return (
    <ImageBackground
      source={{ uri: 'https://i.pinimg.com/474x/75/9f/fc/759ffc2cbbd1e75376aa2f9d57c5c170.jpg' }}
      style={styles.container}
    >
      <View style={styles.overlay}>
        <Text style={styles.header}>Đăng nhập</Text>
        
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={24} color="#ccc" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            onChangeText={setUsername}
            value={username}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={24} color="#ccc" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
          />
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  overlay: {
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    paddingBottom: 30, 
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3b3a3a',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',  // Nền trong suốt cho ô nhập
    paddingHorizontal: 15,
    marginBottom: 15,
    borderRadius: 8,
    width: '100%',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: 'transparent',  // Nền ô nhập trong suốt
    color: '#333',  // Màu chữ đen
  },
  loginButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
