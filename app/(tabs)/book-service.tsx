import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { blink } from '../../src/blink/client';
import { colors } from '../../src/constants/colors';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category_id: string;
}

interface Provider {
  id: string;
  name: string;
  rating: number;
  reviews_count: number;
  avatar_url: string;
  hourly_rate: number;
}

export default function BookServiceScreen() {
  const { serviceId, providerId } = useLocalSearchParams();
  const [service, setService] = useState<Service | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().split('T')[0],
      display: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    };
  });

  useEffect(() => {
    loadServiceAndProvider();
  }, []);

  const loadServiceAndProvider = async () => {
    try {
      const [serviceData, providerData] = await Promise.all([
        blink.db.services.list({ where: { id: serviceId } }),
        blink.db.providers.list({ where: { id: providerId } })
      ]);

      if (serviceData.length > 0) setService(serviceData[0]);
      if (providerData.length > 0) setProvider(providerData[0]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = async () => {
    if (!selectedDate || !selectedTime || !address.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setBooking(true);
    try {
      const user = await blink.auth.me();
      const bookingData = {
        id: `booking_${Date.now()}`,
        customer_id: user.id,
        provider_id: providerId,
        service_id: serviceId,
        scheduled_date: selectedDate,
        scheduled_time: selectedTime,
        address: address,
        notes: notes,
        status: 'pending',
        total_amount: service?.price || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await blink.db.bookings.create(bookingData);
      
      Alert.alert(
        'Booking Confirmed!', 
        'Your service has been booked successfully. The provider will contact you soon.',
        [{ text: 'OK', onPress: () => router.push('/(tabs)/bookings') }]
      );
    } catch (error) {
      console.error('Error booking service:', error);
      Alert.alert('Booking Failed', 'Please try again later.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600">Loading...</Text>
      </View>
    );
  }

  if (!service || !provider) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600">Service not found</Text>
      </View>
    );
  }

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
        
        <Text className="text-2xl font-bold text-gray-900 mb-2">Book Service</Text>
        <Text className="text-gray-600">Complete your booking details</Text>
      </View>

      {/* Service & Provider Info */}
      <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-gray-900 mb-2">{service.name}</Text>
        <Text className="text-gray-600 mb-3">{service.description}</Text>
        
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-gray-500">Provider</Text>
            <Text className="font-medium text-gray-900">{provider.name}</Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="star" size={16} color={colors.amber[500]} />
              <Text className="text-sm text-gray-600 ml-1">
                {provider.rating} ({provider.reviews_count} reviews)
              </Text>
            </View>
          </View>
          
          <View className="items-end">
            <Text className="text-2xl font-bold text-blue-600">${service.price}</Text>
            <Text className="text-sm text-gray-500">{service.duration} mins</Text>
          </View>
        </View>
      </View>

      {/* Date Selection */}
      <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-gray-900 mb-3">Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-3">
            {dates.map((dateItem) => (
              <TouchableOpacity
                key={dateItem.date}
                onPress={() => setSelectedDate(dateItem.date)}
                className={`px-4 py-3 rounded-lg border-2 min-w-[80px] items-center ${
                  selectedDate === dateItem.date
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <Text className={`text-sm font-medium ${
                  selectedDate === dateItem.date ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {dateItem.display}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Time Selection */}
      <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-gray-900 mb-3">Select Time</Text>
        <View className="flex-row flex-wrap">
          {timeSlots.map((time) => (
            <TouchableOpacity
              key={time}
              onPress={() => setSelectedTime(time)}
              className={`px-4 py-2 rounded-lg border-2 mr-3 mb-3 ${
                selectedTime === time
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <Text className={`font-medium ${
                selectedTime === time ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Address */}
      <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-gray-900 mb-3">Service Address</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Enter your full address"
          className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Notes */}
      <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-gray-900 mb-3">Additional Notes (Optional)</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Any special instructions or requirements..."
          className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Book Button */}
      <View className="mx-4 mt-6 mb-8">
        <TouchableOpacity
          onPress={handleBookService}
          disabled={booking}
          className={`rounded-xl py-4 ${
            booking ? 'bg-gray-400' : 'bg-blue-600'
          }`}
        >
          <Text className="text-white text-center text-lg font-semibold">
            {booking ? 'Booking...' : `Book Service - $${service.price}`}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}