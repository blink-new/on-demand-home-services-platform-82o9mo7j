import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AdminSidebar } from './_layout';
import { blink } from '../../src/blink/client';

const ProviderCard = ({ provider, onApprove, onReject, onEdit }: { 
  provider: any; 
  onApprove: (providerId: string) => void;
  onReject: (providerId: string) => void;
  onEdit: (provider: any) => void; 
}) => (
  <View className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-4">
    <View className="flex-row items-start justify-between">
      <View className="flex-row items-start flex-1">
        <View className="w-16 h-16 rounded-xl bg-green-100 items-center justify-center mr-4">
          <Ionicons name="hammer" size={24} color="#059669" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">{provider.name}</Text>
          <Text className="text-sm text-gray-500 mb-2">{provider.email}</Text>
          
          <View className="flex-row items-center mb-3">
            <View className={`px-3 py-1 rounded-full mr-3 ${
              provider.status === 'approved' ? 'bg-green-100' :
              provider.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <Text className={`text-xs font-medium ${
                provider.status === 'approved' ? 'text-green-600' :
                provider.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {provider.status || 'pending'}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text className="text-sm text-gray-600 ml-1">
                {provider.rating || '0.0'} ({provider.total_reviews || 0} reviews)
              </Text>
            </View>
          </View>

          <View className="mb-3">
            <Text className="text-sm font-medium text-gray-700 mb-1">Services:</Text>
            <Text className="text-sm text-gray-600">{provider.services || 'No services listed'}</Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-gray-500">Total Jobs: {provider.total_jobs || 0}</Text>
              <Text className="text-sm text-gray-500">Earnings: ${provider.total_earnings || '0'}</Text>
            </View>
            <Text className="text-xs text-gray-400">
              Joined {new Date(provider.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
      
      <View className="flex-row gap-2">
        {provider.status === 'pending' && (
          <>
            <TouchableOpacity
              onPress={() => onApprove(provider.id)}
              className="w-10 h-10 rounded-lg bg-green-50 items-center justify-center"
            >
              <Ionicons name="checkmark" size={16} color="#059669" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onReject(provider.id)}
              className="w-10 h-10 rounded-lg bg-red-50 items-center justify-center"
            >
              <Ionicons name="close" size={16} color="#DC2626" />
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity
          onPress={() => onEdit(provider)}
          className="w-10 h-10 rounded-lg bg-blue-50 items-center justify-center"
        >
          <Ionicons name="pencil" size={16} color="#2563EB" />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default function AdminProviders() {
  const [activeTab, setActiveTab] = useState('providers');
  const [providers, setProviders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const providersData = await blink.db.providers.list({
        orderBy: { created_at: 'desc' }
      });
      setProviders(providersData);
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProvider = async (providerId: string) => {
    try {
      await blink.db.providers.update(providerId, { status: 'approved' });
      await loadProviders();
    } catch (error) {
      console.error('Error approving provider:', error);
    }
  };

  const handleRejectProvider = async (providerId: string) => {
    try {
      await blink.db.providers.update(providerId, { status: 'rejected' });
      await loadProviders();
    } catch (error) {
      console.error('Error rejecting provider:', error);
    }
  };

  const handleEditProvider = (provider: any) => {
    console.log('Edit provider:', provider);
  };

  const filteredProviders = providers.filter((provider: any) => {
    const matchesSearch = provider.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || provider.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const providerStats = {
    total: providers.length,
    approved: providers.filter((p: any) => p.status === 'approved').length,
    pending: providers.filter((p: any) => p.status === 'pending').length,
    rejected: providers.filter((p: any) => p.status === 'rejected').length,
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row h-full">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <ScrollView className="flex-1 p-6">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-2">Provider Management</Text>
            <Text className="text-gray-600">Manage service providers and their applications</Text>
          </View>

          {/* Stats Cards */}
          <View className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <View className="bg-white p-4 rounded-xl border border-gray-200">
              <Text className="text-2xl font-bold text-gray-900">{providerStats.total}</Text>
              <Text className="text-sm text-gray-500">Total Providers</Text>
            </View>
            <View className="bg-white p-4 rounded-xl border border-gray-200">
              <Text className="text-2xl font-bold text-green-600">{providerStats.approved}</Text>
              <Text className="text-sm text-gray-500">Approved</Text>
            </View>
            <View className="bg-white p-4 rounded-xl border border-gray-200">
              <Text className="text-2xl font-bold text-yellow-600">{providerStats.pending}</Text>
              <Text className="text-sm text-gray-500">Pending</Text>
            </View>
            <View className="bg-white p-4 rounded-xl border border-gray-200">
              <Text className="text-2xl font-bold text-red-600">{providerStats.rejected}</Text>
              <Text className="text-sm text-gray-500">Rejected</Text>
            </View>
          </View>

          {/* Filters */}
          <View className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
            <View className="flex-row items-center gap-4">
              <View className="flex-1">
                <TextInput
                  placeholder="Search providers..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </View>
              <View className="flex-row gap-2">
                {['all', 'approved', 'pending', 'rejected'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg ${
                      filterStatus === status ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <Text className={`font-medium capitalize ${
                      filterStatus === status ? 'text-white' : 'text-gray-700'
                    }`}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Providers List */}
          <View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-semibold text-gray-900">
                Providers ({filteredProviders.length})
              </Text>
              <TouchableOpacity className="px-4 py-2 bg-blue-600 rounded-lg">
                <Text className="text-white font-medium">Invite Provider</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View className="bg-white p-12 rounded-xl border border-gray-200 items-center">
                <Text className="text-gray-500">Loading providers...</Text>
              </View>
            ) : filteredProviders.length === 0 ? (
              <View className="bg-white p-12 rounded-xl border border-gray-200 items-center">
                <Ionicons name="hammer-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 mt-4">No providers found</Text>
              </View>
            ) : (
              filteredProviders.map((provider: any) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onApprove={handleApproveProvider}
                  onReject={handleRejectProvider}
                  onEdit={handleEditProvider}
                />
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}