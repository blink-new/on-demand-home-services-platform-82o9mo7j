import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { blink } from '../../src/blink/client';

export default function Home() {
  const [user, setUser] = useState(null);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      if (state.user) {
        loadHomeData();
      }
    });
    return unsubscribe;
  }, []);

  const loadHomeData = async () => {
    try {
      // Load service categories
      const categories = await blink.db.service_categories.list({
        orderBy: { name: 'asc' }
      });
      setServiceCategories(categories);

      // Load featured providers (mock data for now)
      setFeaturedProviders([
        { id: 1, name: 'John Smith', service: 'Plumbing', rating: 4.9, jobs: 150 },
        { id: 2, name: 'Sarah Johnson', service: 'Cleaning', rating: 4.8, jobs: 200 },
        { id: 3, name: 'Mike Wilson', service: 'Electrical', rating: 4.7, jobs: 120 },
      ]);
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  };

  const CategoryCard = ({ category }) => (
    <TouchableOpacity style={styles.categoryCard}>
      <View style={styles.categoryIcon}>
        <Ionicons name={category.icon || 'construct-outline'} size={32} color={Colors.primary} />
      </View>
      <Text style={styles.categoryName}>{category.name}</Text>
      <Text style={styles.categoryCount}>{category.service_count || 0} services</Text>
    </TouchableOpacity>
  );

  const ProviderCard = ({ provider }) => (
    <TouchableOpacity style={styles.providerCard}>
      <View style={styles.providerAvatar}>
        <Text style={styles.providerAvatarText}>{provider.name.charAt(0)}</Text>
      </View>
      <View style={styles.providerInfo}>
        <Text style={styles.providerName}>{provider.name}</Text>
        <Text style={styles.providerService}>{provider.service}</Text>
        <View style={styles.providerStats}>
          <View style={styles.providerRating}>
            <Ionicons name="star" size={14} color={Colors.accent} />
            <Text style={styles.ratingText}>{provider.rating}</Text>
          </View>
          <Text style={styles.jobsText}>{provider.jobs} jobs</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.bookButton}>
        <Text style={styles.bookButtonText}>Book</Text>
      </TouchableOpacity>
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
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Hello, {user.displayName || 'there'}!</Text>
        <Text style={styles.welcomeSubtext}>What service do you need today?</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for services..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Service Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {serviceCategories.map((category, index) => (
            <CategoryCard key={index} category={category} />
          ))}
        </ScrollView>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionCard}>
            <Ionicons name="flash-outline" size={24} color={Colors.primary} />
            <Text style={styles.quickActionText}>Emergency Service</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <Ionicons name="calendar-outline" size={24} color={Colors.primary} />
            <Text style={styles.quickActionText}>Schedule Later</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <Ionicons name="repeat-outline" size={24} color={Colors.primary} />
            <Text style={styles.quickActionText}>Repeat Booking</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Featured Providers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Rated Providers</Text>
        {featuredProviders.map((provider, index) => (
          <ProviderCard key={index} provider={provider} />
        ))}
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color={Colors.gray} />
          <Text style={styles.emptyText}>No recent activity</Text>
          <Text style={styles.emptySubtext}>Your booking history will appear here</Text>
        </View>
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
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: Colors.gray,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.dark,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoriesScroll: {
    paddingLeft: 16,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    width: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark,
    marginTop: 8,
    textAlign: 'center',
  },
  providerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  providerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  providerAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 2,
  },
  providerService: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 4,
  },
  providerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  providerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark,
  },
  jobsText: {
    fontSize: 12,
    color: Colors.gray,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    marginHorizontal: 16,
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