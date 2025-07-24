import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { blink } from '../../src/blink/client';
import { router } from 'expo-router';

export default function ProviderProfile() {
  const [user, setUser] = useState(null);
  const [providerStats, setProviderStats] = useState({
    totalJobs: 0,
    rating: 0,
    totalEarnings: 0,
    joinDate: null,
  });
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      if (state.user) {
        loadProviderProfile();
      }
    });
    return unsubscribe;
  }, []);

  const loadProviderProfile = async () => {
    try {
      setLoading(true);
      // Load provider statistics
      const completedBookings = await blink.db.bookings.list({
        where: { 
          AND: [
            { provider_id: user?.id },
            { status: 'completed' }
          ]
        }
      });

      const totalEarnings = completedBookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0);
      const avgRating = completedBookings.length > 0 ? 4.8 : 0; // Mock rating calculation

      setProviderStats({
        totalJobs: completedBookings.length,
        rating: avgRating,
        totalEarnings,
        joinDate: user?.created_at || new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error loading provider profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            blink.auth.logout();
            router.replace('/');
          }
        }
      ]
    );
  };

  const handleSwitchToCustomer = () => {
    Alert.alert(
      'Switch to Customer App',
      'Switch to the customer interface?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: () => {
            router.replace('/(tabs)');
          }
        }
      ]
    );
  };

  const ProfileStat = ({ icon, label, value, color = Colors.primary }) => (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const MenuOption = ({ icon, title, subtitle, onPress, rightElement, color = Colors.dark }) => (
    <TouchableOpacity style={styles.menuOption} onPress={onPress}>
      <View style={styles.menuOptionLeft}>
        <Ionicons name={icon} size={24} color={color} />
        <View style={styles.menuOptionText}>
          <Text style={[styles.menuOptionTitle, { color }]}>{title}</Text>
          {subtitle && <Text style={styles.menuOptionSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || <Ionicons name="chevron-forward-outline" size={20} color={Colors.gray} />}
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={[styles.statusIndicator, { backgroundColor: isAvailable ? '#10B981' : '#EF4444' }]} />
        </View>
        <Text style={styles.providerName}>{user.displayName || user.email}</Text>
        <Text style={styles.providerEmail}>{user.email}</Text>
        <Text style={styles.joinDate}>
          Provider since {new Date(providerStats.joinDate).toLocaleDateString()}
        </Text>
      </View>

      {/* Availability Toggle */}
      <View style={styles.availabilitySection}>
        <View style={styles.availabilityHeader}>
          <View style={styles.availabilityInfo}>
            <Text style={styles.availabilityTitle}>Available for Jobs</Text>
            <Text style={styles.availabilitySubtitle}>
              {isAvailable ? 'You can receive new job requests' : 'You won\'t receive new requests'}
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ false: '#E5E7EB', true: Colors.primary }}
            thumbColor={isAvailable ? 'white' : '#F3F4F6'}
          />
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <ProfileStat
          icon="briefcase-outline"
          label="Jobs Completed"
          value={providerStats.totalJobs}
          color={Colors.primary}
        />
        <ProfileStat
          icon="star-outline"
          label="Average Rating"
          value={providerStats.rating.toFixed(1)}
          color={Colors.accent}
        />
        <ProfileStat
          icon="wallet-outline"
          label="Total Earned"
          value={`$${providerStats.totalEarnings}`}
          color="#10B981"
        />
        <ProfileStat
          icon="trending-up-outline"
          label="Success Rate"
          value="98%"
          color="#8B5CF6"
        />
      </View>

      {/* Menu Options */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <MenuOption
          icon="person-outline"
          title="Edit Profile"
          subtitle="Update your personal information"
          onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon!')}
        />
        
        <MenuOption
          icon="settings-outline"
          title="Service Settings"
          subtitle="Manage your services and pricing"
          onPress={() => Alert.alert('Coming Soon', 'Service settings will be available soon!')}
        />
        
        <MenuOption
          icon="time-outline"
          title="Availability Schedule"
          subtitle="Set your working hours"
          onPress={() => Alert.alert('Coming Soon', 'Schedule management will be available soon!')}
        />
        
        <MenuOption
          icon="card-outline"
          title="Payout Methods"
          subtitle="Manage how you get paid"
          onPress={() => Alert.alert('Coming Soon', 'Payout management will be available soon!')}
        />
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <MenuOption
          icon="help-circle-outline"
          title="Help Center"
          subtitle="Get answers to common questions"
          onPress={() => Alert.alert('Coming Soon', 'Help center will be available soon!')}
        />
        
        <MenuOption
          icon="chatbubble-outline"
          title="Contact Support"
          subtitle="Get help from our team"
          onPress={() => Alert.alert('Coming Soon', 'Support chat will be available soon!')}
        />
        
        <MenuOption
          icon="document-text-outline"
          title="Terms & Privacy"
          subtitle="Read our policies"
          onPress={() => Alert.alert('Coming Soon', 'Legal documents will be available soon!')}
        />
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>App</Text>
        
        <MenuOption
          icon="swap-horizontal-outline"
          title="Switch to Customer App"
          subtitle="Browse and book services"
          onPress={handleSwitchToCustomer}
          color={Colors.primary}
        />
        
        <MenuOption
          icon="log-out-outline"
          title="Logout"
          subtitle="Sign out of your account"
          onPress={handleLogout}
          color="#EF4444"
        />
      </View>

      {/* App Version */}
      <View style={styles.appVersion}>
        <Text style={styles.versionText}>Provider App v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.gray,
  },
  profileHeader: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: 'white',
  },
  providerName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 4,
  },
  providerEmail: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 8,
  },
  joinDate: {
    fontSize: 14,
    color: Colors.gray,
  },
  availabilitySection: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 16,
  },
  availabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityInfo: {
    flex: 1,
  },
  availabilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 4,
  },
  availabilitySubtitle: {
    fontSize: 14,
    color: Colors.gray,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 4,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
  },
  menuSection: {
    backgroundColor: 'white',
    marginBottom: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  menuOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuOptionText: {
    marginLeft: 16,
    flex: 1,
  },
  menuOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuOptionSubtitle: {
    fontSize: 14,
    color: Colors.gray,
  },
  appVersion: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 12,
    color: Colors.gray,
  },
});