import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { blink } from '../../src/blink/client';
import { router } from 'expo-router';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    favoriteServices: [],
  });

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      if (state.user) {
        loadUserStats();
      }
    });
    return unsubscribe;
  }, []);

  const loadUserStats = async () => {
    try {
      // Load user bookings to calculate stats
      const bookings = await blink.db.bookings.list({
        where: { customer_id: user?.id }
      });

      const completedBookings = bookings.filter(booking => booking.status === 'completed');
      const totalSpent = completedBookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0);

      setUserStats({
        totalBookings: bookings.length,
        completedBookings: completedBookings.length,
        totalSpent,
        favoriteServices: ['Cleaning', 'Plumbing'], // Mock data
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
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
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{user.displayName || user.email}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.memberSince}>
          Member since {new Date(user.created_at || Date.now()).toLocaleDateString()}
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <ProfileStat
          icon="calendar-outline"
          label="Total Bookings"
          value={userStats.totalBookings}
          color={Colors.primary}
        />
        <ProfileStat
          icon="checkmark-circle-outline"
          label="Completed"
          value={userStats.completedBookings}
          color="#10B981"
        />
        <ProfileStat
          icon="wallet-outline"
          label="Total Spent"
          value={`$${userStats.totalSpent}`}
          color={Colors.accent}
        />
        <ProfileStat
          icon="heart-outline"
          label="Favorite Services"
          value={userStats.favoriteServices.length}
          color="#EF4444"
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
          icon="location-outline"
          title="Saved Addresses"
          subtitle="Manage your delivery locations"
          onPress={() => Alert.alert('Coming Soon', 'Address management will be available soon!')}
        />
        
        <MenuOption
          icon="card-outline"
          title="Payment Methods"
          subtitle="Manage cards and payment options"
          onPress={() => Alert.alert('Coming Soon', 'Payment management will be available soon!')}
        />
        
        <MenuOption
          icon="briefcase-outline"
          title="Become a Provider"
          subtitle="Start offering services and earn money"
          onPress={() => {
            Alert.alert(
              'Switch to Provider',
              'Switch to the provider interface to manage your services?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Switch',
                  onPress: () => {
                    router.replace('/(provider)/dashboard');
                  }
                }
              ]
            );
          }}
          color={Colors.primary}
        />
        
        <MenuOption
          icon="shield-outline"
          title="Admin Dashboard"
          subtitle="Manage platform operations and users"
          onPress={() => {
            Alert.alert(
              'Switch to Admin',
              'Access the admin dashboard to manage the platform?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Access',
                  onPress: () => {
                    router.replace('/(admin)');
                  }
                }
              ]
            );
          }}
          color="#DC2626"
        />
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <MenuOption
          icon="notifications-outline"
          title="Notifications"
          subtitle="Manage your notification preferences"
          onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available soon!')}
        />
        
        <MenuOption
          icon="settings-outline"
          title="Settings"
          subtitle="App preferences and privacy"
          onPress={() => Alert.alert('Coming Soon', 'Settings will be available soon!')}
        />
        
        <MenuOption
          icon="language-outline"
          title="Language"
          subtitle="English"
          onPress={() => Alert.alert('Coming Soon', 'Language selection will be available soon!')}
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
          icon="star-outline"
          title="Rate the App"
          subtitle="Share your feedback"
          onPress={() => Alert.alert('Coming Soon', 'App rating will be available soon!')}
        />
        
        <MenuOption
          icon="document-text-outline"
          title="Terms & Privacy"
          subtitle="Read our policies"
          onPress={() => Alert.alert('Coming Soon', 'Legal documents will be available soon!')}
        />
      </View>

      <View style={styles.menuSection}>
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
        <Text style={styles.versionText}>Customer App v1.0.0</Text>
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 8,
  },
  memberSince: {
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