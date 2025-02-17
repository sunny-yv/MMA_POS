import React from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { LineChart } from 'react-native-chart-kit';

interface Transaction {
  id: string;
  date: string;
  totalAmount: string;
  paymentMethod: 'cash' | 'qr';
}

const getDailyStats = (transactions: Transaction[]) => {
  const stats: { date: string; revenue: number; orders: number }[] = [];

  // Group transactions by date and calculate revenue and number of orders
  transactions.forEach((transaction) => {
    const date = new Date(transaction.date).toISOString().split('T')[0]; // Chuyển ngày sang định dạng YYYY-MM-DD

    // Check if the date already exists in stats
    const existingStat = stats.find((stat) => stat.date === date);

    if (existingStat) {
      // If the date exists, update the revenue and orders count
      existingStat.revenue += parseFloat(transaction.totalAmount);
      existingStat.orders += 1;
    } else {
      // If the date doesn't exist, create a new entry
      stats.push({
        date,
        revenue: parseFloat(transaction.totalAmount),
        orders: 1,
      });
    }
  });

  return stats;
};

const StatisticsScreen = () => {
  const transactions = useSelector((state: RootState) => state.transaction.transactions);
  const dailyStats = getDailyStats(transactions);

  const chartData = {
    // Lấy ngày của từng giao dịch và đảm bảo không có dữ liệu trống
    labels: transactions.length > 0 ? transactions.map((transaction) => new Date(transaction.date).toLocaleDateString()) : ['Chưa có dữ liệu'],
    datasets: [
      {
        data: transactions.length > 0 ? transactions.map((transaction) => parseFloat(transaction.totalAmount)) : [0],
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,  // Đổi màu đường line
        strokeWidth: 2,
      },
    ],
  };
  

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'chart') {
      return (
        <View style={styles.chartContainer}>
          {dailyStats.length > 0 ? (
            <LineChart
              data={chartData}
              width={Dimensions.get('window').width}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#eff4ef',
                backgroundGradientTo: '#0529f4',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: { borderRadius: 20 },
                propsForDots: { r: '6', strokeWidth: '2', stroke: '#1501f4' },
              }}
              bezier
            />
          ) : (
            <Text style={{ textAlign: 'center', fontSize: 16, color: 'gray' }}>
              Chưa có giao dịch nào.
            </Text>
          )}
        </View>
      );
    }

    return (
      <View style={styles.statItem}>
        <Text style={styles.statText}>Ngày: {new Date(item.date).toLocaleDateString('vi-VN')}</Text>
        <Text style={styles.statText}>Doanh thu: {item.revenue.toFixed(0)} VND</Text>
        <Text style={styles.statText}>Số đơn: {item.orders}</Text>
      </View>
    );
  };

  const data = [
    { type: 'chart' },
    ...dailyStats.map((stat) => ({ ...stat, type: 'stat' })), // Gán type cho các phần tử trong dailyStats
  ];

  return (
    <FlatList
      data={data}
      keyExtractor={(item, index) => `${item.type}-${index}`}
      renderItem={renderItem}
      ListHeaderComponent={
        <Text style={styles.header}>Thống kê doanh thu</Text>
      }
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
};

const styles = StyleSheet.create({
  statText: {
    fontSize: 16,
  },
  container: {
    padding: 10,
    backgroundColor: '#f7f7f7',  // Đặt màu nền tổng thể sáng
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 40,
    color: '#007bff', // Màu chữ tiêu đề
  },
  chartContainer: {
    marginBottom: 20,
  },
  statItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#ffffff',  // Màu nền đơn hàng trắng
    borderRadius: 10,
    elevation: 3,
  },
  orderItem: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 3,
  },
  orderText: {
    fontSize: 16,
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  done: {
    color: 'green',
  },
  canceled: {
    color: 'red',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default StatisticsScreen;
