/**
 * @fileoverview Campaign Type Definitions
 * 
 * TypeScript type definitions and interfaces for campaign-related entities.
 * Provides type safety for campaign data throughout the application.
 * 
 * @module types/campaign
 */

/**
 * Campaign status enumeration
 * 
 * @enum {string}
 * @readonly
 */
export enum CampaignStatus {
  /** Campaign is being drafted and not yet launched */
  DRAFT = 'draft',
  /** Campaign is currently active and running */
  ACTIVE = 'active',
  /** Campaign is temporarily paused */
  PAUSED = 'paused',
  /** Campaign has finished its run */
  COMPLETED = 'completed',
  /** Campaign has been deleted */
  DELETED = 'deleted',
}

/**
 * Campaign type enumeration
 * 
 * @enum {string}
 * @readonly
 */
export enum CampaignType {
  /** Email marketing campaign */
  EMAIL = 'email',
  /** Social media campaign */
  SOCIAL = 'social',
  /** Search engine marketing campaign */
  SEARCH = 'search',
  /** Display advertising campaign */
  DISPLAY = 'display',
  /** Video advertising campaign */
  VIDEO = 'video',
}

/**
 * Campaign budget configuration
 * 
 * @interface CampaignBudget
 * @property {number} total - Total campaign budget
 * @property {number} spent - Amount already spent
 * @property {number} remaining - Remaining budget
 * @property {string} currency - Currency code (ISO 4217)
 */
export interface CampaignBudget {
  total: number;
  spent: number;
  remaining: number;
  currency: string;
}

/**
 * Campaign targeting configuration
 * 
 * @interface CampaignTargeting
 * @property {string[]} locations - Geographic locations to target
 * @property {string[]} demographics - Demographic segments to target
 * @property {string[]} interests - Interest categories to target
 * @property {number} minAge - Minimum age for targeting
 * @property {number} maxAge - Maximum age for targeting
 */
export interface CampaignTargeting {
  locations: string[];
  demographics: string[];
  interests: string[];
  minAge: number;
  maxAge: number;
}

/**
 * Campaign performance metrics
 * 
 * @interface CampaignMetrics
 * @property {number} impressions - Total impressions
 * @property {number} clicks - Total clicks
 * @property {number} conversions - Total conversions
 * @property {number} revenue - Total revenue generated
 * @property {number} ctr - Click-through rate (0-1)
 * @property {number} cpc - Cost per click
 * @property {number} cpa - Cost per acquisition
 * @property {number} roi - Return on investment (-1 to infinity)
 */
export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roi: number;
}

/**
 * Campaign schedule configuration
 * 
 * @interface CampaignSchedule
 * @property {Date} startDate - Campaign start date
 * @property {Date} endDate - Campaign end date
 * @property {string[]} activeDays - Days of week when campaign is active
 * @property {string} timezone - Timezone for schedule (IANA timezone)
 */
export interface CampaignSchedule {
  startDate: Date;
  endDate: Date;
  activeDays: string[];
  timezone: string;
}

/**
 * Main Campaign interface
 * 
 * Represents a complete marketing campaign with all associated data.
 * 
 * @interface Campaign
 * @property {string} id - Unique campaign identifier
 * @property {string} name - Campaign name
 * @property {string} description - Campaign description
 * @property {CampaignStatus} status - Current campaign status
 * @property {CampaignType} type - Type of campaign
 * @property {string} tenantId - Associated tenant ID
 * @property {string} userId - Creator user ID
 * @property {CampaignBudget} budget - Budget configuration
 * @property {CampaignTargeting} targeting - Targeting configuration
 * @property {CampaignMetrics} metrics - Performance metrics
 * @property {CampaignSchedule} schedule - Schedule configuration
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 * @property {Date | null} deletedAt - Deletion timestamp (soft delete)
 */
export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  type: CampaignType;
  tenantId: string;
  userId: string;
  budget: CampaignBudget;
  targeting: CampaignTargeting;
  metrics: CampaignMetrics;
  schedule: CampaignSchedule;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * Campaign creation input type
 * 
 * Partial type for creating a new campaign.
 * Omits auto-generated fields like id, createdAt, etc.
 * 
 * @typedef {Object} CreateCampaignInput
 */
export type CreateCampaignInput = Omit<
  Campaign,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'metrics'
> & {
  metrics?: Partial<CampaignMetrics>;
};

/**
 * Campaign update input type
 * 
 * Partial type for updating an existing campaign.
 * All fields are optional except id.
 * 
 * @typedef {Object} UpdateCampaignInput
 */
export type UpdateCampaignInput = Partial<Omit<Campaign, 'id' | 'createdAt'>> & {
  id: string;
};

/**
 * Campaign filter parameters
 * 
 * @interface CampaignFilters
 * @property {CampaignStatus} [status] - Filter by status
 * @property {CampaignType} [type] - Filter by type
 * @property {string} [tenantId] - Filter by tenant
 * @property {string} [userId] - Filter by creator
 * @property {Date} [startDate] - Filter by start date (after)
 * @property {Date} [endDate] - Filter by end date (before)
 */
export interface CampaignFilters {
  status?: CampaignStatus;
  type?: CampaignType;
  tenantId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Campaign sort options
 * 
 * @interface CampaignSortOptions
 * @property {'name' | 'createdAt' | 'startDate' | 'budget'} field - Field to sort by
 * @property {'asc' | 'desc'} order - Sort order
 */
export interface CampaignSortOptions {
  field: 'name' | 'createdAt' | 'startDate' | 'budget';
  order: 'asc' | 'desc';
}

/**
 * Paginated campaign response
 * 
 * @interface PaginatedCampaigns
 * @property {Campaign[]} data - Array of campaigns
 * @property {number} total - Total number of campaigns
 * @property {number} page - Current page number
 * @property {number} limit - Items per page
 * @property {number} totalPages - Total number of pages
 */
export interface PaginatedCampaigns {
  data: Campaign[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Type guard to check if a value is a valid Campaign
 * 
 * @function isCampaign
 * @param {unknown} value - Value to check
 * @returns {value is Campaign} True if value is a Campaign
 * 
 * @example
 * if (isCampaign(data)) {
 *   console.log(data.name); // TypeScript knows data is Campaign
 * }
 */
export const isCampaign = (value: unknown): value is Campaign => {
  if (typeof value !== 'object' || value === null) return false;
  
  const campaign = value as Campaign;
  return (
    typeof campaign.id === 'string' &&
    typeof campaign.name === 'string' &&
    Object.values(CampaignStatus).includes(campaign.status) &&
    Object.values(CampaignType).includes(campaign.type)
  );
};

/**
 * Type guard to check if a campaign is active
 * 
 * @function isActiveCampaign
 * @param {Campaign} campaign - Campaign to check
 * @returns {boolean} True if campaign is active
 * 
 * @example
 * const activeCampaigns = campaigns.filter(isActiveCampaign);
 */
export const isActiveCampaign = (campaign: Campaign): boolean => {
  return campaign.status === CampaignStatus.ACTIVE;
};

/**
 * Type guard to check if a campaign has budget remaining
 * 
 * @function hasBudgetRemaining
 * @param {Campaign} campaign - Campaign to check
 * @returns {boolean} True if campaign has remaining budget
 * 
 * @example
 * const fundedCampaigns = campaigns.filter(hasBudgetRemaining);
 */
export const hasBudgetRemaining = (campaign: Campaign): boolean => {
  return campaign.budget.remaining > 0;
};
