import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { blink } from '../src/blink/client';
import { colors } from '../src/constants/colors';

interface Booking {
  id: string;
  service_id: string;
  provider_id: string;
  customer_id: string;
  status: string;
  scheduled_date: string;
  scheduled_time: string;
  address: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
}

interface Provider {
  id: string;
  name: string;
  phone: string;
  rating: number;
}

export default function BookingTrackingScreen() {
  const { bookingId } = useLocalSearchParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

  const statusSteps = [
    { key: 'pending', label: 'Booking Confirmed', icon: 'checkmark-circle' },
    { key: 'accepted', label: 'Provider Assigned', icon: 'person' },
    { key: 'in_progress', label: 'Service Started', icon: 'play-circle' },
    { key: 'completed', label: 'Service Completed', icon: 'checkmark-done-circle' }
  ];

  useEffect(() => {
    loadBookingDetails();
    
    // Set up real-time updates
    const interval = setInterval(loadBookingDetails, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadBookingDetails = async () => {
    try {
      const bookingData = await blink.db.bookings.list({ 
        where: { id: bookingId } 
      });
      
      if (bookingData.length > 0) {
        const bookingInfo = bookingData[0];
        setBooking(bookingInfo);
        
        // Load service details
        const serviceData = await blink.db.services.list({
          where: { id: bookingInfo.service_id }
        });
        if (serviceData.length > 0) setService(serviceData[0]);
        
        // Load provider details
        const providerData = await blink.db.providers.list({
          where: { id: bookingInfo.provider_id }
        });
        if (providerData.length > 0) setProvider(providerData[0]);
      }
    } catch (error) {
      console.error('Error loading booking details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              await blink.db.bookings.update(booking!.id, { 
                status: 'cancelled',
                updated_at: new Date().toISOString()
              });
              Alert.alert('Booking Cancelled', 'Your booking has been cancelled successfully.');
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleContactProvider = () => {
    Alert.alert(
      'Contact Provider',
      `Call ${provider?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => {
          // In a real app, this would open the phone dialer
          Alert.alert('Calling...', `Calling ${provider?.name}`);
        }}
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.amber[500];
      case 'accepted': return colors.blue[500];
      case 'in_progress': return colors.green[500];
      case 'completed': return colors.green[600];
      case 'cancelled': return colors.red[500];
      default: return colors.gray[500];
    }
  };

  const getCurrentStepIndex = () => {
    if (!booking) return 0;
    return statusSteps.findIndex(step => step.key === booking.status);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600">Loading...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600">Booking not found</Text>
      </View>
    );
  }

  const currentStepIndex = getCurrentStepIndex();

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-6 border-b border-gray-200">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mb-4"
        >
          <Ionicons name="arrow-back" size={24} color={colors.gray[600]} />
        </TouchableOpacity>
        
        <Text className="text-2xl font-bold text-gray-900 mb-2">Track Your Service</Text>
        <Text className="text-gray-600">Booking ID: {booking.id.slice(-8)}</Text>
      </View>

      {/* Status Progress */}
      <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Service Status</Text>
        
        <View className="space-y-4">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <View key={step.key} className="flex-row items-center">
                <View className={`w-10 h-10 rounded-full items-center justify-center ${
                  isCompleted 
                    ? 'bg-green-100' 
                    : 'bg-gray-100'
                }`}>
                  <Ionicons 
                    name={step.icon as any} 
                    size={20} 
                    color={isCompleted ? colors.green[600] : colors.gray[400]} 
                  />
                </View>
                
                <View className="ml-4 flex-1">
                  <Text className={`font-medium ${
                    isCompleted ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </Text>
                  {isCurrent && (
                    <Text className="text-sm text-blue-600 mt-1">
                      Current status
                    </Text>
                  )}
                </View>
                
                {isCompleted && (
                  <Ionicons name="checkmark" size={20} color={colors.green[600]} />
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Service Details */}
      <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-gray-900 mb-3">Service Details</Text>
        
        <View className="space-y-3">
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Service</Text>
            <Text className="font-medium text-gray-900">{service?.name}</Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Date & Time</Text>
            <Text className="font-medium text-gray-900">
              {new Date(booking.scheduled_date).toLocaleDateString()} at {booking.scheduled_time}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Address</Text>
            <Text className="font-medium text-gray-900 text-right flex-1 ml-4">
              {booking.address}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Total Amount</Text>
            <Text className="font-bold text-blue-600 text-lg">
              ${booking.total_amount}
            </Text>
          </View>
        </View>
      </View>

      {/* Provider Info */}
      {provider && (
        <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Your Provider</Text>
          
          <View className="flex-row items-center">
            <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center">
              <Text className="text-blue-600 font-bold text-xl">
                {provider.name.charAt(0)}
              </Text>
            </View>
            
            <View className="ml-4 flex-1">
              <Text className="text-lg font-semibold text-gray-900">{provider.name}</Text>
              <View className="flex-row items-center mt-1">
                <Ionicons name="star" size={16} color={colors.amber[500]} />
                <Text className="text-gray-600 ml-1">{provider.rating} rating</Text>
              </View>
            </View>
            
            <TouchableOpacity
              onPress={handleContactProvider}
              className="bg-blue-600 px-4 py-2 rounded-lg"
            >
              <Ionicons name="call" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View className="mx-4 mt-6 mb-8 space-y-3">
        {booking.status === 'pending' && (
          <TouchableOpacity
            onPress={handleCancelBooking}
            className="bg-red-600 rounded-xl py-4"
          >
            <Text className="text-white text-center text-lg font-semibold">
              Cancel Booking
            </Text>
          </TouchableOpacity>
        )}
        
        {booking.status === 'completed' && (
          <TouchableOpacity
            onPress={() => router.push(`/rate-service?bookingId=${booking.id}`)}
            className="bg-blue-600 rounded-xl py-4"
          >
            <Text className="text-white text-center text-lg font-semibold">
              Rate & Review
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/bookings')}
          className="bg-gray-200 rounded-xl py-4"
        >
          <Text className="text-gray-700 text-center text-lg font-semibold">
            View All Bookings
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}