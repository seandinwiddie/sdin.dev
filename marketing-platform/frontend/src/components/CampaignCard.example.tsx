/**
 * @fileoverview Campaign Card Component
 * 
 * Displays campaign information in a card format with metrics and actions.
 * Supports different states and interactive features.
 * 
 * @module components/CampaignCard
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { formatCurrency, formatPercentage, formatCompactNumber } from '@/utils/formatters';
import type { Campaign } from '@/types/campaign';

/**
 * Campaign card props interface
 * 
 * @interface CampaignCardProps
 * @property {Campaign} campaign - The campaign data to display
 * @property {() => void} [onPress] - Callback when card is pressed
 * @property {() => void} [onEdit] - Callback when edit button is pressed
 * @property {() => void} [onDelete] - Callback when delete button is pressed
 * @property {boolean} [showActions=true] - Whether to show action buttons
 */
interface CampaignCardProps {
  campaign: Campaign;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

/**
 * Gets the status color based on campaign status
 * 
 * Pure function that maps campaign status to a color.
 * 
 * @function getStatusColor
 * @param {string} status - Campaign status
 * @returns {string} Tailwind color class
 */
const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    draft: 'bg-gray-500',
    active: 'bg-green-500',
    paused: 'bg-yellow-500',
    completed: 'bg-blue-500',
    deleted: 'bg-red-500',
  };
  
  return colorMap[status] || 'bg-gray-500';
};

/**
 * Gets the status icon based on campaign status
 * 
 * Pure function that maps campaign status to an icon name.
 * 
 * @function getStatusIcon
 * @param {string} status - Campaign status
 * @returns {string} SF Symbol icon name
 */
const getStatusIcon = (status: string): string => {
  const iconMap: Record<string, string> = {
    draft: 'doc.text',
    active: 'play.circle.fill',
    paused: 'pause.circle.fill',
    completed: 'checkmark.circle.fill',
    deleted: 'trash.circle.fill',
  };
  
  return iconMap[status] || 'circle';
};

/**
 * Campaign Card Component
 * 
 * Displays campaign information in a visually appealing card format.
 * Shows key metrics, status, and provides action buttons.
 * 
 * @component
 * @param {CampaignCardProps} props - Component properties
 * @returns {JSX.Element} The rendered campaign card
 * 
 * @example
 * ```tsx
 * <CampaignCard
 *   campaign={campaignData}
 *   onPress={() => navigate(`/campaigns/${campaign.id}`)}
 *   onEdit={() => openEditDialog(campaign)}
 *   onDelete={() => deleteCampaign(campaign.id)}
 * />
 * ```
 */
export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onPress,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  /**
   * Handles card press event
   * 
   * @function handlePress
   * @returns {void}
   */
  const handlePress = () => {
    onPress?.();
  };

  /**
   * Handles edit button press
   * 
   * @function handleEdit
   * @param {React.MouseEvent} e - Click event
   * @returns {void}
   */
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  /**
   * Handles delete button press
   * 
   * @function handleDelete
   * @param {React.MouseEvent} e - Click event
   * @returns {void}
   */
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl"
    >
      {/* Header */}
      <View className="flex-row items-start justify-between mb-4">
        <View className="flex-1">
          <Text className="text-white text-xl font-bold mb-1">
            {campaign.name}
          </Text>
          <Text className="text-white/70 text-sm" numberOfLines={2}>
            {campaign.description}
          </Text>
        </View>
        
        {/* Status Badge */}
        <View className={`${getStatusColor(campaign.status)} px-3 py-1 rounded-full flex-row items-center gap-1`}>
          <IconSymbol 
            name={getStatusIcon(campaign.status)} 
            size={14} 
            color="#FFFFFF" 
          />
          <Text className="text-white text-xs font-semibold capitalize">
            {campaign.status}
          </Text>
        </View>
      </View>

      {/* Metrics Grid */}
      <View className="flex-row flex-wrap gap-4 mb-4">
        <MetricItem
          label="Impressions"
          value={formatCompactNumber(campaign.metrics.impressions)}
          icon="eye"
        />
        <MetricItem
          label="Clicks"
          value={formatCompactNumber(campaign.metrics.clicks)}
          icon="hand.tap"
        />
        <MetricItem
          label="CTR"
          value={formatPercentage(campaign.metrics.ctr)}
          icon="chart.line.uptrend.xyaxis"
        />
        <MetricItem
          label="ROI"
          value={formatPercentage(campaign.metrics.roi / 100)}
          icon="dollarsign.circle"
          valueColor={campaign.metrics.roi >= 0 ? 'text-green-400' : 'text-red-400'}
        />
      </View>

      {/* Budget Progress */}
      <View className="mb-4">
        <View className="flex-row justify-between mb-2">
          <Text className="text-white/70 text-sm">Budget</Text>
          <Text className="text-white text-sm font-semibold">
            {formatCurrency(campaign.budget.spent)} / {formatCurrency(campaign.budget.total)}
          </Text>
        </View>
        <View className="h-2 bg-white/10 rounded-full overflow-hidden">
          <View 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            style={{ 
              width: `${(campaign.budget.spent / campaign.budget.total) * 100}%` 
            }}
          />
        </View>
      </View>

      {/* Actions */}
      {showActions && (
        <View className="flex-row gap-2 pt-4 border-t border-white/10">
          <TouchableOpacity
            onPress={handleEdit}
            className="flex-1 flex-row items-center justify-center bg-blue-500/20 hover:bg-blue-500/30 px-4 py-2 rounded-lg border border-blue-500/30"
          >
            <IconSymbol name="pencil" size={16} color="#60A5FA" />
            <Text className="text-blue-400 ml-2 font-semibold">Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleDelete}
            className="flex-row items-center justify-center bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-lg border border-red-500/30"
          >
            <IconSymbol name="trash" size={16} color="#F87171" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

/**
 * Metric item component for displaying individual metrics
 * 
 * @interface MetricItemProps
 * @property {string} label - Metric label
 * @property {string} value - Metric value
 * @property {string} icon - Icon name
 * @property {string} [valueColor='text-white'] - Value text color
 */
interface MetricItemProps {
  label: string;
  value: string;
  icon: string;
  valueColor?: string;
}

/**
 * Metric Item Component
 * 
 * Displays a single metric with icon, label, and value.
 * 
 * @component
 * @param {MetricItemProps} props - Component properties
 * @returns {JSX.Element} The rendered metric item
 */
const MetricItem: React.FC<MetricItemProps> = ({
  label,
  value,
  icon,
  valueColor = 'text-white',
}) => (
  <View className="flex-1 min-w-[100px]">
    <View className="flex-row items-center gap-1 mb-1">
      <IconSymbol name={icon} size={12} color="rgba(255, 255, 255, 0.5)" />
      <Text className="text-white/50 text-xs">{label}</Text>
    </View>
    <Text className={`${valueColor} text-lg font-bold`}>{value}</Text>
  </View>
);

export default CampaignCard;
