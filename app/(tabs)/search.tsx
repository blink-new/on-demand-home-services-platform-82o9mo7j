import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { blink } from '../../src/blink/client';

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadSearchData();
  }, []);

  useEffect(() => {
    filterServices();
  }, [searchQuery, selectedCategory, services]);

  const loadSearchData = async () => {
    try {
      // Load services
      const servicesData = await blink.db.services.list({
        orderBy: { name: 'asc' }
      });
      setServices(servicesData);

      // Load categories
      const categoriesData = await blink.db.service_categories.list({
        orderBy: { name: 'asc' }
      });
      setCategories([{ id: 'all', name: 'All', icon: 'apps-outline' }, ...categoriesData]);
    } catch (error) {
      console.error('Error loading search data:', error);
    }
  };

  const filterServices = () => {
    let filtered = services;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category_id === selectedCategory);
    }

    setFilteredServices(filtered);
  };

  const ServiceCard = ({ service }) => (
    <TouchableOpacity 
      style={styles.serviceCard}
      onPress={() => router.push(`/service-details?serviceId=${service.id}`)}
    >
      <View style={styles.serviceHeader}>
        <View style={styles.serviceIcon}>
          <Ionicons name="construct-outline" size={24} color={Colors.primary} />
        </View>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceDescription} numberOfLines={2}>
            {service.description || 'Professional service available'}
          </Text>
        </View>
        <View style={styles.servicePrice}>
          <Text style={styles.priceText}>${service.base_price}</Text>
          <Text style={styles.priceUnit}>starting</Text>
        </View>
      </View>
      
      <View style={styles.serviceFooter}>
        <View style={styles.serviceStats}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={14} color={Colors.accent} />
            <Text style={styles.statText}>4.8</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={14} color={Colors.gray} />
            <Text style={styles.statText}>{service.duration || 60} min</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={14} color={Colors.gray} />
            <Text style={styles.statText}>150+ bookings</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => router.push(`/service-details?serviceId=${service.id}`)}
        >
          <Text style={styles.bookButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const CategoryFilter = ({ category }) => (
    <TouchableOpacity
      style={[
        styles.categoryFilter,
        selectedCategory === category.id && styles.categoryFilterActive
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <Ionicons
        name={category.icon || 'construct-outline'}
        size={16}
        color={selectedCategory === category.id ? 'white' : Colors.primary}
      />
      <Text style={[
        styles.categoryFilterText,
        selectedCategory === category.id && styles.categoryFilterTextActive
      ]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services, providers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filters */}
      <View style={styles.filtersSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          {categories.map((category, index) => (
            <CategoryFilter key={index} category={category} />
          ))}
        </ScrollView>
      </View>

      {/* Results */}
      <ScrollView style={styles.resultsSection} showsVerticalScrollIndicator={false}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
          </Text>
          <TouchableOpacity style={styles.sortButton}>
            <Ionicons name="funnel-outline" size={16} color={Colors.primary} />
            <Text style={styles.sortButtonText}>Sort</Text>
          </TouchableOpacity>
        </View>

        {filteredServices.length > 0 ? (
          filteredServices.map((service, index) => (
            <ServiceCard key={index} service={service} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={Colors.gray} />
            <Text style={styles.emptyTitle}>No services found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or browse different categories
            </Text>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              <Text style={styles.clearFiltersText}>Clear filters</Text>
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
  searchHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.dark,
  },
  filtersSection: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filtersScroll: {
    paddingLeft: 16,
  },
  categoryFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginRight: 8,
    gap: 6,
  },
  categoryFilterActive: {
    backgroundColor: Colors.primary,
  },
  categoryFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  categoryFilterTextActive: {
    color: 'white',
  },
  resultsSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 4,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  serviceCard: {
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
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
  },
  servicePrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  priceUnit: {
    fontSize: 12,
    color: Colors.gray,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '500',
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
  clearFiltersButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  clearFiltersText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});