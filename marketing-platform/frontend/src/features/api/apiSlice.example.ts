/**
 * @fileoverview RTK Query API Slice
 * 
 * Defines the base API configuration and endpoints using RTK Query.
 * Provides type-safe data fetching with automatic caching and refetching.
 * 
 * @module features/api/apiSlice
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';

/**
 * Tenant interface representing a multi-tenant organization
 * 
 * @interface Tenant
 * @property {string} id - Unique tenant identifier
 * @property {string} name - Tenant name
 * @property {string} slug - URL-friendly tenant identifier
 * @property {boolean} isActive - Whether the tenant is active
 */
interface Tenant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

/**
 * Campaign interface representing a marketing campaign
 * 
 * @interface Campaign
 * @property {string} id - Unique campaign identifier
 * @property {string} name - Campaign name
 * @property {string} status - Campaign status (draft, active, completed)
 * @property {Date} startDate - Campaign start date
 * @property {Date} endDate - Campaign end date
 * @property {number} budget - Campaign budget
 */
interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed';
  startDate: Date;
  endDate: Date;
  budget: number;
}

/**
 * Query parameters for fetching campaigns
 * 
 * @interface CampaignQueryParams
 * @property {string} [tenantId] - Filter by tenant ID
 * @property {string} [status] - Filter by status
 * @property {number} [page] - Page number for pagination
 * @property {number} [limit] - Items per page
 */
interface CampaignQueryParams {
  tenantId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

/**
 * Base query function with authentication
 * 
 * Configures the base query to include authentication token from Redux state
 * and sets the base URL for all API requests.
 * 
 * @constant {BaseQueryFn} baseQueryWithAuth
 */
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * RTK Query API slice
 * 
 * Defines all API endpoints for the application using RTK Query.
 * Provides automatic caching, refetching, and optimistic updates.
 * 
 * @constant {Api} apiSlice
 */
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Tenant', 'Campaign', 'User'],
  endpoints: (builder) => ({
    /**
     * Fetches all tenants for the current user
     * 
     * @function getTenants
     * @param {Object} params - Query parameters (currently unused)
     * @returns {Promise<Tenant[]>} Array of tenant objects
     */
    getTenants: builder.query<Tenant[], {}>({
      query: () => '/tenants',
      providesTags: ['Tenant'],
    }),
    
    /**
     * Fetches a single tenant by ID
     * 
     * @function getTenant
     * @param {string} id - Tenant ID
     * @returns {Promise<Tenant>} Tenant object
     */
    getTenant: builder.query<Tenant, string>({
      query: (id) => `/tenants/${id}`,
      providesTags: (result, error, id) => [{ type: 'Tenant', id }],
    }),
    
    /**
     * Fetches campaigns with optional filtering
     * 
     * @function getCampaigns
     * @param {CampaignQueryParams} params - Query parameters for filtering
     * @returns {Promise<Campaign[]>} Array of campaign objects
     */
    getCampaigns: builder.query<Campaign[], CampaignQueryParams>({
      query: (params) => ({
        url: '/campaigns',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Campaign' as const, id })),
              { type: 'Campaign', id: 'LIST' },
            ]
          : [{ type: 'Campaign', id: 'LIST' }],
    }),
    
    /**
     * Creates a new campaign
     * 
     * @function createCampaign
     * @param {Partial<Campaign>} campaign - Campaign data
     * @returns {Promise<Campaign>} Created campaign object
     */
    createCampaign: builder.mutation<Campaign, Partial<Campaign>>({
      query: (campaign) => ({
        url: '/campaigns',
        method: 'POST',
        body: campaign,
      }),
      invalidatesTags: [{ type: 'Campaign', id: 'LIST' }],
    }),
    
    /**
     * Updates an existing campaign
     * 
     * @function updateCampaign
     * @param {Object} params - Update parameters
     * @param {string} params.id - Campaign ID
     * @param {Partial<Campaign>} params.updates - Campaign updates
     * @returns {Promise<Campaign>} Updated campaign object
     */
    updateCampaign: builder.mutation<Campaign, { id: string; updates: Partial<Campaign> }>({
      query: ({ id, updates }) => ({
        url: `/campaigns/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Campaign', id }],
    }),
    
    /**
     * Deletes a campaign
     * 
     * @function deleteCampaign
     * @param {string} id - Campaign ID to delete
     * @returns {Promise<void>}
     */
    deleteCampaign: builder.mutation<void, string>({
      query: (id) => ({
        url: `/campaigns/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Campaign', id },
        { type: 'Campaign', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetTenantsQuery,
  useGetTenantQuery,
  useGetCampaignsQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
} = apiSlice;

export default apiSlice.reducer;
