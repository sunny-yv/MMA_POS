import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}> 
      <Tabs.Screen
       name="index" 
       options={{
         title: 'Menu',  
         tabBarIcon: ({ color, size }) => (
           <Ionicons name="storefront" size={size} color={color} />
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
  );
}
