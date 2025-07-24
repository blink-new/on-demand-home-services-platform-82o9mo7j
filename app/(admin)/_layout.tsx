import { Stack } from 'expo-router';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/constants/colors';

const adminTabs = [
  { name: 'index', title: 'Overview', icon: 'analytics-outline' },
  { name: 'users', title: 'Users', icon: 'people-outline' },
  { name: 'providers', title: 'Providers', icon: 'hammer-outline' },
  { name: 'services', title: 'Services', icon: 'list-outline' },
  { name: 'bookings', title: 'Bookings', icon: 'calendar-outline' },
  { name: 'analytics', title: 'Analytics', icon: 'bar-chart-outline' },
  { name: 'settings', title: 'Settings', icon: 'settings-outline' },
];

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (tabName: string) => {
    if (tabName === 'index') {
      return pathname === '/(admin)' || pathname === '/(admin)/';
    }
    return pathname.includes(`/(admin)/${tabName}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Admin Header */}
      <View style={{
        backgroundColor: colors.primary,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
              Admin Dashboard
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 }}>
              Manage your home services platform
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons name="arrow-back" size={16} color="white" />
            <Text style={{ color: 'white', marginLeft: 4, fontSize: 12 }}>Exit Admin</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Sidebar Navigation */}
        <View style={{
          width: 200,
          backgroundColor: '#f8f9fa',
          borderRightWidth: 1,
          borderRightColor: '#e9ecef',
        }}>
          <ScrollView style={{ flex: 1, paddingVertical: 20 }}>
            {adminTabs.map((tab) => (
              <TouchableOpacity
                key={tab.name}
                onPress={() => router.push(`/(admin)/${tab.name === 'index' ? '' : tab.name}`)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  backgroundColor: isActive(tab.name) ? colors.primary + '15' : 'transparent',
                  borderRightWidth: isActive(tab.name) ? 3 : 0,
                  borderRightColor: colors.primary,
                }}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={20}
                  color={isActive(tab.name) ? colors.primary : '#6c757d'}
                />
                <Text style={{
                  marginLeft: 12,
                  fontSize: 14,
                  fontWeight: isActive(tab.name) ? '600' : '400',
                  color: isActive(tab.name) ? colors.primary : '#495057',
                }}>
                  {tab.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Main Content */}
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="users" />
            <Stack.Screen name="providers" />
            <Stack.Screen name="services" />
            <Stack.Screen name="bookings" />
            <Stack.Screen name="analytics" />
            <Stack.Screen name="settings" />
          </Stack>
        </View>
      </View>
    </View>
  );
}