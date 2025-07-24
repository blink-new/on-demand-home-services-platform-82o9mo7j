import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AdminSidebar } from './_layout';
import { blink } from '../../src/blink/client';

const ServiceCard = ({ service, onEdit, onToggleStatus }: { 
  service: any; 
  onEdit: (service: any) => void;
  onToggleStatus: (serviceId: string, isActive: boolean) => void;
}) => (
  <View className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-4">
    <View className="flex-row items-start justify-between">
      <View className="flex-1">
        <View className="flex-row items-center mb-2">
          <Text className="text-lg font-semibold text-gray-900 mr-3">{service.name}</Text>
          <View className={`px-3 py-1 rounded-full ${
            service.is_active ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <Text className={`text-xs font-medium ${
              service.is_active ? 'text-green-600' : 'text-gray-600'
            }`}>
              {service.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        
        <Text className="text-sm text-gray-600 mb-2">{service.description}</Text>
        <Text className="text-sm text-gray-500 mb-3">Category: {service.category_name}</Text>
        
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-bold text-gray-900">${service.base_price}</Text>
            <Text className="text-sm text-gray-500">Base Price</Text>
          </View>
          <View>
            <Text className="text-sm font-medium text-gray-700">{service.total_bookings || 0} bookings</Text>
            <Text className="text-xs text-gray-400">
              Created {new Date(service.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
      
      <View className="flex-row gap-2 ml-4">
        <TouchableOpacity
          onPress={() => onToggleStatus(service.id, !service.is_active)}
          className={`w-10 h-10 rounded-lg items-center justify-center ${
            service.is_active ? 'bg-red-50' : 'bg-green-50'
          }`}
        >
          <Ionicons 
            name={service.is_active ? 'pause' : 'play'} 
            size={16} 
            color={service.is_active ? '#DC2626' : '#059669'} 
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onEdit(service)}
          className="w-10 h-10 rounded-lg bg-blue-50 items-center justify-center"
        >
          <Ionicons name="pencil" size={16} color="#2563EB" />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default function AdminServices() {
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [servicesData, categoriesData] = await Promise.all([
        blink.db.services.list({ orderBy: { created_at: 'desc' } }),
        blink.db.service_categories.list()
      ]);
      setServices(servicesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditService = (service: any) => {
    console.log('Edit service:', service);
  };

  const handleToggleServiceStatus = async (serviceId: string, isActive: boolean) => {
    try {
      await blink.db.services.update(serviceId, { is_active: isActive });
      await loadData();
    } catch (error) {
      console.error('Error updating service status:', error);
    }
  };

  const filteredServices = services.filter((service: any) => {
    const matchesSearch = service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || service.category_id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const serviceStats = {
    total: services.length,
    active: services.filter((s: any) => s.is_active).length,
    inactive: services.filter((s: any) => !s.is_active).length,
    categories: categories.length,
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row h-full">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <ScrollView className="flex-1 p-6">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-2">Service Management</Text>
            <Text className="text-gray-600">Manage all services and categories on your platform</Text>
          </View>

          {/* Stats Cards */}
          <View className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <View className="bg-white p-4 rounded-xl border border-gray-200">
              <Text className="text-2xl font-bold text-gray-900">{serviceStats.total}</Text>
              <Text className="text-sm text-gray-500">Total Services</Text>
            </View>
            <View className="bg-white p-4 rounded-xl border border-gray-200">
              <Text className="text-2xl font-bold text-green-600">{serviceStats.active}</Text>
              <Text className="text-sm text-gray-500">Active</Text>
            </View>
            <View className="bg-white p-4 rounded-xl border border-gray-200">
              <Text className="text-2xl font-bold text-gray-600">{serviceStats.inactive}</Text>
              <Text className="text-sm text-gray-500">Inactive</Text>
            </View>
            <View className="bg-white p-4 rounded-xl border border-gray-200">
              <Text className="text-2xl font-bold text-blue-600">{serviceStats.categories}</Text>
              <Text className="text-sm text-gray-500">Categories</Text>
            </View>
          </View>

          {/* Filters */}
          <View className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
            <View className="flex-row items-center gap-4">
              <View className="flex-1">
                <TextInput
                  placeholder="Search services..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setFilterCategory('all')}
                  className={`px-4 py-2 rounded-lg ${
                    filterCategory === 'all' ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <Text className={`font-medium ${
                    filterCategory === 'all' ? 'text-white' : 'text-gray-700'
                  }`}>
                    All
                  </Text>
                </TouchableOpacity>
                {categories.map((category: any) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => setFilterCategory(category.id)}
                    className={`px-4 py-2 rounded-lg ${
                      filterCategory === category.id ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <Text className={`font-medium ${
                      filterCategory === category.id ? 'text-white' : 'text-gray-700'
                    }`}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Services List */}
          <View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-semibold text-gray-900">
                Services ({filteredServices.length})
              </Text>
              <View className="flex-row gap-3">
                <TouchableOpacity className="px-4 py-2 bg-green-600 rounded-lg">
                  <Text className="text-white font-medium">Add Category</Text>
                </TouchableOpacity>
                <TouchableOpacity className="px-4 py-2 bg-blue-600 rounded-lg">
                  <Text className="text-white font-medium">Add Service</Text>
                </TouchableOpacity>
              </View>
            </View>

            {loading ? (
              <View className="bg-white p-12 rounded-xl border border-gray-200 items-center">
                <Text className="text-gray-500">Loading services...</Text>
              </View>
            ) : filteredServices.length === 0 ? (
              <View className="bg-white p-12 rounded-xl border border-gray-200 items-center">
                <Ionicons name="grid-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 mt-4">No services found</Text>
              </View>
            ) : (
              filteredServices.map((service: any) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onEdit={handleEditService}
                  onToggleStatus={handleToggleServiceStatus}
                />
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}