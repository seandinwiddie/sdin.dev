# JSDoc Documentation Guide for Marketing Platform

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [JSDoc Standards](#jsdoc-standards)
4. [Automated Documentation Script](#automated-documentation-script)
5. [Examples by Pattern](#examples-by-pattern)
6. [Best Practices](#best-practices)
7. [Generating Documentation](#generating-documentation)

## Overview

This guide provides comprehensive instructions for adding and maintaining JSDoc comments throughout the Marketing Platform codebase. JSDoc comments improve code readability, enable better IDE support, and can generate HTML documentation.

### Benefits of JSDoc

- **Better IDE Support**: Auto-completion, parameter hints, and type checking
- **Self-Documenting Code**: Clear understanding of function purposes and parameters
- **Generated Documentation**: Automatic HTML documentation generation
- **Type Safety**: Enhanced TypeScript integration
- **Team Collaboration**: Easier onboarding and code reviews

## Quick Start

### 1. Automated Approach

Use the included automation script to add JSDoc comments to your entire codebase:

```bash
# Dry run to see what would be changed
node add-jsdoc-comments.js /path/to/marketing-platform --dry-run --verbose

# Apply changes
node add-jsdoc-comments.js /path/to/marketing-platform

# Process specific directory
node add-jsdoc-comments.js /path/to/marketing-platform/frontend/src
```

### 2. Manual Approach

For individual files or custom documentation, refer to the examples and patterns below.

## JSDoc Standards

### File-Level Documentation

Every file should start with a `@fileoverview` comment:

```typescript
/**
 * @fileoverview Campaign Management Service
 * 
 * Contains business logic for campaign CRUD operations, validation,
 * and analytics calculations.
 * 
 * @module services/campaignService
 * @author Your Name
 * @version 1.0.0
 */
```

### Function Documentation

All functions should have JSDoc comments:

```typescript
/**
 * Calculates the return on investment for a campaign
 * 
 * @function calculateROI
 * @param {number} revenue - Total revenue generated
 * @param {number} cost - Total cost of campaign
 * @returns {number} ROI as a percentage
 * @throws {Error} If cost is zero
 * 
 * @example
 * const roi = calculateROI(15000, 10000); // Returns 50
 */
const calculateROI = (revenue: number, cost: number): number => {
  if (cost === 0) throw new Error('Cost cannot be zero');
  return ((revenue - cost) / cost) * 100;
};
```

### Interface Documentation

Document interfaces and types:

```typescript
/**
 * User profile information
 * 
 * @interface UserProfile
 * @property {string} id - Unique user identifier
 * @property {string} email - User email address
 * @property {string} firstName - User's first name
 * @property {string} lastName - User's last name
 * @property {UserRole} role - User's role in the system
 */
interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}
```

### React Component Documentation

Document React components with component-specific tags:

```typescript
/**
 * Campaign Card Component
 * 
 * Displays campaign information in a card format with metrics and actions.
 * 
 * @component
 * @param {CampaignCardProps} props - Component properties
 * @returns {JSX.Element} Rendered campaign card
 * 
 * @example
 * <CampaignCard 
 *   campaign={campaignData}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 */
export const CampaignCard: React.FC<CampaignCardProps> = ({ ... }) => {
  // Component implementation
};
```

### Class Documentation

Document classes and their methods:

```typescript
/**
 * Campaign Controller Class
 * 
 * Handles HTTP requests for campaign operations.
 * 
 * @class CampaignController
 */
export class CampaignController {
  /**
   * Creates an instance of CampaignController
   * 
   * @constructor
   * @param {CampaignService} campaignService - Campaign business logic service
   */
  constructor(private campaignService: CampaignService) {}

  /**
   * Retrieves all campaigns with filtering
   * 
   * @async
   * @method getAllCampaigns
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<void>}
   */
  async getAllCampaigns(req: Request, res: Response): Promise<void> {
    // Implementation
  }
}
```

## Automated Documentation Script

### Usage

The `add-jsdoc-comments.js` script automatically adds JSDoc comments to TypeScript and JavaScript files.

#### Command Line Options

```bash
node add-jsdoc-comments.js [directory] [options]
```

**Options:**
- `--dry-run` - Show what would be changed without modifying files
- `--verbose` - Show detailed logging

#### Features

- ✅ Detects functions, classes, interfaces, and React components
- ✅ Generates appropriate JSDoc comments based on code structure
- ✅ Skips files that already have documentation
- ✅ Excludes `node_modules`, `dist`, `build` directories
- ✅ Processes `.ts`, `.tsx`, `.js`, `.jsx` files

#### Example Output

```bash
🚀 JSDoc Comment Generator
==================================================
📁 Target directory: /marketing-platform
🔍 Processing extensions: .ts, .tsx, .js, .jsx
✍️  Modifying files
==================================================

Found 148 files to process

✅ frontend/src/components/UserProfile.tsx
✅ frontend/src/features/auth/authSlice.ts
✅ backend/src/controllers/campaignController.ts

==================================================
📊 Summary
==================================================
Files processed: 148
Files modified: 95
Functions documented: 234
Components documented: 45
Types documented: 78
==================================================
```

## Examples by Pattern

### Redux Slices

See: `frontend/src/features/auth/authSlice.example.ts`

Key points:
- Document the slice, reducers, async thunks, and selectors
- Include state shape documentation
- Document selector return types

### RTK Query APIs

See: `frontend/src/features/api/apiSlice.example.ts`

Key points:
- Document query and mutation endpoints
- Include parameter and return type documentation
- Document cache tags and invalidation

### Controllers

See: `backend/src/controllers/campaignController.example.ts`

Key points:
- Document HTTP method and route
- Include request/response documentation
- Document error cases

### Services

See: `backend/src/services/campaignService.example.ts`

Key points:
- Document business logic
- Include validation rules
- Document pure functions

### Utility Functions

See: `frontend/src/utils/formatters.example.ts`

Key points:
- Document pure functions
- Include multiple examples
- Show edge cases

### Type Definitions

See: `frontend/src/types/campaign.example.ts`

Key points:
- Document interfaces and types
- Include enum documentation
- Document type guards

### React Components

See: `frontend/src/components/UserProfile.tsx`

Key points:
- Use `@component` tag
- Document props interface
- Include usage examples

## Best Practices

### 1. Be Descriptive

❌ Bad:
```typescript
/** Gets campaigns */
const getCampaigns = () => { ... }
```

✅ Good:
```typescript
/**
 * Retrieves all campaigns for the current tenant with filtering and pagination
 * 
 * @function getCampaigns
 * @param {CampaignFilters} filters - Filter parameters for campaigns
 * @returns {Promise<Campaign[]>} Array of filtered campaigns
 */
const getCampaigns = (filters: CampaignFilters): Promise<Campaign[]> => { ... }
```

### 2. Include Examples

Always include `@example` tags for complex functions:

```typescript
/**
 * Formats a number as currency
 * 
 * @function formatCurrency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 * 
 * @example
 * formatCurrency(1234.56, 'USD') // "$1,234.56"
 * formatCurrency(1234.56, 'EUR') // "€1,234.56"
 */
```

### 3. Document Side Effects

Clearly document functions with side effects:

```typescript
/**
 * Logs out the current user
 * 
 * Clears authentication token from localStorage and redirects to login page.
 * 
 * @function logout
 * @returns {void}
 * @fires logoutUser - Dispatches Redux logout action
 * @sideeffect Clears localStorage
 * @sideeffect Redirects to /login
 */
```

### 4. Use Type Information

Leverage TypeScript types in JSDoc:

```typescript
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {('admin'|'user'|'viewer')} role
 */

/**
 * @param {User} user
 * @returns {boolean}
 */
```

### 5. Document Async Operations

Always mark async functions:

```typescript
/**
 * Fetches user data from API
 * 
 * @async
 * @function fetchUser
 * @param {string} userId - User ID to fetch
 * @returns {Promise<User>} User data
 * @throws {APIError} If user not found
 */
```

### 6. Functional Programming Emphasis

Highlight pure functions and immutability:

```typescript
/**
 * Calculates total revenue (pure function)
 * 
 * Does not mutate input array. Returns new calculated value.
 * 
 * @function calculateTotalRevenue
 * @pure
 * @param {Campaign[]} campaigns - Array of campaigns
 * @returns {number} Total revenue across all campaigns
 */
const calculateTotalRevenue = (campaigns: Campaign[]): number => {
  return campaigns.reduce((total, campaign) => total + campaign.metrics.revenue, 0);
};
```

## Generating Documentation

### Install JSDoc

```bash
npm install -g jsdoc
```

### Generate HTML Documentation

```bash
# Generate docs for entire project
jsdoc -c jsdoc.json -r

# Generate docs for specific directory
jsdoc frontend/src -r -d docs/frontend

# Generate with custom template
jsdoc -t node_modules/docdash -r
```

### JSDoc Configuration

Create `jsdoc.json`:

```json
{
  "source": {
    "include": ["frontend/src", "backend/src"],
    "exclude": ["node_modules", "dist", "build"]
  },
  "opts": {
    "destination": "./docs",
    "recurse": true,
    "readme": "./README.md"
  },
  "plugins": ["plugins/markdown"],
  "templates": {
    "cleverLinks": true,
    "monospaceLinks": true
  }
}
```

### Integration with Build Process

Add to `package.json`:

```json
{
  "scripts": {
    "docs": "jsdoc -c jsdoc.json",
    "docs:watch": "nodemon --watch src --exec npm run docs",
    "predeploy": "npm run docs"
  }
}
```

## Common Tags Reference

| Tag | Purpose | Example |
|-----|---------|---------|
| `@fileoverview` | File description | `@fileoverview User authentication utilities` |
| `@module` | Module name | `@module utils/auth` |
| `@function` | Function name | `@function validateEmail` |
| `@param` | Parameter | `@param {string} email - User email` |
| `@returns` | Return value | `@returns {boolean} True if valid` |
| `@throws` | Error thrown | `@throws {ValidationError} If email invalid` |
| `@example` | Usage example | `@example validateEmail('test@example.com')` |
| `@component` | React component | `@component` |
| `@interface` | Interface | `@interface UserProfile` |
| `@typedef` | Type definition | `@typedef {Object} Config` |
| `@property` | Object property | `@property {string} id - User ID` |
| `@async` | Async function | `@async` |
| `@pure` | Pure function | `@pure` |
| `@deprecated` | Deprecated code | `@deprecated Use newFunction instead` |
| `@see` | Related items | `@see {@link OtherFunction}` |
| `@since` | Version added | `@since 1.2.0` |
| `@author` | Code author | `@author Sean Dinwiddie` |

## Maintenance

### Regular Updates

- Update JSDoc when code changes
- Review during code reviews
- Run automated script periodically
- Keep examples up to date

### Documentation Coverage

Track documentation coverage:

```bash
# Check coverage
jsdoc --explain -r src > jsdoc-coverage.json

# Or use documentation linter
npm install -g documentation
documentation lint src/**/*.ts
```

## Support

For questions or improvements to this guide:
1. Review example files in this repository
2. Check JSDoc official documentation: https://jsdoc.app
3. Consult team documentation standards

---

**Last Updated**: October 8, 2025  
**Version**: 1.0.0
