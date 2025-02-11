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

    transactions.forEach((transaction) => {
        const date = new Date(transaction.date).toISOString().split('T')[0]; 

        stats.push({
            date,
            revenue: parseFloat(transaction.totalAmount),
            orders: 1, 
        });
    });

    return stats;
};

const StatisticsScreen = () => {
    const transactions = useSelector((state: RootState) => state.transaction.transactions);
    const dailyStats = getDailyStats(transactions);

    const chartData = {
        labels: dailyStats.length > 0 ? dailyStats.map((stat) => stat.date) : ['Chưa có dữ liệu'],
        datasets: [
            {
                data: dailyStats.length > 0 ? dailyStats.map((stat) => stat.revenue) : [0],
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,  
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
                                backgroundColor: '#1cc910',
                                backgroundGradientFrom: '#1cc910',
                                backgroundGradientTo: '#1cc910',
                                decimalPlaces: 2,
                                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                style: { borderRadius: 16 },
                                propsForDots: { r: '6', strokeWidth: '2', stroke: '#ffa726' },
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
                <Text style={styles.statText}>Doanh thu: {item.revenue.toFixed(2)} VND</Text>
                <Text style={styles.statText}>Số đơn: {item.orders}</Text>
            </View>
        );
    };

    
    const data = [
        { type: 'chart' },
        ...dailyStats.map((stat) => ({ ...stat, type: 'stat' })), 
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
    container: {
        padding: 10,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        marginTop: 40,
    },
    chartContainer: {
        marginBottom: 20,
    },
    statItem: {
        padding: 10,
        borderBottomWidth: 1,
    },
    statText: {
        fontSize: 16,
    },
});

export default StatisticsScreen;
