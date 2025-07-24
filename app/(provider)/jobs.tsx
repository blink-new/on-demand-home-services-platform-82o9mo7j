import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { blink } from '../../src/blink/client';

export default function ActiveJobs() {
  const [activeJobs, setActiveJobs] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      if (state.user) {
        loadActiveJobs();
      }
    });
    return unsubscribe;
  }, []);

  const loadActiveJobs = async () => {
    try {
      setLoading(true);
      // Load accepted and in-progress jobs for this provider
      const bookings = await blink.db.bookings.list({
        where: { 
          AND: [
            { provider_id: user?.id },
            { OR: [
              { status: 'accepted' },
              { status: 'in_progress' }
            ]}
          ]
        },
        orderBy: { scheduled_date: 'asc' }
      });
      
      setActiveJobs(bookings);
    } catch (error) {
      console.error('Error loading active jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartJob = async (jobId) => {
    try {
      await blink.db.bookings.update(jobId, {
        status: 'in_progress',
        started_at: new Date().toISOString()
      });
      
      Alert.alert('Job Started', 'You have started working on this job!');
      loadActiveJobs(); // Refresh the list
    } catch (error) {
      console.error('Error starting job:', error);
      Alert.alert('Error', 'Failed to start job. Please try again.');
    }
  };

  const handleCompleteJob = async (jobId) => {
    Alert.alert(
      'Complete Job',
      'Are you sure you want to mark this job as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              await blink.db.bookings.update(jobId, {
                status: 'completed',
                completed_at: new Date().toISOString()
              });
              
              Alert.alert('Job Completed', 'Great work! The job has been marked as completed.');
              loadActiveJobs(); // Refresh the list
            } catch (error) {
              console.error('Error completing job:', error);
              Alert.alert('Error', 'Failed to complete job. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleContactCustomer = (customerName) => {
    Alert.alert(
      'Contact Customer',
      `Contact ${customerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Alert.alert('Feature Coming Soon', 'Calling feature will be available soon!') },
        { text: 'Message', onPress: () => Alert.alert('Feature Coming Soon', 'Messaging feature will be available soon!') }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return Colors.accent;
      case 'in_progress': return '#10B981';
      default: return Colors.gray;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return 'checkmark-circle-outline';
      case 'in_progress': return 'play-circle-outline';
      default: return 'time-outline';
    }
  };

  const JobCard = ({ job }) => (
    <View style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{job.service_name || 'Service'}</Text>
          <View style={styles.statusContainer}>
            <Ionicons name={getStatusIcon(job.status)} size={16} color={getStatusColor(job.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>
              {job.status === 'in_progress' ? 'In Progress' : 'Accepted'}
            </Text>
          </View>
        </View>
        <Text style={styles.jobAmount}>${job.total_amount}</Text>
      </View>

      <View style={styles.customerSection}>
        <View style={styles.customerInfo}>
          <Ionicons name="person-outline" size={16} color={Colors.gray} />
          <Text style={styles.customerName}>{job.customer_name || 'Customer'}</Text>
        </View>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => handleContactCustomer(job.customer_name)}
        >
          <Ionicons name="chatbubble-outline" size={16} color={Colors.primary} />
          <Text style={styles.contactButtonText}>Contact</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.scheduleInfo}>
        <Ionicons name="calendar-outline" size={16} color={Colors.gray} />
        <Text style={styles.scheduleText}>
          {new Date(job.scheduled_date).toLocaleDateString()} at {job.scheduled_time}
        </Text>
      </View>

      <View style={styles.locationInfo}>
        <Ionicons name="location-outline" size={16} color={Colors.gray} />
        <Text style={styles.locationText}>{job.address || 'Address not provided'}</Text>
      </View>

      {job.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Special Instructions:</Text>
          <Text style={styles.notesText}>{job.notes}</Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        {job.status === 'accepted' ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.startButton]}
            onPress={() => handleStartJob(job.id)}
          >
            <Ionicons name="play-outline" size={20} color="white" />
            <Text style={styles.startButtonText}>Start Job</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => handleCompleteJob(job.id)}
          >
            <Ionicons name="checkmark-outline" size={20} color="white" />
            <Text style={styles.completeButtonText}>Mark Complete</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={[styles.actionButton, styles.navigationButton]}>
          <Ionicons name="navigate-outline" size={20} color={Colors.primary} />
          <Text style={styles.navigationButtonText}>Navigate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.headerStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{activeJobs.length}</Text>
          <Text style={styles.statLabel}>Active Jobs</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {activeJobs.filter(job => job.status === 'in_progress').length}
          </Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            ${activeJobs.reduce((sum, job) => sum + (job.total_amount || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading jobs...</Text>
          </View>
        ) : activeJobs.length > 0 ? (
          activeJobs.map((job, index) => (
            <JobCard key={index} job={job} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="hammer-outline" size={64} color={Colors.gray} />
            <Text style={styles.emptyTitle}>No Active Jobs</Text>
            <Text style={styles.emptySubtext}>
              Accepted service requests will appear here. Check your requests tab for new bookings.
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={loadActiveJobs}>
              <Ionicons name="refresh-outline" size={20} color={Colors.primary} />
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
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
  headerStats: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  jobCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  jobAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  customerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 14,
    color: Colors.dark,
    marginLeft: 8,
    fontWeight: '500',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 4,
  },
  contactButtonText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleText: {
    fontSize: 14,
    color: Colors.dark,
    marginLeft: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: Colors.dark,
    marginLeft: 8,
    flex: 1,
  },
  notesSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: Colors.dark,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  startButton: {
    backgroundColor: Colors.primary,
  },
  completeButton: {
    backgroundColor: '#10B981',
  },
  navigationButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  startButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  navigationButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 8,
  },
  refreshButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});