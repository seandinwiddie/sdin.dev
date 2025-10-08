/**
 * @fileoverview Campaign Service
 * 
 * Contains business logic for campaign management.
 * Handles data validation, business rules, and database interactions.
 * 
 * @module services/campaignService
 */

import { Campaign } from '../models/Campaign';
import { AppError } from '../utils/appError';
import { StatusCodes } from 'http-status-codes';

/**
 * Campaign filter parameters interface
 * 
 * @interface CampaignFilters
 * @property {string} [tenantId] - Filter by tenant ID
 * @property {string} [status] - Filter by campaign status
 * @property {number} [page] - Page number for pagination
 * @property {number} [limit] - Items per page
 */
interface CampaignFilters {
  tenantId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

/**
 * Campaign creation data interface
 * 
 * @interface CreateCampaignData
 * @property {string} name - Campaign name
 * @property {string} status - Campaign status
 * @property {string} tenantId - Associated tenant ID
 * @property {string} userId - Creator user ID
 * @property {number} budget - Campaign budget
 * @property {Date} startDate - Campaign start date
 * @property {Date} endDate - Campaign end date
 */
interface CreateCampaignData {
  name: string;
  status: string;
  tenantId: string;
  userId: string;
  budget: number;
  startDate: Date;
  endDate: Date;
}

/**
 * Campaign analytics interface
 * 
 * @interface CampaignAnalytics
 * @property {number} impressions - Total impressions
 * @property {number} clicks - Total clicks
 * @property {number} conversions - Total conversions
 * @property {number} revenue - Total revenue generated
 * @property {number} roi - Return on investment percentage
 */
interface CampaignAnalytics {
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  roi: number;
}

/**
 * Campaign Service Class
 * 
 * Provides business logic methods for campaign operations.
 * Implements functional programming patterns for data transformation.
 * 
 * @class CampaignService
 */
export class CampaignService {
  /**
   * Retrieves campaigns with filtering and pagination
   * 
   * Applies filters to campaign query and returns paginated results.
   * Uses pure functions for data transformation.
   * 
   * @async
   * @function getCampaigns
   * @param {CampaignFilters} filters - Filter parameters
   * @returns {Promise<Campaign[]>} Array of filtered campaigns
   * @throws {AppError} If database query fails
   */
  async getCampaigns(filters: CampaignFilters): Promise<Campaign[]> {
    const { tenantId, status, page = 1, limit = 10 } = filters;
    
    const query = Campaign.query();
    
    if (tenantId) {
      query.where('tenantId', tenantId);
    }
    
    if (status) {
      query.where('status', status);
    }
    
    const campaigns = await query
      .page(page - 1, limit)
      .orderBy('createdAt', 'desc');
    
    return campaigns.results;
  }

  /**
   * Retrieves a single campaign by ID
   * 
   * @async
   * @function getCampaignById
   * @param {string} id - Campaign ID
   * @returns {Promise<Campaign | null>} Campaign object or null if not found
   * @throws {AppError} If database query fails
   */
  async getCampaignById(id: string): Promise<Campaign | null> {
    const campaign = await Campaign.query().findById(id);
    return campaign || null;
  }

  /**
   * Creates a new campaign
   * 
   * Validates campaign data and creates a new campaign record.
   * Applies business rules such as budget limits and date validation.
   * 
   * @async
   * @function createCampaign
   * @param {CreateCampaignData} data - Campaign creation data
   * @returns {Promise<Campaign>} Created campaign object
   * @throws {AppError} If validation fails or creation fails
   */
  async createCampaign(data: CreateCampaignData): Promise<Campaign> {
    // Validate dates
    if (new Date(data.startDate) > new Date(data.endDate)) {
      throw new AppError(
        'Start date must be before end date',
        StatusCodes.BAD_REQUEST
      );
    }
    
    // Validate budget
    if (data.budget < 0) {
      throw new AppError(
        'Budget must be a positive number',
        StatusCodes.BAD_REQUEST
      );
    }
    
    const campaign = await Campaign.query().insert(data);
    return campaign;
  }

