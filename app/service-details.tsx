import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { blink } from '../src/blink/client';
import { colors } from '../src/constants/colors';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category_id: string;
  base_price: number;
}

interface Provider {
  id: string;
  name: string;
  rating: number;
  reviews_count: number;
  avatar_url: string;
  hourly_rate: number;
  bio: string;
  experience_years: number;
}

export default function ServiceDetailsScreen() {
  const { serviceId } = useLocalSearchParams();
  const [service, setService] = useState<Service | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServiceDetails();
  }, []);

  const loadServiceDetails = async () => {
    try {
      // Load service details
      const serviceData = await blink.db.services.list({ 
        where: { id: serviceId } 
      });
      
      if (serviceData.length > 0) {
        setService(serviceData[0]);
        
        // Load providers for this service
        const providersData = await blink.db.providers.list({
          where: { status: 'active' },
          orderBy: { rating: 'desc' },
          limit: 10
        });
        
        setProviders(providersData);
        if (providersData.length > 0) {
          setSelectedProvider(providersData[0]);
        }
      }
    } catch (error) {
      console.error('Error loading service details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = () => {
    if (selectedProvider) {
      router.push(`/(tabs)/book-service?serviceId=${serviceId}&providerId=${selectedProvider.id}`);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600">Loading...</Text>
      </View>
    );
  }

  if (!service) {
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
        
        <Text className="text-2xl font-bold text-gray-900 mb-2">{service.name}</Text>
        <Text className="text-gray-600">{service.description}</Text>
      </View>

      {/* Service Info */}
      <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-3xl font-bold text-blue-600">
              ${service.price || service.base_price}
            </Text>
            <Text className="text-gray-500">Starting price</Text>
          </View>
          
          <View className="items-end">
            <View className="flex-row items-center mb-1">
              <Ionicons name="time-outline" size={20} color={colors.gray[500]} />
              <Text className="text-gray-600 ml-2">{service.duration || 60} minutes</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="star" size={20} color={colors.amber[500]} />
              <Text className="text-gray-600 ml-2">4.8 rating</Text>
            </View>
          </View>
        </View>

        <View className="border-t border-gray-200 pt-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">What's Included</Text>
          <View className="space-y-2">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color={colors.green[500]} />
              <Text className="text-gray-600 ml-3">Professional service delivery</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color={colors.green[500]} />
              <Text className="text-gray-600 ml-3">Quality guarantee</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color={colors.green[500]} />
              <Text className="text-gray-600 ml-3">Customer support</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Available Providers */}
      <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Available Providers</Text>
        
        {providers.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-4">
              {providers.map((provider) => (
                <TouchableOpacity
                  key={provider.id}
                  onPress={() => setSelectedProvider(provider)}
                  className={`w-64 p-4 rounded-lg border-2 ${
                    selectedProvider?.id === provider.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <View className="flex-row items-center mb-3">
                    <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                      <Text className="text-blue-600 font-bold text-lg">
                        {provider.name.charAt(0)}
                      </Text>
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="font-semibold text-gray-900">{provider.name}</Text>
                      <View className="flex-row items-center">
                        <Ionicons name="star" size={16} color={colors.amber[500]} />
                        <Text className="text-sm text-gray-600 ml-1">
                          {provider.rating} ({provider.reviews_count} reviews)
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
                    {provider.bio || 'Experienced professional with excellent service record.'}
                  </Text>
                  
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-gray-500">
                      {provider.experience_years || 5}+ years exp.
                    </Text>
                    <Text className="font-semibold text-blue-600">
                      ${provider.hourly_rate || 50}/hr
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ) : (
          <Text className="text-gray-500 text-center py-8">
            No providers available at the moment
          </Text>
        )}
      </View>

      {/* Reviews Section */}
      <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</Text>
        
        <View className="space-y-4">
          {[1, 2, 3].map((review) => (
            <View key={review} className="border-b border-gray-100 pb-4 last:border-b-0">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center">
                  <Text className="text-gray-600 font-medium text-sm">J</Text>
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-medium text-gray-900">John D.</Text>
                  <View className="flex-row items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons 
                        key={star} 
                        name="star" 
                        size={14} 
                        color={colors.amber[500]} 
                      />
                    ))}
                    <Text className="text-sm text-gray-500 ml-2">2 days ago</Text>
                  </View>
                </View>
              </View>
              <Text className="text-gray-600 text-sm">
                Excellent service! Very professional and completed the work on time. 
                Highly recommended.
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Book Button */}
      <View className="mx-4 mt-6 mb-8">
        <TouchableOpacity
          onPress={handleBookService}
          disabled={!selectedProvider}
          className={`rounded-xl py-4 ${
            selectedProvider ? 'bg-blue-600' : 'bg-gray-400'
          }`}
        >
          <Text className="text-white text-center text-lg font-semibold">
            {selectedProvider 
              ? `Book with ${selectedProvider.name}` 
              : 'Select a Provider'
            }
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}