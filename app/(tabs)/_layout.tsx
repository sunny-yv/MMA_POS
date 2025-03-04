import React from 'react';
import { Tabs } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '../../store/store';
import { AuthProvider } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function Layout() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Tabs>
          <Tabs.Screen
            name="menu"
            options={{
              title: 'Menu',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="fast-food-outline" size={size} color={color} />
              )
            }}
          />
          <Tabs.Screen
            name="statistics"
            options={{
              title: 'Statistics',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="stats-chart-outline" size={size} color={color} />
              )
            }}
          />
        </Tabs>
      </AuthProvider>
    </Provider>
  );
}