  /**
   * Updates an existing campaign
   * 
   * Applies partial updates to a campaign while maintaining data integrity.
   * Validates business rules before updating.
   * 
   * @async
   * @function updateCampaign
   * @param {string} id - Campaign ID
   * @param {Partial<Campaign>} updates - Campaign updates
   * @returns {Promise<Campaign | null>} Updated campaign or null if not found
   * @throws {AppError} If validation fails or update fails
   */
  async updateCampaign(
    id: string,
    updates: Partial<Campaign>
  ): Promise<Campaign | null> {
    const campaign = await Campaign.query().findById(id);
    
    if (!campaign) {
      return null;
    }
    
    // Validate budget if updated
    if (updates.budget !== undefined && updates.budget < 0) {
      throw new AppError(
        'Budget must be a positive number',
        StatusCodes.BAD_REQUEST
      );
    }
    
    const updated = await campaign.$query().patchAndFetch(updates);
    return updated;
  }

  /**
   * Soft deletes a campaign
   * 
   * Marks a campaign as deleted without removing it from the database.
   * Preserves data for audit and recovery purposes.
   * 
   * @async
   * @function deleteCampaign
   * @param {string} id - Campaign ID
   * @returns {Promise<void>}
   * @throws {AppError} If campaign not found or deletion fails
   */
  async deleteCampaign(id: string): Promise<void> {
    const campaign = await Campaign.query().findById(id);
    
    if (!campaign) {
      throw new AppError('Campaign not found', StatusCodes.NOT_FOUND);
    }
    
    await campaign.$query().patch({
      deletedAt: new Date(),
      status: 'deleted',
    });
  }

  /**
   * Retrieves campaign analytics
   * 
   * Calculates and aggregates campaign performance metrics.
   * Uses functional composition for metric calculations.
   * 
   * @async
   * @function getCampaignAnalytics
   * @param {string} campaignId - Campaign ID
   * @param {string} startDate - Analytics start date
   * @param {string} endDate - Analytics end date
   * @returns {Promise<CampaignAnalytics>} Campaign analytics object
   * @throws {AppError} If campaign not found or analytics unavailable
   */
  async getCampaignAnalytics(
    campaignId: string,
    startDate: string,
    endDate: string
  ): Promise<CampaignAnalytics> {
    const campaign = await this.getCampaignById(campaignId);
    
    if (!campaign) {
      throw new AppError('Campaign not found', StatusCodes.NOT_FOUND);
    }
    
    // Fetch analytics data from database
    const metrics = await Campaign.relatedQuery('metrics')
      .for(campaignId)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate);
    
    // Calculate aggregated metrics using functional approach
    const analytics = metrics.reduce(
      (acc, metric) => ({
        impressions: acc.impressions + metric.impressions,
        clicks: acc.clicks + metric.clicks,
        conversions: acc.conversions + metric.conversions,
        revenue: acc.revenue + metric.revenue,
        roi: 0, // Will be calculated below
      }),
      { impressions: 0, clicks: 0, conversions: 0, revenue: 0, roi: 0 }
    );
    
    // Calculate ROI
    analytics.roi = campaign.budget > 0
      ? ((analytics.revenue - campaign.budget) / campaign.budget) * 100
      : 0;
    
    return analytics;
  }

  /**
   * Validates campaign status transition
   * 
   * Pure function that checks if a status transition is valid.
   * Implements state machine logic for campaign lifecycle.
   * 
   * @function validateStatusTransition
   * @param {string} currentStatus - Current campaign status
   * @param {string} newStatus - Desired new status
   * @returns {boolean} True if transition is valid
   */
  validateStatusTransition(currentStatus: string, newStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
      draft: ['active', 'deleted'],
      active: ['paused', 'completed', 'deleted'],
      paused: ['active', 'completed', 'deleted'],
      completed: ['deleted'],
      deleted: [],
    };
    
    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  }
}
