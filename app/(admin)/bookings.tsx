import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AdminSidebar } from './_layout';
import { blink } from '../../src/blink/client';

const BookingCard = ({ booking, onUpdateStatus }: { 
  booking: any; 
  onUpdateStatus: (bookingId: string, status: string) => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-600';
      case 'in_progress': return 'bg-blue-100 text-blue-600';
      case 'confirmed': return 'bg-purple-100 text-purple-600';
      case 'pending': return 'bg-yellow-100 text-yellow-600';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <View className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-4">
      <View className="flex-row items-start justify-between mb-4">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <Text className="text-lg font-semibold text-gray-900 mr-3">
              Booking #{booking.id?.slice(-6)}
            </Text>
            <View className={`px-3 py-1 rounded-full ${getStatusColor(booking.status)}`}>
              <Text className="text-xs font-medium capitalize">
                {booking.status?.replace('_', ' ') || 'pending'}
              </Text>
            </View>
          </View>
          
          <Text className="text-sm text-gray-600 mb-1">
            Service: {booking.service_name || 'Unknown Service'}
          </Text>
          <Text className="text-sm text-gray-600 mb-1">
            Customer: {booking.customer_name || 'Unknown Customer'}
          </Text>
          <Text className="text-sm text-gray-600 mb-1">
            Provider: {booking.provider_name || 'Not assigned'}
          </Text>
          <Text className="text-sm text-gray-600 mb-3">
            Date: {new Date(booking.scheduled_date || booking.created_at).toLocaleDateString()}
          </Text>
          
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-gray-900">
              ${booking.total_amount || '0'}
            </Text>
            <Text className="text-xs text-gray-400">
              {new Date(booking.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
        
        <View className="ml-4">
          <TouchableOpacity className="w-10 h-10 rounded-lg bg-blue-50 items-center justify-center">
            <Ionicons name="eye" size={16} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </View>
      
      {booking.status === 'pending' && (
        <View className="flex-row gap-2 pt-4 border-t border-gray-200">
          <TouchableOpacity
            onPress={() => onUpdateStatus(booking.id, 'confirmed')}
            className="flex-1 py-2 bg-green-50 rounded-lg items-center"
          >
            <Text className="text-green-600 font-medium">Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onUpdateStatus(booking.id, 'cancelled')}
            className="flex-1 py-2 bg-red-50 rounded-lg items-center"
          >
            <Text className="text-red-600 font-medium">Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default function AdminBookings() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const bookingsData = await blink.db.bookings.list({
        orderBy: { created_at: 'desc' }
      });
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      await blink.db.bookings.update(bookingId, { status });
      await loadBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const filteredBookings = bookings.filter((booking: any) => {
    const matchesSearch = booking.service_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const bookingStats = {
    total: bookings.length,
    pending: bookings.filter((b: any) => b.status === 'pending').length,
    confirmed: bookings.filter((b: any) => b.status === 'confirmed').length,
    completed: bookings.filter((b: any) => b.status === 'completed').length,
    cancelled: bookings.filter((b: any) => b.status === 'cancelled').length,
  };

  const totalRevenue = bookings
    .filter((b: any) => b.status === 'completed')
    .reduce((sum: number, b: any) => sum + (parseFloat(b.total_amount) || 0), 0);

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row h-full">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <ScrollView className="flex-1 p-6">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-2">Booking Management</Text>
            <Text className="text-gray-600">Monitor and manage all service bookings</Text>
          </View>

          {/* Stats Cards */}
          <View className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <View className="bg-white p-4 rounded-xl border border-gray-200">
              <Text className="text-2xl font-bold text-gray-900">{bookingStats.total}</Text>
              <Text className="text-sm text-gray-500">Total Bookings</Text>
            </View>
            <View className="bg-white p-4 rounded-xl border border-gray-200">
              <Text className="text-2xl font-bold text-yellow-600">{bookingStats.pending}</Text>
              <Text className="text-sm text-gray-500">Pending</Text>
            </View>
            <View className="bg-white p-4 rounded-xl border border-gray-200">
              <Text className="text-2xl font-bold text-purple-600">{bookingStats.confirmed}</Text>
              <Text className="text-sm text-gray-500">Confirmed</Text>
            </View>
            <View className="bg-white p-4 rounded-xl border border-gray-200">
              <Text className="text-2xl font-bold text-green-600">{bookingStats.completed}</Text>
              <Text className="text-sm text-gray-500">Completed</Text>
            </View>
            <View className="bg-white p-4 rounded-xl border border-gray-200">
              <Text className="text-2xl font-bold text-amber-600">${totalRevenue.toFixed(2)}</Text>
              <Text className="text-sm text-gray-500">Revenue</Text>
            </View>
          </View>

          {/* Filters */}
          <View className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
            <View className="flex-row items-center gap-4">
              <View className="flex-1">
                <TextInput
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </View>
              <View className="flex-row gap-2">
                {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => setFilterStatus(status)}
                    className={`px-3 py-2 rounded-lg ${
                      filterStatus === status ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <Text className={`font-medium text-xs capitalize ${
                      filterStatus === status ? 'text-white' : 'text-gray-700'
                    }`}>
                      {status.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Bookings List */}
          <View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-semibold text-gray-900">
                Bookings ({filteredBookings.length})
              </Text>
              <TouchableOpacity className="px-4 py-2 bg-blue-600 rounded-lg">
                <Text className="text-white font-medium">Export Data</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View className="bg-white p-12 rounded-xl border border-gray-200 items-center">
                <Text className="text-gray-500">Loading bookings...</Text>
              </View>
            ) : filteredBookings.length === 0 ? (
              <View className="bg-white p-12 rounded-xl border border-gray-200 items-center">
                <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 mt-4">No bookings found</Text>
              </View>
            ) : (
              filteredBookings.map((booking: any) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}