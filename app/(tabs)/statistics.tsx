import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../store/types';
import { BarChart } from 'react-native-chart-kit';

const StatisticsScreen: React.FC<{ route: RouteProp<RootStackParamList, 'Statistics'> }> = ({ route }) => {
  const { transaction } = route.params || {};

  if (!transaction) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Thống kê Hóa Đơn</Text>
        <Text style={styles.errorText}>Không có dữ liệu đơn hàng.</Text>
      </View>
    );
  }

  const chartData = {
    labels: ['Số lượng đơn', 'Tổng tiền'],
    datasets: [
      {
        data: [transaction.items.length, transaction.totalAmount],
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thống kê Hóa Đơn</Text>

      {/* <BarChart
        data={chartData}
        width={300}
        height={200}
        yAxisLabel="$"
        chartConfig={{
          backgroundColor: '#4CAF50',
          backgroundGradientFrom: '#4CAF50',
          backgroundGradientTo: '#4CAF50',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        style={styles.chart}
      /> */}

      <FlatList
        data={transaction.items}
        renderItem={({ item }) => (
          <View style={styles.transactionCard}>
            <Text style={styles.transactionText}>{item.name} x {item.quantity}</Text>
            <Text style={styles.transactionText}>${item.price * item.quantity}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
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
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  // chart: {
  //   marginVertical: 20,
  //   borderRadius: 10,
  // },
  transactionCard: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
    borderRadius: 10,
  },
  transactionText: {
    fontSize: 16,
  },
});

export default StatisticsScreen;