import React, { useEffect } from 'react';
import { Slot, useRouter } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AuthCheck />
      </AuthProvider>
    </Provider>
  );
}

const AuthCheck = () => {
  const { isLoggedIn } = useAuth();  // Lấy trạng thái đăng nhập từ AuthContext
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');  // Nếu chưa đăng nhập, chuyển hướng đến trang login
    }
  }, [isLoggedIn, router]);

  return <Slot />; // Hiển thị các màn hình còn lại
};
