import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { blink } from '../../src/blink/client';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedTab, setSelectedTab] = useState('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      if (state.user) {
        loadBookings();
      }
    });
    return unsubscribe;
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const bookingsData = await blink.db.bookings.list({
        where: { customer_id: user?.id },
        orderBy: { created_at: 'desc' }
      });
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBookings = () => {
    switch (selectedTab) {
      case 'active':
        return bookings.filter(booking => 
          ['pending', 'accepted', 'in_progress'].includes(booking.status)
        );
      case 'completed':
        return bookings.filter(booking => booking.status === 'completed');
      case 'cancelled':
        return bookings.filter(booking => booking.status === 'cancelled');
      default:
        return bookings;
    }
  };

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'accepted': return 'checkmark-circle-outline';
      case 'in_progress': return 'play-circle-outline';
      case 'completed': return 'checkmark-done-outline';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const BookingCard = ({ booking }) => (
    <TouchableOpacity 
      style={styles.bookingCard}
      onPress={() => router.push(`/booking-tracking?bookingId=${booking.id}`)}
    >
      <View style={styles.bookingHeader}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{booking.service_name || 'Service'}</Text>
          <Text style={styles.providerName}>by {booking.provider_name || 'Provider'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
          <Ionicons name={getStatusIcon(booking.status)} size={14} color="white" />
          <Text style={styles.statusText}>{booking.status}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={Colors.gray} />
          <Text style={styles.detailText}>
            {new Date(booking.scheduled_date).toLocaleDateString()} at {booking.scheduled_time}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={Colors.gray} />
          <Text style={styles.detailText}>{booking.address || 'Address not provided'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="wallet-outline" size={16} color={Colors.gray} />
          <Text style={styles.detailText}>${booking.total_amount}</Text>
        </View>
      </View>

      {booking.status === 'completed' && (
        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>Your Rating:</Text>
          <View style={styles.ratingStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name="star"
                size={16}
                color={star <= (booking.rating || 0) ? Colors.accent : '#E5E7EB'}
              />
            ))}
          </View>
        </View>
      )}

      <View style={styles.bookingActions}>
        {booking.status === 'pending' && (
          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        
        {booking.status === 'accepted' && (
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="chatbubble-outline" size={16} color={Colors.primary} />
            <Text style={styles.contactButtonText}>Contact Provider</Text>
          </TouchableOpacity>
        )}
        
        {booking.status === 'in_progress' && (
          <TouchableOpacity 
            style={styles.trackButton}
            onPress={() => router.push(`/booking-tracking?bookingId=${booking.id}`)}
          >
            <Ionicons name="location-outline" size={16} color="white" />
            <Text style={styles.trackButtonText}>Track Progress</Text>
          </TouchableOpacity>
        )}
        
        {booking.status === 'completed' && !booking.rating && (
          <TouchableOpacity style={styles.rateButton}>
            <Ionicons name="star-outline" size={16} color={Colors.primary} />
            <Text style={styles.rateButtonText}>Rate Service</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => router.push(`/booking-tracking?bookingId=${booking.id}`)}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const TabButton = ({ tab, label, count }) => (
    <TouchableOpacity
      style={[styles.tabButton, selectedTab === tab && styles.tabButtonActive]}
      onPress={() => setSelectedTab(tab)}
    >
      <Text style={[
        styles.tabButtonText,
        selectedTab === tab && styles.tabButtonTextActive
      ]}>
        {label}
      </Text>
      {count > 0 && (
        <View style={[
          styles.tabBadge,
          selectedTab === tab && styles.tabBadgeActive
        ]}>
          <Text style={[
            styles.tabBadgeText,
            selectedTab === tab && styles.tabBadgeTextActive
          ]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const filteredBookings = getFilteredBookings();
  const activeCount = bookings.filter(b => ['pending', 'accepted', 'in_progress'].includes(b.status)).length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TabButton tab="active" label="Active" count={activeCount} />
        <TabButton tab="completed" label="Completed" count={completedCount} />
        <TabButton tab="cancelled" label="Cancelled" count={cancelledCount} />
      </View>

      {/* Bookings List */}
      <ScrollView style={styles.bookingsList} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading bookings...</Text>
          </View>
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking, index) => (
            <BookingCard key={index} booking={booking} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons 
              name={selectedTab === 'active' ? 'calendar-outline' : 
                   selectedTab === 'completed' ? 'checkmark-done-outline' : 'close-circle-outline'} 
              size={64} 
              color={Colors.gray} 
            />
            <Text style={styles.emptyTitle}>
              No {selectedTab} bookings
            </Text>
            <Text style={styles.emptySubtext}>
              {selectedTab === 'active' 
                ? 'Book a service to see your active bookings here'
                : selectedTab === 'completed'
                ? 'Your completed services will appear here'
                : 'Your cancelled bookings will appear here'
              }
            </Text>
            {selectedTab === 'active' && (
              <TouchableOpacity style={styles.browseButton}>
                <Text style={styles.browseButtonText}>Browse Services</Text>
              </TouchableOpacity>
            )}
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
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray,
  },
  tabButtonTextActive: {
    color: 'white',
  },
  tabBadge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray,
  },
  tabBadgeTextActive: {
    color: 'white',
  },
  bookingsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  bookingCard: {
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
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 2,
  },
  providerName: {
    fontSize: 14,
    color: Colors.gray,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
  },
  bookingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.dark,
    flex: 1,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  ratingLabel: {
    fontSize: 14,
    color: Colors.gray,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
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
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#10B981',
    gap: 4,
  },
  trackButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 4,
  },
  rateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  detailsButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark,
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
  browseButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});