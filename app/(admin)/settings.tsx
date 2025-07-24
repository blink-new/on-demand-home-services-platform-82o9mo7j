import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AdminSidebar } from './_layout';

const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
    <View className="p-6 border-b border-gray-200">
      <Text className="text-lg font-semibold text-gray-900">{title}</Text>
    </View>
    <View className="p-6">
      {children}
    </View>
  </View>
);

const SettingItem = ({ 
  icon, 
  title, 
  description, 
  value, 
  onValueChange, 
  type = 'switch' 
}: {
  icon: string;
  title: string;
  description: string;
  value?: any;
  onValueChange?: (value: any) => void;
  type?: 'switch' | 'input' | 'select';
}) => (
  <View className="flex-row items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
    <View className="flex-row items-center flex-1">
      <View className="w-10 h-10 rounded-lg bg-gray-100 items-center justify-center mr-4">
        <Ionicons name={icon as any} size={20} color="#6B7280" />
      </View>
      <View className="flex-1">
        <Text className="font-medium text-gray-900">{title}</Text>
        <Text className="text-sm text-gray-500 mt-1">{description}</Text>
      </View>
    </View>
    
    {type === 'switch' && (
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#F3F4F6', true: '#3B82F6' }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
      />
    )}
    
    {type === 'input' && (
      <TextInput
        value={value}
        onChangeText={onValueChange}
        className="w-32 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-right"
      />
    )}
    
    {type === 'select' && (
      <TouchableOpacity className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
        <Text className="text-gray-700">{value}</Text>
      </TouchableOpacity>
    )}
  </View>
);

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('settings');
  const [settings, setSettings] = useState({
    // Platform Settings
    platformName: 'Home Services Platform',
    platformDescription: 'On-demand home services marketplace',
    maintenanceMode: false,
    allowNewRegistrations: true,
    requireEmailVerification: true,
    
    // Booking Settings
    autoAcceptBookings: false,
    bookingCancellationWindow: '24',
    maxBookingsPerDay: '50',
    requireProviderApproval: true,
    
    // Payment Settings
    platformCommission: '15',
    paymentProcessingFee: '2.9',
    minimumPayout: '50',
    payoutSchedule: 'Weekly',
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordComplexity: true,
    ipWhitelist: false,
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // TODO: Save settings to database
    console.log('Saving settings:', settings);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row h-full">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <ScrollView className="flex-1 p-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-8">
            <View>
              <Text className="text-3xl font-bold text-gray-900 mb-2">Platform Settings</Text>
              <Text className="text-gray-600">Configure your platform's behavior and preferences</Text>
            </View>
            
            <TouchableOpacity
              onPress={handleSaveSettings}
              className="px-6 py-3 bg-blue-600 rounded-lg"
            >
              <Text className="text-white font-medium">Save Changes</Text>
            </TouchableOpacity>
          </View>

          {/* Platform Settings */}
          <SettingSection title="Platform Configuration">
            <SettingItem
              icon="business-outline"
              title="Platform Name"
              description="The name of your service platform"
              value={settings.platformName}
              onValueChange={(value) => updateSetting('platformName', value)}
              type="input"
            />
            <SettingItem
              icon="construct-outline"
              title="Maintenance Mode"
              description="Temporarily disable the platform for maintenance"
              value={settings.maintenanceMode}
              onValueChange={(value) => updateSetting('maintenanceMode', value)}
            />
            <SettingItem
              icon="person-add-outline"
              title="Allow New Registrations"
              description="Enable new users to register on the platform"
              value={settings.allowNewRegistrations}
              onValueChange={(value) => updateSetting('allowNewRegistrations', value)}
            />
            <SettingItem
              icon="mail-outline"
              title="Require Email Verification"
              description="Users must verify their email before using the platform"
              value={settings.requireEmailVerification}
              onValueChange={(value) => updateSetting('requireEmailVerification', value)}
            />
          </SettingSection>

          {/* Booking Settings */}
          <SettingSection title="Booking Management">
            <SettingItem
              icon="checkmark-circle-outline"
              title="Auto-Accept Bookings"
              description="Automatically accept bookings without provider confirmation"
              value={settings.autoAcceptBookings}
              onValueChange={(value) => updateSetting('autoAcceptBookings', value)}
            />
            <SettingItem
              icon="time-outline"
              title="Cancellation Window"
              description="Hours before booking when cancellation is allowed"
              value={settings.bookingCancellationWindow}
              onValueChange={(value) => updateSetting('bookingCancellationWindow', value)}
              type="input"
            />
            <SettingItem
              icon="calendar-outline"
              title="Max Bookings Per Day"
              description="Maximum number of bookings allowed per day"
              value={settings.maxBookingsPerDay}
              onValueChange={(value) => updateSetting('maxBookingsPerDay', value)}
              type="input"
            />
            <SettingItem
              icon="shield-checkmark-outline"
              title="Require Provider Approval"
              description="New providers must be approved before accepting bookings"
              value={settings.requireProviderApproval}
              onValueChange={(value) => updateSetting('requireProviderApproval', value)}
            />
          </SettingSection>

          {/* Payment Settings */}
          <SettingSection title="Payment Configuration">
            <SettingItem
              icon="card-outline"
              title="Platform Commission"
              description="Percentage commission taken from each booking"
              value={settings.platformCommission}
              onValueChange={(value) => updateSetting('platformCommission', value)}
              type="input"
            />
            <SettingItem
              icon="cash-outline"
              title="Payment Processing Fee"
              description="Percentage fee for payment processing"
              value={settings.paymentProcessingFee}
              onValueChange={(value) => updateSetting('paymentProcessingFee', value)}
              type="input"
            />
            <SettingItem
              icon="wallet-outline"
              title="Minimum Payout"
              description="Minimum amount required for provider payouts"
              value={settings.minimumPayout}
              onValueChange={(value) => updateSetting('minimumPayout', value)}
              type="input"
            />
            <SettingItem
              icon="repeat-outline"
              title="Payout Schedule"
              description="How often providers receive payouts"
              value={settings.payoutSchedule}
              onValueChange={(value) => updateSetting('payoutSchedule', value)}
              type="select"
            />
          </SettingSection>

          {/* Notification Settings */}
          <SettingSection title="Notification Preferences">
            <SettingItem
              icon="mail-outline"
              title="Email Notifications"
              description="Send notifications via email"
              value={settings.emailNotifications}
              onValueChange={(value) => updateSetting('emailNotifications', value)}
            />
            <SettingItem
              icon="notifications-outline"
              title="Push Notifications"
              description="Send push notifications to mobile apps"
              value={settings.pushNotifications}
              onValueChange={(value) => updateSetting('pushNotifications', value)}
            />
            <SettingItem
              icon="chatbubble-outline"
              title="SMS Notifications"
              description="Send notifications via SMS"
              value={settings.smsNotifications}
              onValueChange={(value) => updateSetting('smsNotifications', value)}
            />
            <SettingItem
              icon="megaphone-outline"
              title="Marketing Emails"
              description="Send promotional and marketing emails"
              value={settings.marketingEmails}
              onValueChange={(value) => updateSetting('marketingEmails', value)}
            />
          </SettingSection>

          {/* Security Settings */}
          <SettingSection title="Security Configuration">
            <SettingItem
              icon="shield-outline"
              title="Two-Factor Authentication"
              description="Require 2FA for admin accounts"
              value={settings.twoFactorAuth}
              onValueChange={(value) => updateSetting('twoFactorAuth', value)}
            />
            <SettingItem
              icon="timer-outline"
              title="Session Timeout"
              description="Minutes of inactivity before automatic logout"
              value={settings.sessionTimeout}
              onValueChange={(value) => updateSetting('sessionTimeout', value)}
              type="input"
            />
            <SettingItem
              icon="key-outline"
              title="Password Complexity"
              description="Enforce strong password requirements"
              value={settings.passwordComplexity}
              onValueChange={(value) => updateSetting('passwordComplexity', value)}
            />
            <SettingItem
              icon="globe-outline"
              title="IP Whitelist"
              description="Restrict admin access to specific IP addresses"
              value={settings.ipWhitelist}
              onValueChange={(value) => updateSetting('ipWhitelist', value)}
            />
          </SettingSection>

          {/* Danger Zone */}
          <View className="bg-red-50 border border-red-200 rounded-xl p-6">
            <Text className="text-lg font-semibold text-red-900 mb-4">Danger Zone</Text>
            <View className="space-y-4">
              <TouchableOpacity className="w-full p-4 border border-red-300 rounded-lg bg-white">
                <Text className="font-medium text-red-700">Export All Data</Text>
                <Text className="text-sm text-red-600 mt-1">Download a complete backup of platform data</Text>
              </TouchableOpacity>
              <TouchableOpacity className="w-full p-4 border border-red-300 rounded-lg bg-white">
                <Text className="font-medium text-red-700">Reset Platform Statistics</Text>
                <Text className="text-sm text-red-600 mt-1">Clear all analytics and usage statistics</Text>
              </TouchableOpacity>
              <TouchableOpacity className="w-full p-4 border border-red-300 rounded-lg bg-red-600">
                <Text className="font-medium text-white">Delete Platform</Text>
                <Text className="text-sm text-red-100 mt-1">Permanently delete the entire platform and all data</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}