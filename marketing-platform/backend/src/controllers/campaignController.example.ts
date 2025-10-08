/**
 * @fileoverview Campaign Controller
 * 
 * Handles HTTP requests related to marketing campaigns.
 * Implements CRUD operations and business logic for campaign management.
 * 
 * @module controllers/campaignController
 */

import { Request, Response, NextFunction } from 'express';
import { CampaignService } from '../services/campaignService';
import { AppError } from '../utils/appError';
import { StatusCodes } from 'http-status-codes';

/**
 * Campaign Controller Class
 * 
 * Provides HTTP request handlers for campaign-related operations.
 * Uses dependency injection to receive the campaign service.
 * 
 * @class CampaignController
 */
export class CampaignController {
  /**
   * Creates an instance of CampaignController
   * 
   * @constructor
   * @param {CampaignService} campaignService - Service for campaign business logic
   */
  constructor(private campaignService: CampaignService) {}

  /**
   * Gets all campaigns with optional filtering
   * 
   * Retrieves campaigns based on query parameters such as status, tenant ID,
   * and pagination settings. Supports filtering and sorting.
   * 
   * @async
   * @function getAllCampaigns
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   * @returns {Promise<void>}
   * @throws {AppError} If retrieval fails
   * 
   * @example
   * GET /api/campaigns?status=active&page=1&limit=10
   */
  getAllCampaigns = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { tenantId, status, page = 1, limit = 10 } = req.query;
      
      const filters = {
        tenantId: tenantId as string,
        status: status as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };
      
      const campaigns = await this.campaignService.getCampaigns(filters);
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: campaigns,
        pagination: {
          page: filters.page,
          limit: filters.limit,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Gets a single campaign by ID
   * 
   * Retrieves detailed information about a specific campaign.
   * Validates that the campaign exists and user has access.
   * 
   * @async
   * @function getCampaignById
   * @param {Request} req - Express request object with campaign ID in params
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   * @returns {Promise<void>}
   * @throws {AppError} If campaign not found or access denied
   * 
   * @example
   * GET /api/campaigns/:id
   */
  getCampaignById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const campaign = await this.campaignService.getCampaignById(id);
      
      if (!campaign) {
        throw new AppError('Campaign not found', StatusCodes.NOT_FOUND);
      }
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: campaign,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Creates a new campaign
   * 
   * Validates campaign data and creates a new campaign in the database.
   * Associates the campaign with the current tenant and user.
   * 
   * @async
   * @function createCampaign
   * @param {Request} req - Express request object with campaign data in body
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   * @returns {Promise<void>}
   * @throws {AppError} If validation fails or creation fails
   * 
   * @example
   * POST /api/campaigns
   * Body: { name: "Summer Sale", status: "draft", budget: 10000 }
   */
  createCampaign = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const campaignData = req.body;
      const userId = req.user?.id;
      const tenantId = req.tenant?.id;
      
      if (!userId || !tenantId) {
        throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED);
      }
      
      const campaign = await this.campaignService.createCampaign({
        ...campaignData,
        userId,
        tenantId,
      });
      
      res.status(StatusCodes.CREATED).json({
        success: true,
        data: campaign,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Updates an existing campaign
   * 
   * Partially updates a campaign with provided data.
   * Validates permissions and data integrity before updating.
   * 
   * @async
   * @function updateCampaign
   * @param {Request} req - Express request object with campaign ID and update data
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   * @returns {Promise<void>}
   * @throws {AppError} If campaign not found or update fails
   * 
   * @example
   * PATCH /api/campaigns/:id
   * Body: { status: "active", budget: 15000 }
   */
  updateCampaign = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const campaign = await this.campaignService.updateCampaign(id, updates);
      
      if (!campaign) {
        throw new AppError('Campaign not found', StatusCodes.NOT_FOUND);
      }
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: campaign,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Deletes a campaign
   * 
   * Soft deletes a campaign by marking it as deleted.
   * Validates permissions before deletion.
   * 
   * @async
   * @function deleteCampaign
   * @param {Request} req - Express request object with campaign ID
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   * @returns {Promise<void>}
   * @throws {AppError} If campaign not found or deletion fails
   * 
   * @example
   * DELETE /api/campaigns/:id
   */
  deleteCampaign = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      
      await this.campaignService.deleteCampaign(id);
      
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Gets campaign analytics
   * 
   * Retrieves analytics data for a specific campaign including metrics,
   * performance indicators, and trend analysis.
   * 
   * @async
   * @function getCampaignAnalytics
   * @param {Request} req - Express request object with campaign ID and date range
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   * @returns {Promise<void>}
   * @throws {AppError} If campaign not found or analytics unavailable
   * 
   * @example
   * GET /api/campaigns/:id/analytics?startDate=2025-01-01&endDate=2025-01-31
   */
  getCampaignAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      
      const analytics = await this.campaignService.getCampaignAnalytics(
        id,
        startDate as string,
        endDate as string
      );
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  };
}
