import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { blink } from '../../src/blink/client';

export default function ServiceRequests() {
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      if (state.user) {
        loadServiceRequests();
      }
    });
    return unsubscribe;
  }, []);

  const loadServiceRequests = async () => {
    try {
      setLoading(true);
      // Load pending service requests for this provider
      const bookings = await blink.db.bookings.list({
        where: { 
          AND: [
            { provider_id: user?.id },
            { status: 'pending' }
          ]
        },
        orderBy: { created_at: 'desc' }
      });
      
      setRequests(bookings);
    } catch (error) {
      console.error('Error loading service requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await blink.db.bookings.update(requestId, {
        status: 'accepted',
        accepted_at: new Date().toISOString()
      });
      
      Alert.alert('Success', 'Service request accepted!');
      loadServiceRequests(); // Refresh the list
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Error', 'Failed to accept request. Please try again.');
    }
  };

  const handleDeclineRequest = async (requestId) => {
    Alert.alert(
      'Decline Request',
      'Are you sure you want to decline this service request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              await blink.db.bookings.update(requestId, {
                status: 'cancelled',
                cancelled_at: new Date().toISOString(),
                cancellation_reason: 'Declined by provider'
              });
              
              Alert.alert('Request Declined', 'The service request has been declined.');
              loadServiceRequests(); // Refresh the list
            } catch (error) {
              console.error('Error declining request:', error);
              Alert.alert('Error', 'Failed to decline request. Please try again.');
            }
          }
        }
      ]
    );
  };

  const RequestCard = ({ request }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{request.service_name || 'Service'}</Text>
          <Text style={styles.requestTime}>
            {new Date(request.created_at).toLocaleDateString()} • {new Date(request.created_at).toLocaleTimeString()}
          </Text>
        </View>
        <Text style={styles.requestAmount}>${request.total_amount}</Text>
      </View>

      <View style={styles.customerInfo}>
        <Ionicons name="person-outline" size={16} color={Colors.gray} />
        <Text style={styles.customerName}>{request.customer_name || 'Customer'}</Text>
      </View>

      <View style={styles.scheduleInfo}>
        <Ionicons name="calendar-outline" size={16} color={Colors.gray} />
        <Text style={styles.scheduleText}>
          {new Date(request.scheduled_date).toLocaleDateString()} at {request.scheduled_time}
        </Text>
      </View>

      <View style={styles.locationInfo}>
        <Ionicons name="location-outline" size={16} color={Colors.gray} />
        <Text style={styles.locationText}>{request.address || 'Address not provided'}</Text>
      </View>

      {request.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Special Instructions:</Text>
          <Text style={styles.notesText}>{request.notes}</Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => handleDeclineRequest(request.id)}
        >
          <Ionicons name="close-outline" size={20} color="white" />
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAcceptRequest(request.id)}
        >
          <Ionicons name="checkmark-outline" size={20} color="white" />
          <Text style={styles.acceptButtonText}>Accept</Text>
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
          <Text style={styles.statNumber}>{requests.length}</Text>
          <Text style={styles.statLabel}>Pending Requests</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            ${requests.reduce((sum, r) => sum + (r.total_amount || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Potential Earnings</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading requests...</Text>
          </View>
        ) : requests.length > 0 ? (
          requests.map((request, index) => (
            <RequestCard key={index} request={request} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={64} color={Colors.gray} />
            <Text style={styles.emptyTitle}>No Pending Requests</Text>
            <Text style={styles.emptySubtext}>
              New service requests will appear here when customers book your services
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={loadServiceRequests}>
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
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  requestCard: {
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
  requestHeader: {
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
    marginBottom: 4,
  },
  requestTime: {
    fontSize: 12,
    color: Colors.gray,
  },
  requestAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 14,
    color: Colors.dark,
    marginLeft: 8,
    fontWeight: '500',
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
  acceptButton: {
    backgroundColor: Colors.primary,
  },
  declineButton: {
    backgroundColor: '#EF4444',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  declineButtonText: {
    color: 'white',
    fontSize: 16,
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