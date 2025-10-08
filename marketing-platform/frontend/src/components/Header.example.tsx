/**
 * @fileoverview Application Header Component
 * 
 * Main navigation header with user profile, notifications, and tenant switcher.
 * Responsive design with mobile menu support.
 * 
 * @module components/Header
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '@/features/auth';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { UserProfile } from '@/components/UserProfile';
import type { AppDispatch } from '@/app/store';

/**
 * Navigation item interface
 * 
 * @interface NavItem
 * @property {string} id - Unique identifier for the navigation item
 * @property {string} label - Display label
 * @property {string} href - Navigation path
 * @property {string} [icon] - Optional icon name
 */
interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
}

/**
 * Header component props
 * 
 * @interface HeaderProps
 * @property {NavItem[]} [navItems] - Optional custom navigation items
 * @property {boolean} [showUserProfile=true] - Whether to show user profile
 * @property {() => void} [onMenuToggle] - Callback for mobile menu toggle
 */
interface HeaderProps {
  navItems?: NavItem[];
  showUserProfile?: boolean;
  onMenuToggle?: () => void;
}

/**
 * Default navigation items
 * 
 * @constant {NavItem[]} defaultNavItems
 */
const defaultNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'house' },
  { id: 'campaigns', label: 'Campaigns', href: '/campaigns', icon: 'megaphone' },
  { id: 'analytics', label: 'Analytics', href: '/analytics', icon: 'chart.bar' },
  { id: 'settings', label: 'Settings', href: '/settings', icon: 'gear' },
];

/**
 * Header Component
 * 
 * Displays the main application header with navigation, user profile, and actions.
 * Adapts to different screen sizes with responsive behavior.
 * 
 * @component
 * @param {HeaderProps} props - Component properties
 * @returns {JSX.Element} The rendered header component
 * 
 * @example
 * ```tsx
 * <Header 
 *   navItems={customNavItems}
 *   showUserProfile={true}
 *   onMenuToggle={() => console.log('Menu toggled')}
 * />
 * ```
 */
export const Header: React.FC<HeaderProps> = ({
  navItems = defaultNavItems,
  showUserProfile = true,
  onMenuToggle,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /**
   * Handles menu toggle for mobile view
   * 
   * @function handleMenuToggle
   * @returns {void}
   */
  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
    onMenuToggle?.();
  };

  /**
   * Handles navigation item click
   * 
   * @function handleNavClick
   * @param {NavItem} item - The navigation item that was clicked
   * @returns {void}
   */
  const handleNavClick = (item: NavItem) => {
    console.log(`Navigating to: ${item.href}`);
    setIsMenuOpen(false);
  };

  /**
   * Renders a navigation item
   * 
   * @function renderNavItem
   * @param {NavItem} item - The navigation item to render
   * @returns {JSX.Element} Rendered navigation item
   */
  const renderNavItem = (item: NavItem): JSX.Element => (
    <TouchableOpacity
      key={item.id}
      onPress={() => handleNavClick(item)}
      className="flex-row items-center px-4 py-2 hover:bg-white/10 rounded-lg transition-colors"
    >
      {item.icon && (
        <IconSymbol 
          name={item.icon} 
          size={20} 
          color="#FFFFFF" 
          style={{ marginRight: 8 }}
        />
      )}
      <Text className="text-white text-base font-medium">
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  if (!user) return null;

  return (
    <View className="bg-black/70 backdrop-blur-xl border-b border-white/20">
      {/* Main Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        {/* Logo */}
        <View className="flex-row items-center">
          <IconSymbol name="star.fill" size={24} color="#FFFFFF" />
          <Text className="text-white text-xl font-bold ml-2">
            Marketing Platform
          </Text>
        </View>

        {/* Desktop Navigation */}
        <View className="hidden md:flex flex-row items-center gap-2">
          {navItems.map(renderNavItem)}
        </View>

        {/* Right Section */}
        <View className="flex-row items-center gap-4">
          {/* Notifications */}
          <TouchableOpacity className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
            <IconSymbol name="bell" size={20} color="#FFFFFF" />
            <View className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </TouchableOpacity>

          {/* Mobile Menu Toggle */}
          <TouchableOpacity 
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            onPress={handleMenuToggle}
          >
            <IconSymbol 
              name={isMenuOpen ? 'xmark' : 'line.horizontal.3'} 
              size={20} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <View className="md:hidden border-t border-white/20 px-6 py-4">
          <ScrollView>
            {navItems.map(renderNavItem)}
          </ScrollView>
        </View>
      )}

      {/* User Profile Section */}
      {showUserProfile && (
        <View className="px-6 pb-4">
          <UserProfile />
        </View>
      )}
    </View>
  );
};

export default Header;
