import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AdminSidebar } from './_layout';
import { blink } from '../../src/blink/client';

const MetricCard = ({ title, value, change, icon, color }: {
  title: string;
  value: string;
  change: string;
  icon: string;
  color: string;
}) => (
  <View className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
    <View className="flex-row items-center justify-between mb-4">
      <View className={`w-12 h-12 rounded-lg ${color} items-center justify-center`}>
        <Ionicons name={icon as any} size={24} color="white" />
      </View>
      <Text className={`text-sm font-medium ${
        change.startsWith('+') ? 'text-green-600' : 'text-red-600'
      }`}>
        {change}
      </Text>
    </View>
    <Text className="text-2xl font-bold text-gray-900 mb-1">{value}</Text>
    <Text className="text-sm text-gray-500">{title}</Text>
  </View>
);

const ChartPlaceholder = ({ title, height = 'h-64' }: { title: string; height?: string }) => (
  <View className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
    <Text className="text-lg font-semibold text-gray-900 mb-4">{title}</Text>
    <View className={`${height} bg-gray-50 rounded-lg items-center justify-center`}>
      <Ionicons name="bar-chart-outline" size={48} color="#9CA3AF" />
      <Text className="text-gray-500 mt-2">Chart visualization coming soon</Text>
    </View>
  </View>
);

const TopServicesList = ({ services }: { services: any[] }) => (
  <View className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
    <Text className="text-lg font-semibold text-gray-900 mb-4">Top Services</Text>
    {services.length === 0 ? (
      <View className="py-8 items-center">
        <Ionicons name="trending-up-outline" size={32} color="#9CA3AF" />
        <Text className="text-gray-500 mt-2">No service data available</Text>
      </View>
    ) : (
      services.slice(0, 5).map((service, index) => (
        <View key={service.id} className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
          <View className="flex-row items-center flex-1">
            <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
              <Text className="text-sm font-semibold text-blue-600">{index + 1}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-medium text-gray-900">{service.name}</Text>
              <Text className="text-sm text-gray-500">{service.total_bookings || 0} bookings</Text>
            </View>
          </View>
          <Text className="text-sm font-semibold text-gray-900">${service.base_price}</Text>
        </View>
      ))
    )}
  </View>
);

export default function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    activeUsers: 0,
    avgOrderValue: 0,
    topServices: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load data from different tables
      const [bookings, users, services] = await Promise.all([
        blink.db.bookings.list(),
        blink.db.users.list(),
        blink.db.services.list()
      ]);

      // Calculate metrics
      const completedBookings = bookings.filter((b: any) => b.status === 'completed');
      const totalRevenue = completedBookings.reduce((sum: number, b: any) => sum + (parseFloat(b.total_amount) || 0), 0);
      const avgOrderValue = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;

      // Get active users (users with at least one booking)
      const activeUserIds = new Set(bookings.map((b: any) => b.customer_id));
      const activeUsers = activeUserIds.size;

      // Calculate service popularity
      const serviceBookingCounts = bookings.reduce((acc: any, booking: any) => {
        acc[booking.service_id] = (acc[booking.service_id] || 0) + 1;
        return acc;
      }, {});

      const topServices = services
        .map((service: any) => ({
          ...service,
          total_bookings: serviceBookingCounts[service.id] || 0
        }))
        .sort((a: any, b: any) => b.total_bookings - a.total_bookings);

      setAnalytics({
        totalRevenue,
        totalBookings: bookings.length,
        activeUsers,
        avgOrderValue,
        topServices
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const timeRanges = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: '1y', label: '1 Year' },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row h-full">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <ScrollView className="flex-1 p-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-8">
            <View>
              <Text className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</Text>
              <Text className="text-gray-600">Track your platform's performance and growth</Text>
            </View>
            
            <View className="flex-row gap-2">
              {timeRanges.map((range) => (
                <TouchableOpacity
                  key={range.id}
                  onPress={() => setTimeRange(range.id)}
                  className={`px-4 py-2 rounded-lg ${
                    timeRange === range.id ? 'bg-blue-600' : 'bg-white border border-gray-200'
                  }`}
                >
                  <Text className={`font-medium ${
                    timeRange === range.id ? 'text-white' : 'text-gray-700'
                  }`}>
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {loading ? (
            <View className="bg-white p-12 rounded-xl border border-gray-200 items-center mb-8">
              <Text className="text-gray-500">Loading analytics...</Text>
            </View>
          ) : (
            <>
              {/* Key Metrics */}
              <View className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                  title="Total Revenue"
                  value={`$${analytics.totalRevenue.toLocaleString()}`}
                  change="+12.5%"
                  icon="trending-up"
                  color="bg-green-600"
                />
                <MetricCard
                  title="Total Bookings"
                  value={analytics.totalBookings.toString()}
                  change="+8.2%"
                  icon="calendar"
                  color="bg-blue-600"
                />
                <MetricCard
                  title="Active Users"
                  value={analytics.activeUsers.toString()}
                  change="+15.3%"
                  icon="people"
                  color="bg-purple-600"
                />
                <MetricCard
                  title="Avg Order Value"
                  value={`$${analytics.avgOrderValue.toFixed(2)}`}
                  change="+5.7%"
                  icon="card"
                  color="bg-amber-600"
                />
              </View>

              {/* Charts Row */}
              <View className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <ChartPlaceholder title="Revenue Trends" />
                <ChartPlaceholder title="Booking Volume" />
              </View>

              {/* Bottom Row */}
              <View className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <TopServicesList services={analytics.topServices} />
                <ChartPlaceholder title="User Growth" height="h-80" />
              </View>

              {/* Additional Charts */}
              <View className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ChartPlaceholder title="Service Categories" height="h-64" />
                <ChartPlaceholder title="Provider Performance" height="h-64" />
                <ChartPlaceholder title="Customer Satisfaction" height="h-64" />
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}