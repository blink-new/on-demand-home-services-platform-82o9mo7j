import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { blink } from '../../src/blink/client';

export default function ProviderDashboard() {
  const [stats, setStats] = useState({
    todayJobs: 0,
    weeklyEarnings: 0,
    totalRating: 0,
    completedJobs: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      if (state.user) {
        loadProviderData();
      }
    });
    return unsubscribe;
  }, []);

  const loadProviderData = async () => {
    try {
      // Load provider stats and recent jobs
      const bookings = await blink.db.bookings.list({
        where: { provider_id: user?.id },
        orderBy: { created_at: 'desc' },
        limit: 5
      });
      
      setRecentJobs(bookings);
      
      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = bookings.filter(b => b.created_at?.startsWith(today));
      const completedBookings = bookings.filter(b => b.status === 'completed');
      
      setStats({
        todayJobs: todayBookings.length,
        weeklyEarnings: completedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0),
        totalRating: 4.8, // Mock rating
        completedJobs: completedBookings.length,
      });
    } catch (error) {
      console.error('Error loading provider data:', error);
    }
  };

  const StatCard = ({ icon, title, value, color = Colors.primary }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );

  const JobCard = ({ job }) => (
    <View style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <Text style={styles.jobService}>{job.service_name || 'Service'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
          <Text style={styles.statusText}>{job.status}</Text>
        </View>
      </View>
      <Text style={styles.jobCustomer}>Customer: {job.customer_name || 'Customer'}</Text>
      <Text style={styles.jobTime}>
        {new Date(job.scheduled_date).toLocaleDateString()} at {job.scheduled_time}
      </Text>
      <Text style={styles.jobAmount}>${job.total_amount}</Text>
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return Colors.accent;
      case 'accepted': return Colors.primary;
      case 'in_progress': return '#10B981';
      case 'completed': return '#059669';
      case 'cancelled': return '#EF4444';
      default: return Colors.gray;
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.providerName}>{user.displayName || user.email}</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="calendar-outline"
          title="Today's Jobs"
          value={stats.todayJobs}
          color={Colors.primary}
        />
        <StatCard
          icon="wallet-outline"
          title="Weekly Earnings"
          value={`$${stats.weeklyEarnings}`}
          color={Colors.accent}
        />
        <StatCard
          icon="star-outline"
          title="Rating"
          value={stats.totalRating}
          color="#10B981"
        />
        <StatCard
          icon="checkmark-circle-outline"
          title="Completed Jobs"
          value={stats.completedJobs}
          color="#8B5CF6"
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="time-outline" size={32} color={Colors.primary} />
            <Text style={styles.actionText}>Set Availability</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="settings-outline" size={32} color={Colors.primary} />
            <Text style={styles.actionText}>Service Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="help-circle-outline" size={32} color={Colors.primary} />
            <Text style={styles.actionText}>Help & Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="analytics-outline" size={32} color={Colors.primary} />
            <Text style={styles.actionText}>View Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Jobs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Jobs</Text>
        {recentJobs.length > 0 ? (
          recentJobs.map((job, index) => (
            <JobCard key={index} job={job} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={48} color={Colors.gray} />
            <Text style={styles.emptyText}>No recent jobs</Text>
            <Text style={styles.emptySubtext}>New service requests will appear here</Text>
          </View>
        )}
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
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.gray,
  },
  welcomeSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 4,
  },
  providerName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 4,
    width: '47%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: Colors.gray,
    marginLeft: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '47%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    marginTop: 8,
    textAlign: 'center',
  },
  jobCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobService: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
  },
  jobCustomer: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 4,
  },
  jobTime: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 4,
  },
  jobAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
    textAlign: 'center',
  },
});