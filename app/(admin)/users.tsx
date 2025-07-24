import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AdminSidebar } from './_layout';
import { blink } from '../../src/blink/client';

const UserCard = ({ user, onEdit, onDelete }: { 
  user: any; 
  onEdit: (user: any) => void; 
  onDelete: (userId: string) => void; 
}) => (
  <View className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-4">
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center flex-1">
        <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-4">
          <Text className="text-lg font-semibold text-blue-600">
            {user.display_name?.charAt(0) || user.email?.charAt(0) || 'U'}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">
            {user.display_name || 'Unnamed User'}
          </Text>
          <Text className="text-sm text-gray-500">{user.email}</Text>
          <View className="flex-row items-center mt-2">
            <View className={`px-2 py-1 rounded-full ${
              user.role === 'admin' ? 'bg-red-100' : 
              user.role === 'provider' ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              <Text className={`text-xs font-medium ${
                user.role === 'admin' ? 'text-red-600' : 
                user.role === 'provider' ? 'text-green-600' : 'text-blue-600'
              }`}>
                {user.role || 'customer'}
              </Text>
            </View>
            <Text className="text-xs text-gray-400 ml-3">
              Joined {new Date(user.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
      
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => onEdit(user)}
          className="w-10 h-10 rounded-lg bg-blue-50 items-center justify-center"
        >
          <Ionicons name="pencil" size={16} color="#2563EB" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(user.id)}
          className="w-10 h-10 rounded-lg bg-red-50 items-center justify-center"
        >
          <Ionicons name="trash" size={16} color="#DC2626" />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await blink.db.users.list({
        orderBy: { created_at: 'desc' }
      });
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: any) => {
    // TODO: Implement edit user modal
    console.log('Edit user:', user);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await blink.db.users.delete(userId);
      await loadUsers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const userStats = {
    total: users.length,
    customers: users.filter((u: any) => !u.role || u.role === 'customer').length,
    providers: users.filter((u: any) => u.role === 'provider').length,
    admins: users.filter((u: any) => u.role === 'admin').length,
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row h-full">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <ScrollView className="flex-1 p-6">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-2">User Management</Text>
            <Text className="text-gray-600">Manage all users on your platform</Text>
          </View>

          {/* Stats Cards */}
          <View className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <View className="bg-white p-4 rounded-xl border border-gray-200">
              <Text className="text-2xl font-bold text-gray-900">{userStats.total}</Text>
              <Text className="text-sm text-gray-500">Total Users</Text>
            </View>
            <View className="bg-white p-4 rounded-xl border border-gray-200">
              <Text className="text-2xl font-bold text-blue-600">{userStats.customers}</Text>
              <Text className="text-sm text-gray-500">Customers</Text>
            </View>
            <View className="bg-white p-4 rounded-xl border border-gray-200">
              <Text className="text-2xl font-bold text-green-600">{userStats.providers}</Text>
              <Text className="text-sm text-gray-500">Providers</Text>
            </View>
            <View className="bg-white p-4 rounded-xl border border-gray-200">
              <Text className="text-2xl font-bold text-red-600">{userStats.admins}</Text>
              <Text className="text-sm text-gray-500">Admins</Text>
            </View>
          </View>

          {/* Filters */}
          <View className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
            <View className="flex-row items-center gap-4">
              <View className="flex-1">
                <TextInput
                  placeholder="Search users..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </View>
              <View className="flex-row gap-2">
                {['all', 'customer', 'provider', 'admin'].map((role) => (
                  <TouchableOpacity
                    key={role}
                    onPress={() => setFilterRole(role)}
                    className={`px-4 py-2 rounded-lg ${
                      filterRole === role ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <Text className={`font-medium capitalize ${
                      filterRole === role ? 'text-white' : 'text-gray-700'
                    }`}>
                      {role}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Users List */}
          <View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-semibold text-gray-900">
                Users ({filteredUsers.length})
              </Text>
              <TouchableOpacity className="px-4 py-2 bg-blue-600 rounded-lg">
                <Text className="text-white font-medium">Add User</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View className="bg-white p-12 rounded-xl border border-gray-200 items-center">
                <Text className="text-gray-500">Loading users...</Text>
              </View>
            ) : filteredUsers.length === 0 ? (
              <View className="bg-white p-12 rounded-xl border border-gray-200 items-center">
                <Ionicons name="people-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 mt-4">No users found</Text>
              </View>
            ) : (
              filteredUsers.map((user: any) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                />
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}