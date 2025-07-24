import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { blink } from '../../src/blink/client';

export default function Earnings() {
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
  });
  const [completedJobs, setCompletedJobs] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      if (state.user) {
        loadEarningsData();
      }
    });
    return unsubscribe;
  }, []);

  const loadEarningsData = async () => {
    try {
      setLoading(true);
      // Load completed jobs for this provider
      const bookings = await blink.db.bookings.list({
        where: { 
          AND: [
            { provider_id: user?.id },
            { status: 'completed' }
          ]
        },
        orderBy: { completed_at: 'desc' }
      });
      
      setCompletedJobs(bookings);
      calculateEarnings(bookings);
    } catch (error) {
      console.error('Error loading earnings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEarnings = (jobs) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayEarnings = jobs
      .filter(job => new Date(job.completed_at) >= today)
      .reduce((sum, job) => sum + (job.total_amount || 0), 0);

    const weekEarnings = jobs
      .filter(job => new Date(job.completed_at) >= weekStart)
      .reduce((sum, job) => sum + (job.total_amount || 0), 0);

    const monthEarnings = jobs
      .filter(job => new Date(job.completed_at) >= monthStart)
      .reduce((sum, job) => sum + (job.total_amount || 0), 0);

    const totalEarnings = jobs.reduce((sum, job) => sum + (job.total_amount || 0), 0);

    setEarnings({
      today: todayEarnings,
      week: weekEarnings,
      month: monthEarnings,
      total: totalEarnings,
    });
  };

  const getFilteredJobs = () => {
    const now = new Date();
    let startDate;

    switch (selectedPeriod) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return completedJobs;
    }

    return completedJobs.filter(job => new Date(job.completed_at) >= startDate);
  };

  const EarningsCard = ({ title, amount, icon, color = Colors.primary, subtitle }) => (
    <View style={[styles.earningsCard, { borderLeftColor: color }]}>
      <View style={styles.earningsHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.earningsTitle}>{title}</Text>
      </View>
      <Text style={[styles.earningsAmount, { color }]}>${amount.toFixed(2)}</Text>
      {subtitle && <Text style={styles.earningsSubtitle}>{subtitle}</Text>}
    </View>
  );

  const JobEarningCard = ({ job }) => (
    <View style={styles.jobEarningCard}>
      <View style={styles.jobEarningHeader}>
        <View style={styles.jobEarningInfo}>
          <Text style={styles.jobEarningService}>{job.service_name || 'Service'}</Text>
          <Text style={styles.jobEarningCustomer}>{job.customer_name || 'Customer'}</Text>
        </View>
        <Text style={styles.jobEarningAmount}>${job.total_amount}</Text>
      </View>
      <View style={styles.jobEarningDetails}>
        <Text style={styles.jobEarningDate}>
          Completed: {new Date(job.completed_at).toLocaleDateString()}
        </Text>
        <View style={styles.jobEarningRating}>
          <Ionicons name="star" size={14} color={Colors.accent} />
          <Text style={styles.jobEarningRatingText}>
            {job.rating || 'Not rated'}
          </Text>
        </View>
      </View>
    </View>
  );

  const PeriodButton = ({ period, label }) => (
    <TouchableOpacity
      style={[
        styles.periodButton,
        selectedPeriod === period && styles.periodButtonActive
      ]}
      onPress={() => setSelectedPeriod(period)}
    >
      <Text style={[
        styles.periodButtonText,
        selectedPeriod === period && styles.periodButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const filteredJobs = getFilteredJobs();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Earnings Overview */}
      <View style={styles.earningsGrid}>
        <EarningsCard
          title="Today"
          amount={earnings.today}
          icon="today-outline"
          color={Colors.primary}
        />
        <EarningsCard
          title="This Week"
          amount={earnings.week}
          icon="calendar-outline"
          color={Colors.accent}
        />
        <EarningsCard
          title="This Month"
          amount={earnings.month}
          icon="stats-chart-outline"
          color="#10B981"
        />
        <EarningsCard
          title="Total Earned"
          amount={earnings.total}
          icon="wallet-outline"
          color="#8B5CF6"
          subtitle={`${completedJobs.length} jobs completed`}
        />
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.quickStatItem}>
          <Text style={styles.quickStatNumber}>{completedJobs.length}</Text>
          <Text style={styles.quickStatLabel}>Total Jobs</Text>
        </View>
        <View style={styles.quickStatDivider} />
        <View style={styles.quickStatItem}>
          <Text style={styles.quickStatNumber}>
            ${completedJobs.length > 0 ? (earnings.total / completedJobs.length).toFixed(0) : '0'}
          </Text>
          <Text style={styles.quickStatLabel}>Avg per Job</Text>
        </View>
        <View style={styles.quickStatDivider} />
        <View style={styles.quickStatItem}>
          <Text style={styles.quickStatNumber}>4.8</Text>
          <Text style={styles.quickStatLabel}>Avg Rating</Text>
        </View>
      </View>

      {/* Period Filter */}
      <View style={styles.periodFilter}>
        <Text style={styles.sectionTitle}>Job History</Text>
        <View style={styles.periodButtons}>
          <PeriodButton period="today" label="Today" />
          <PeriodButton period="week" label="Week" />
          <PeriodButton period="month" label="Month" />
          <PeriodButton period="all" label="All" />
        </View>
      </View>

      {/* Job History */}
      <View style={styles.jobHistory}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading earnings...</Text>
          </View>
        ) : filteredJobs.length > 0 ? (
          <>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>
                {filteredJobs.length} jobs • ${filteredJobs.reduce((sum, job) => sum + (job.total_amount || 0), 0).toFixed(2)}
              </Text>
            </View>
            {filteredJobs.map((job, index) => (
              <JobEarningCard key={index} job={job} />
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={64} color={Colors.gray} />
            <Text style={styles.emptyTitle}>No Earnings Yet</Text>
            <Text style={styles.emptySubtext}>
              Complete your first job to start earning money!
            </Text>
          </View>
        )}
      </View>

      {/* Payout Info */}
      <View style={styles.payoutInfo}>
        <View style={styles.payoutCard}>
          <Ionicons name="card-outline" size={24} color={Colors.primary} />
          <View style={styles.payoutText}>
            <Text style={styles.payoutTitle}>Weekly Payout</Text>
            <Text style={styles.payoutSubtitle}>
              Earnings are paid out every Friday to your linked bank account
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.payoutButton}>
          <Text style={styles.payoutButtonText}>Manage Payout Methods</Text>
          <Ionicons name="chevron-forward-outline" size={16} color={Colors.primary} />
        </TouchableOpacity>
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
  earningsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 16,
  },
  earningsCard: {
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
  earningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  earningsTitle: {
    fontSize: 14,
    color: Colors.gray,
    marginLeft: 8,
    fontWeight: '500',
  },
  earningsAmount: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  earningsSubtitle: {
    fontSize: 12,
    color: Colors.gray,
  },
  quickStats: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  periodFilter: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 12,
  },
  periodButtons: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray,
  },
  periodButtonTextActive: {
    color: 'white',
  },
  jobHistory: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  historyHeader: {
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
  },
  jobEarningCard: {
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
  jobEarningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobEarningInfo: {
    flex: 1,
  },
  jobEarningService: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 2,
  },
  jobEarningCustomer: {
    fontSize: 14,
    color: Colors.gray,
  },
  jobEarningAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  jobEarningDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobEarningDate: {
    fontSize: 12,
    color: Colors.gray,
  },
  jobEarningRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobEarningRatingText: {
    fontSize: 12,
    color: Colors.gray,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  payoutInfo: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  payoutCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  payoutText: {
    flex: 1,
    marginLeft: 12,
  },
  payoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 4,
  },
  payoutSubtitle: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
  },
  payoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 8,
  },
  payoutButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});