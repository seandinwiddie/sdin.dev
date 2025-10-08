/**
 * @fileoverview Authentication Middleware
 * 
 * Express middleware for JWT authentication and authorization.
 * Validates tokens and attaches user information to requests.
 * 
 * @module middleware/auth
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError';
import { StatusCodes } from 'http-status-codes';

/**
 * JWT payload interface
 * 
 * @interface JWTPayload
 * @property {string} userId - User ID from token
 * @property {string} email - User email
 * @property {string} role - User role
 * @property {string} tenantId - Tenant ID
 */
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
}

/**
 * Extended Request interface with user data
 * 
 * @interface AuthRequest
 * @extends {Request}
 * @property {JWTPayload} [user] - Authenticated user data
 * @property {Object} [tenant] - Current tenant data
 */
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      tenant?: any;
    }
  }
}

/**
 * Authenticates requests using JWT token
 * 
 * Middleware that validates JWT token from Authorization header.
 * Attaches user information to request object if valid.
 * 
 * @async
 * @function authenticate
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 * @throws {AppError} If token is missing or invalid
 * 
 * @example
 * router.get('/protected', authenticate, (req, res) => {
 *   // req.user is available here
 *   res.json({ userId: req.user.userId });
 * });
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', StatusCodes.UNAUTHORIZED);
    }
    
    const token = authHeader.substring(7);
    
    // Verify and decode token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    ) as JWTPayload;
    
    // Attach user to request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', StatusCodes.UNAUTHORIZED));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired', StatusCodes.UNAUTHORIZED));
    } else {
      next(error);
    }
  }
};

/**
 * Authorizes requests based on user role
 * 
 * Middleware factory that creates authorization middleware for specific roles.
 * Must be used after authenticate middleware.
 * 
 * @function authorize
 * @param {...string} allowedRoles - Roles allowed to access the route
 * @returns {Function} Express middleware function
 * @throws {AppError} If user doesn't have required role
 * 
 * @example
 * router.delete('/campaigns/:id',
 *   authenticate,
 *   authorize('admin', 'manager'),
 *   deleteCampaign
 * );
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new AppError('Authentication required', StatusCodes.UNAUTHORIZED)
      );
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError('Insufficient permissions', StatusCodes.FORBIDDEN)
      );
    }
    
    next();
  };
};

/**
 * Validates tenant access
 * 
 * Middleware that ensures user has access to the requested tenant.
 * Checks if tenant ID in request matches user's tenant.
 * 
 * @async
 * @function validateTenantAccess
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 * @throws {AppError} If tenant access is denied
 * 
 * @example
 * router.get('/tenants/:tenantId/campaigns',
 *   authenticate,
 *   validateTenantAccess,
 *   getCampaigns
 * );
 */
export const validateTenantAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const requestedTenantId = req.params.tenantId || req.query.tenantId;
    
    if (!requestedTenantId) {
      throw new AppError('Tenant ID required', StatusCodes.BAD_REQUEST);
    }
    
    if (!req.user) {
      throw new AppError('Authentication required', StatusCodes.UNAUTHORIZED);
    }
    
    // Check if user has access to this tenant
    if (req.user.tenantId !== requestedTenantId) {
      throw new AppError('Access denied to this tenant', StatusCodes.FORBIDDEN);
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware
 * 
 * Similar to authenticate but doesn't fail if no token provided.
 * Useful for routes that work with or without authentication.
 * 
 * @async
 * @function optionalAuth
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 * 
 * @example
 * router.get('/public/campaigns',
 *   optionalAuth,
 *   (req, res) => {
 *     // req.user may or may not be present
 *     const campaigns = req.user
 *       ? getPrivateCampaigns(req.user)
 *       : getPublicCampaigns();
 *   }
 * );
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'secret'
      ) as JWTPayload;
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Ignore errors and continue without user
    next();
  }
};

/**
 * Rate limiting middleware factory
 * 
 * Creates middleware that limits request rate per user/IP.
 * Uses in-memory store for demo (use Redis in production).
 * 
 * @function rateLimit
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} Express middleware function
 * @throws {AppError} If rate limit exceeded
 * 
 * @example
 * router.post('/api/campaigns',
 *   authenticate,
 *   rateLimit(100, 60000), // 100 requests per minute
 *   createCampaign
 * );
 */
export const rateLimit = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.user?.userId || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get request times for this key
    let requestTimes = requests.get(key) || [];
    
    // Filter to only recent requests
    requestTimes = requestTimes.filter(time => time > windowStart);
    
    if (requestTimes.length >= maxRequests) {
      return next(
        new AppError(
          'Too many requests, please try again later',
          StatusCodes.TOO_MANY_REQUESTS
        )
      );
    }
    
    // Add current request
    requestTimes.push(now);
    requests.set(key, requestTimes);
    
    next();
  };
};
