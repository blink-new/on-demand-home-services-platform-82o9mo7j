import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AdminSidebar } from './_layout';
import { blink } from '../../src/blink/client';

const StatCard = ({ title, value, change, icon, color }: {
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
      <Text className="text-sm text-green-600 font-medium">{change}</Text>
    </View>
    <Text className="text-2xl font-bold text-gray-900 mb-1">{value}</Text>
    <Text className="text-sm text-gray-500">{title}</Text>
  </View>
);

const RecentActivity = () => {
  const activities = [
    { id: 1, type: 'booking', message: 'New booking for House Cleaning', time: '2 min ago', icon: 'calendar', color: 'text-blue-600' },
    { id: 2, type: 'provider', message: 'John Smith completed a plumbing job', time: '5 min ago', icon: 'checkmark-circle', color: 'text-green-600' },
    { id: 3, type: 'user', message: 'New user registered: Sarah Johnson', time: '10 min ago', icon: 'person-add', color: 'text-purple-600' },
    { id: 4, type: 'payment', message: 'Payment of $150 processed', time: '15 min ago', icon: 'card', color: 'text-amber-600' },
    { id: 5, type: 'review', message: 'New 5-star review received', time: '20 min ago', icon: 'star', color: 'text-yellow-600' },
  ];

  return (
    <View className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <View className="p-6 border-b border-gray-200">
        <Text className="text-lg font-semibold text-gray-900">Recent Activity</Text>
      </View>
      <ScrollView className="max-h-80">
        {activities.map((activity) => (
          <View key={activity.id} className="flex-row items-center p-4 border-b border-gray-100 last:border-b-0">
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
              <Ionicons name={activity.icon as any} size={18} color="#6B7280" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-900">{activity.message}</Text>
              <Text className="text-xs text-gray-500 mt-1">{activity.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const QuickActions = () => {
  const actions = [
    { id: 1, title: 'Add New Service', icon: 'add-circle', color: 'bg-blue-600' },
    { id: 2, title: 'Approve Providers', icon: 'checkmark-circle', color: 'bg-green-600' },
    { id: 3, title: 'View Reports', icon: 'bar-chart', color: 'bg-purple-600' },
    { id: 4, title: 'Manage Disputes', icon: 'alert-circle', color: 'bg-red-600' },
  ];

  return (
    <View className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</Text>
      <View className="flex-row flex-wrap gap-3">
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            className="flex-1 min-w-[140px] p-4 rounded-lg border border-gray-200 items-center"
          >
            <View className={`w-12 h-12 rounded-lg ${action.color} items-center justify-center mb-3`}>
              <Ionicons name={action.icon as any} size={24} color="white" />
            </View>
            <Text className="text-sm font-medium text-gray-700 text-center">{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default function AdminOverview() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: '0',
    totalProviders: '0',
    totalBookings: '0',
    totalRevenue: '$0'
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load users count
      const users = await blink.db.users.list();
      const providers = await blink.db.providers.list();
      const bookings = await blink.db.bookings.list();
      
      setStats({
        totalUsers: users.length.toString(),
        totalProviders: providers.length.toString(),
        totalBookings: bookings.length.toString(),
        totalRevenue: `$${(bookings.length * 75).toLocaleString()}`
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row h-full">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <ScrollView className="flex-1 p-6">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</Text>
            <Text className="text-gray-600">Welcome back! Here's what's happening with your platform.</Text>
          </View>

          {/* Stats Grid */}
          <View className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              change="+12%"
              icon="people"
              color="bg-blue-600"
            />
            <StatCard
              title="Active Providers"
              value={stats.totalProviders}
              change="+8%"
              icon="hammer"
              color="bg-green-600"
            />
            <StatCard
              title="Total Bookings"
              value={stats.totalBookings}
              change="+23%"
              icon="calendar"
              color="bg-purple-600"
            />
            <StatCard
              title="Revenue"
              value={stats.totalRevenue}
              change="+15%"
              icon="card"
              color="bg-amber-600"
            />
          </View>

          {/* Content Grid */}
          <View className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivity />
            <QuickActions />
          </View>

          {/* Charts Section */}
          <View className="mt-8">
            <View className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">Booking Trends</Text>
              <View className="h-64 bg-gray-50 rounded-lg items-center justify-center">
                <Ionicons name="bar-chart-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2">Chart visualization coming soon</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}