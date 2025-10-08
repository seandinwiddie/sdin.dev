import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectUser, 
  selectAuthLoading,
  selectUserInitials,
  selectUserFullName,
  selectUserDisplayInfo,
  logoutUser 
} from '@/features/auth';
import { 
  openLogoutDialog 
} from '@/features/ui';
import { useGetTenantsQuery } from '@/features/api';
import { setCurrentTenant } from '@/features/tenants';
import { RootState, AppDispatch } from '@/app/store';
import { IconSymbol } from '@/components/ui/icon-symbol';

/**
 * UserProfile Component
 * 
 * Displays the authenticated user's profile information including avatar, name, email,
 * and role. Provides tenant switching functionality for multi-tenant users and a logout action.
 * 
 * @component
 * @returns {JSX.Element | null} The user profile card component, or null if no user is authenticated
 * 
 * @example
 * ```tsx
 * <UserProfile />
 * ```
 * 
 * @description
 * This component:
 * - Displays user avatar with initials
 * - Shows user full name, email, and display information
 * - Lists current tenant information
 * - Provides tenant switching capability for users with multiple tenants
 * - Handles user logout with confirmation dialog
 * - Uses Redux for state management and RTK Query for data fetching
 */
export default function UserProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectAuthLoading);
  const userInitials = useSelector(selectUserInitials);
  const userFullName = useSelector(selectUserFullName);
  const userDisplayInfo = useSelector(selectUserDisplayInfo);
  
  // Tenant context
  const { data: tenants = [], isLoading: tenantsLoading } = useGetTenantsQuery({});
  const { currentTenant } = useSelector((state: RootState) => state.tenants);

  /**
   * Handles user logout action
   * 
   * Opens a confirmation dialog before logging out the user.
   * Uses the UI slice to manage dialog state and auth slice to perform logout.
   * 
   * @function handleLogout
   * @returns {void}
   * 
   * @fires openLogoutDialog - Dispatches action to show logout confirmation dialog
   * @fires logoutUser - Dispatches action to log out user when confirmed
   */
  const handleLogout = () => {
    dispatch(openLogoutDialog({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      onConfirm: () => {
        dispatch(logoutUser());
      },
      onCancel: () => {
        // Dialog will be closed by UI slice
      }
    }));
  };

  /**
   * Handles tenant switching for multi-tenant users
   * 
   * Updates the current tenant context when a user selects a different tenant.
   * Only switches if the tenant exists in the user's available tenants list.
   * 
   * @function handleTenantSwitch
   * @param {string} tenantId - The unique identifier of the tenant to switch to
   * @returns {void}
   * 
   * @fires setCurrentTenant - Dispatches action to update current tenant in Redux store
   */
  const handleTenantSwitch = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      dispatch(setCurrentTenant(tenant));
    }
  };

  if (!user) return null;

  return (
    <View className="bg-black/50 backdrop-blur-lg rounded-xl p-4 mb-6 border border-white/30 shadow-glow-lg">
      <View className="flex-row items-center mb-4">
        <View className="w-12 h-12 rounded-full bg-white justify-center items-center mr-3 shadow-glow-md">
          <Text className="text-black text-base font-semibold">
            {userInitials}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-white text-base font-semibold mb-0.5">
            {userFullName}
          </Text>
          <Text className="text-white text-sm mb-0.5 opacity-80">
            {user?.email}
          </Text>
          <Text className="text-white text-xs font-medium opacity-70">
            {userDisplayInfo}
          </Text>
          {currentTenant && (
            <Text className="text-white text-xs font-medium opacity-60 mt-1">
              Tenant: {currentTenant.name}
            </Text>
          )}
        </View>
      </View>
      
      {/* Tenant Selection */}
      {tenants.length > 1 && (
        <View className="mb-4">
          <Text className="text-white text-sm font-medium mb-2 opacity-80">
            Switch Tenant:
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {tenants.map((tenant) => (
              <TouchableOpacity
                key={tenant.id}
                onPress={() => handleTenantSwitch(tenant.id)}
                className={`px-3 py-2 rounded-lg border ${
                  currentTenant?.id === tenant.id
                    ? 'bg-white/20 border-white/40'
                    : 'bg-white/10 border-white/20'
                }`}
              >
                <Text className={`text-sm ${
                  currentTenant?.id === tenant.id
                    ? 'text-white font-semibold'
                    : 'text-white/70'
                }`}>
                  {tenant.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      
      <TouchableOpacity
        className={`flex-row items-center justify-center bg-white rounded-lg p-3 gap-2 shadow-glow-sm hover:shadow-glow-md transition-all duration-300 ${
          isLoading ? 'opacity-50' : ''
        }`}
        onPress={handleLogout}
        disabled={isLoading}
      >
        <IconSymbol name="rectangle.portrait.and.arrow.right" size={16} color="#000000" style={{ textShadowColor: 'rgba(0, 0, 0, 0.1)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }} />
        <Text className="text-black text-sm font-semibold">
          {isLoading ? 'Signing Out...' : 'Sign Out'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

