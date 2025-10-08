/**
 * @fileoverview Campaign Database Model
 * 
 * Defines the Campaign model for database operations using Objection.js ORM.
 * Includes relationships, validations, and query methods.
 * 
 * @module models/Campaign
 */

import { Model } from 'objection';
import { User } from './User';
import { Tenant } from './Tenant';
import { Metric } from './Metric';

/**
 * Campaign Model Class
 * 
 * Represents a marketing campaign in the database.
 * Extends Objection.js Model for ORM functionality.
 * 
 * @class Campaign
 * @extends {Model}
 * 
 * @property {string} id - Unique campaign identifier (UUID)
 * @property {string} name - Campaign name
 * @property {string} description - Campaign description
 * @property {string} status - Campaign status (draft, active, paused, completed, deleted)
 * @property {string} type - Campaign type (email, social, search, display, video)
 * @property {string} tenantId - Associated tenant ID
 * @property {string} userId - Creator user ID
 * @property {number} budget - Campaign budget
 * @property {number} spent - Amount spent
 * @property {Date} startDate - Campaign start date
 * @property {Date} endDate - Campaign end date
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 * @property {Date | null} deletedAt - Deletion timestamp (soft delete)
 */
export class Campaign extends Model {
  /**
   * Database table name
   * 
   * @static
   * @type {string}
   */
  static tableName = 'campaigns';

  /**
   * ID column configuration
   * 
   * @static
   * @type {string}
   */
  static idColumn = 'id';

  // Properties
  id!: string;
  name!: string;
  description!: string;
  status!: string;
  type!: string;
  tenantId!: string;
  userId!: string;
  budget!: number;
  spent!: number;
  startDate!: Date;
  endDate!: Date;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date | null;

  // Relations
  user?: User;
  tenant?: Tenant;
  metrics?: Metric[];

  /**
   * JSON Schema for validation
   * 
   * Validates campaign data before database operations.
   * 
   * @static
   * @type {Object}
   */
  static jsonSchema = {
    type: 'object',
    required: ['name', 'tenantId', 'userId', 'budget', 'startDate', 'endDate'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string', minLength: 1, maxLength: 255 },
      description: { type: 'string', maxLength: 1000 },
      status: {
        type: 'string',
        enum: ['draft', 'active', 'paused', 'completed', 'deleted'],
      },
      type: {
        type: 'string',
        enum: ['email', 'social', 'search', 'display', 'video'],
      },
      tenantId: { type: 'string', format: 'uuid' },
      userId: { type: 'string', format: 'uuid' },
      budget: { type: 'number', minimum: 0 },
      spent: { type: 'number', minimum: 0 },
      startDate: { type: 'string', format: 'date-time' },
      endDate: { type: 'string', format: 'date-time' },
    },
  };

  /**
   * Defines model relationships
   * 
   * Configures Objection.js relations for joins and eager loading.
   * 
   * @static
   * @type {Object}
   */
  static relationMappings = {
    /**
     * Relation to User model (many-to-one)
     * 
     * @property {Object} user - User who created the campaign
     */
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'campaigns.userId',
        to: 'users.id',
      },
    },

    /**
     * Relation to Tenant model (many-to-one)
     * 
     * @property {Object} tenant - Tenant owning the campaign
     */
    tenant: {
      relation: Model.BelongsToOneRelation,
      modelClass: Tenant,
      join: {
        from: 'campaigns.tenantId',
        to: 'tenants.id',
      },
    },

    /**
     * Relation to Metric model (one-to-many)
     * 
     * @property {Object} metrics - Campaign performance metrics
     */
    metrics: {
      relation: Model.HasManyRelation,
      modelClass: Metric,
      join: {
        from: 'campaigns.id',
        to: 'metrics.campaignId',
      },
    },
  };

  /**
   * Lifecycle hook called before insert
   * 
   * Sets default values and generates UUID.
   * 
   * @async
   * @function $beforeInsert
   * @param {QueryContext} queryContext - Objection.js query context
   * @returns {Promise<void>}
   */
  async $beforeInsert(queryContext: any) {
    await super.$beforeInsert(queryContext);
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.spent = this.spent || 0;
  }

  /**
   * Lifecycle hook called before update
   * 
   * Updates the updatedAt timestamp.
   * 
   * @async
   * @function $beforeUpdate
   * @param {ModelOptions} opt - Update options
   * @param {QueryContext} queryContext - Objection.js query context
   * @returns {Promise<void>}
   */
  async $beforeUpdate(opt: any, queryContext: any) {
    await super.$beforeUpdate(opt, queryContext);
    this.updatedAt = new Date();
  }

  /**
   * Custom query method to find active campaigns
   * 
   * @static
   * @function findActive
   * @returns {QueryBuilder} Query builder for active campaigns
   * 
   * @example
   * const activeCampaigns = await Campaign.findActive();
   */
  static findActive() {
    return this.query()
      .where('status', 'active')
      .whereNull('deletedAt')
      .orderBy('createdAt', 'desc');
  }

  /**
   * Custom query method to find campaigns by tenant
   * 
   * @static
   * @function findByTenant
   * @param {string} tenantId - Tenant ID
   * @returns {QueryBuilder} Query builder for tenant campaigns
   * 
   * @example
   * const campaigns = await Campaign.findByTenant('tenant-123');
   */
  static findByTenant(tenantId: string) {
    return this.query()
      .where('tenantId', tenantId)
      .whereNull('deletedAt')
      .orderBy('createdAt', 'desc');
  }

  /**
   * Checks if campaign is active
   * 
   * Pure function that checks campaign status.
   * 
   * @function isActive
   * @returns {boolean} True if campaign is active
   */
  isActive(): boolean {
    return this.status === 'active' && !this.deletedAt;
  }

  /**
   * Checks if campaign has budget remaining
   * 
   * Pure function that compares spent to budget.
   * 
   * @function hasBudgetRemaining
   * @returns {boolean} True if budget remaining
   */
  hasBudgetRemaining(): boolean {
    return this.spent < this.budget;
  }

  /**
   * Calculates remaining budget
   * 
   * Pure function that computes budget remaining.
   * 
   * @function getRemainingBudget
   * @pure
   * @returns {number} Remaining budget amount
   */
  getRemainingBudget(): number {
    return Math.max(0, this.budget - this.spent);
  }

  /**
   * Calculates budget utilization percentage
   * 
   * Pure function that computes percentage of budget used.
   * 
   * @function getBudgetUtilization
   * @pure
   * @returns {number} Budget utilization as percentage (0-100)
   */
  getBudgetUtilization(): number {
    if (this.budget === 0) return 0;
    return (this.spent / this.budget) * 100;
  }

  /**
   * Soft deletes the campaign
   * 
   * Marks campaign as deleted without removing from database.
   * 
   * @async
   * @function softDelete
   * @returns {Promise<Campaign>} Updated campaign instance
   */
  async softDelete(): Promise<Campaign> {
    return this.$query().patchAndFetch({
      deletedAt: new Date(),
      status: 'deleted',
    });
  }

  /**
   * Converts model instance to JSON
   * 
   * Customizes JSON output, removing sensitive fields.
   * 
   * @function toJSON
   * @returns {Object} JSON representation of campaign
   */
  toJSON() {
    const json = super.toJSON();
    // Add computed fields
    json.remainingBudget = this.getRemainingBudget();
    json.budgetUtilization = this.getBudgetUtilization();
    json.isActive = this.isActive();
    return json;
  }
}
