import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useFocusEffect } from 'expo-router';
import { fetchOrderList } from '../../services/fakeApi';

export default function StatisticsScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    try {
      const data = await fetchOrderList();
      setOrders(data);
      const stats = calculateDailyStats(data);
      setDailyStats(stats);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const calculateDailyStats = (ordersData: any[]) => {
    const statsMap: Record<string, { date: string; revenue: number; orderCount: number }> = {};
    ordersData.forEach((order) => {
      const dateObj = new Date(order.date);
      const dayStr = dateObj.toLocaleDateString('en-CA');
      if (!statsMap[dayStr]) {
        statsMap[dayStr] = { date: dayStr, revenue: 0, orderCount: 0 };
      }
      const amount = typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : order.totalAmount;
      statsMap[dayStr].revenue += isNaN(amount) ? 0 : amount;
      statsMap[dayStr].orderCount += 1;
    });
    return Object.values(statsMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  useEffect(() => {
    const interval = setInterval(() => {
      loadOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const chartData = {
    labels: dailyStats.map((s) => s.date),
    datasets: [{ data: dailyStats.map((s) => s.revenue) }]
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Thống kê doanh thu</Text>
      {dailyStats.length > 0 ? (
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 20}
          height={220}
          bezier
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
          }}
          style={styles.chart}
        />
      ) : (
        <Text style={styles.noData}>Không có dữ liệu thống kê</Text>
      )}
      <FlatList
        data={dailyStats}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <View style={styles.statItem}>
            <Text style={styles.statText}>Ngày: {item.date}</Text>
            <Text style={styles.statText}>Doanh thu: {item.revenue} VND</Text>
            <Text style={styles.statText}>Số đơn: {item.orderCount}</Text>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  chart: { borderRadius: 10, marginBottom: 20 },
  noData: { textAlign: 'center', fontStyle: 'italic' },
  statItem: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 2
  },
  statText: { fontSize: 16 }
});
