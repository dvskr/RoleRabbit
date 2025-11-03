# Database Schema - Normalized Design for Scale

## Overview

This database schema is designed to handle **50+ million users** with proper normalization, indexing, and scalability considerations.

## Design Principles

1. **Separation of Concerns**: Authentication data separated from profile data
2. **Normalization**: Eliminates data redundancy, reduces storage
3. **Proper Indexing**: Optimized for query performance
4. **Scalability**: Designed for horizontal scaling with proper partitioning capabilities
5. **Data Integrity**: Foreign keys and cascading deletes ensure consistency

## Schema Structure

### Core Tables

#### 1. `users` - Authentication & Core User Data
- **Purpose**: Stores only authentication and core user identification
- **Size**: ~200 bytes per user
- **Indexes**: `email` (unique), `provider + providerId`
- **Key Fields**: `id`, `email`, `password`, `provider`, `twoFactorEnabled`

#### 2. `user_profiles` - User Profile (One-to-One)
- **Purpose**: Stores profile information (one profile per user)
- **Size**: ~2KB per profile
- **Indexes**: `userId` (unique foreign key)
- **Key Fields**: Basic info, professional summary, analytics
- **Relationship**: One-to-One with `users`

### Profile-Related Tables (One-to-Many)

#### 3. `work_experiences` - Work History
- **Relationship**: Many work experiences per profile
- **Indexes**: `profileId`, `company`
- **Expected**: 0-50 per user (average ~5)

#### 4. `education` - Education History
- **Relationship**: Many education entries per profile
- **Indexes**: `profileId`, `institution`
- **Expected**: 0-20 per user (average ~3)

#### 5. `certifications` - Professional Certifications
- **Relationship**: Many certifications per profile
- **Indexes**: `profileId`, `issuer`
- **Expected**: 0-30 per user (average ~5)

#### 6. `projects` - Portfolio Projects
- **Relationship**: Many projects per profile
- **Indexes**: `profileId`
- **Expected**: 0-50 per user (average ~10)

#### 7. `achievements` - Achievements & Awards
- **Relationship**: Many achievements per profile
- **Indexes**: `profileId`, `type`
- **Expected**: 0-30 per user (average ~5)

#### 8. `volunteer_experiences` - Volunteer Work
- **Relationship**: Many volunteer experiences per profile
- **Indexes**: `profileId`
- **Expected**: 0-20 per user (average ~2)

#### 9. `recommendations` - Recommendations/Testimonials
- **Relationship**: Many recommendations per profile
- **Indexes**: `profileId`
- **Expected**: 0-10 per user (average ~3)

#### 10. `publications` - Publications
- **Relationship**: Many publications per profile
- **Indexes**: `profileId`
- **Expected**: 0-50 per user (average ~5)

#### 11. `patents` - Patents
- **Relationship**: Many patents per profile
- **Indexes**: `profileId`
- **Expected**: 0-20 per user (average ~1)

#### 12. `organizations` - Organizations/Associations
- **Relationship**: Many organizations per profile
- **Indexes**: `profileId`
- **Expected**: 0-10 per user (average ~2)

#### 13. `test_scores` - Test Scores (GRE, GMAT, etc.)
- **Relationship**: Many test scores per profile
- **Indexes**: `profileId`
- **Expected**: 0-10 per user (average ~2)

#### 14. `career_goals` - Career Goals
- **Relationship**: Many career goals per profile
- **Indexes**: `profileId`, `category`
- **Expected**: 0-20 per user (average ~5)

#### 15. `career_timeline` - Career Timeline Events
- **Relationship**: Many timeline events per profile
- **Indexes**: `profileId`
- **Expected**: 0-50 per user (average ~10)

#### 16. `social_links` - Social Media Links
- **Relationship**: Many social links per profile
- **Indexes**: `profileId`, unique `[profileId, platform]`
- **Expected**: 0-10 per user (average ~3)

### Many-to-Many Tables

#### 17. `skills` - Skills Master Table
- **Purpose**: Normalized skill names (shared across all users)
- **Size**: ~100 bytes per skill
- **Indexes**: `name` (unique), `category`
- **Expected**: 10,000-50,000 unique skills total
- **Benefits**: 
  - Prevents duplicate skill names
  - Enables skill search/discovery
  - Reduces storage (shared references)

#### 18. `user_skills` - User-Skill Junction Table
- **Purpose**: Links users to skills with proficiency levels
- **Relationship**: Many-to-Many between `user_profiles` and `skills`
- **Indexes**: `profileId`, `skillId`, unique `[profileId, skillId]`
- **Expected**: 0-100 skills per user (average ~20)
- **Key Fields**: `proficiency`, `yearsOfExperience`, `verified`

### Authentication Tables

#### 19. `refresh_tokens` - Refresh Tokens
- **Relationship**: Many tokens per user
- **Indexes**: `userId`, `token`, `expiresAt`
- **Expected**: 1-5 active tokens per user

#### 20. `sessions` - User Sessions
- **Relationship**: Many sessions per user
- **Indexes**: `userId`, `isActive`, `expiresAt`
- **Expected**: 1-10 active sessions per user

#### 21. `password_reset_tokens` - Password Reset Tokens
- **Relationship**: Many tokens per user (one-time use)
- **Indexes**: `userId`, `token`, `expiresAt`
- **Expected**: Very few (only during password reset)

## Storage Estimates (50M Users)

### Per User Average:
- `users`: 200 bytes
- `user_profiles`: 2 KB
- `work_experiences`: 5 × 500 bytes = 2.5 KB
- `education`: 3 × 300 bytes = 900 bytes
- `certifications`: 5 × 400 bytes = 2 KB
- `projects`: 10 × 600 bytes = 6 KB
- `achievements`: 5 × 300 bytes = 1.5 KB
- `user_skills`: 20 × 100 bytes = 2 KB
- Other tables: ~5 KB
- **Total per user**: ~22 KB

### Total Storage (50M users):
- **User data**: 50M × 22 KB = **1.1 TB**
- **Skills master table**: 50K × 100 bytes = **5 MB** (negligible)
- **Indexes overhead**: ~30% = **330 GB**
- **Total**: ~**1.4 TB** (manageable)

## Query Performance Optimizations

### Indexes Strategy:
1. **Foreign Keys**: All `profileId` fields indexed for JOIN performance
2. **Frequently Queried**: `company`, `institution`, `issuer`, `skill.name`
3. **Unique Constraints**: Prevent duplicates (`profileId + platform`, `profileId + skillId`)
4. **Composite Indexes**: `[profileId, category]` for filtered queries

### Query Patterns:
- **Get User Profile**: Single JOIN (`users` → `user_profiles`)
- **Get Work Experience**: JOIN on `profileId` (indexed)
- **Get Skills**: JOIN through `user_skills` junction table
- **Search by Skill**: Query `skills` → `user_skills` → `user_profiles`

## Migration Strategy

### Phase 1: Create New Schema
1. Create new normalized tables
2. Keep old `users` table temporarily

### Phase 2: Data Migration
1. Copy authentication data to `users` (no change)
2. Create `user_profiles` from `users` profile fields
3. Migrate JSON arrays to respective tables:
   - `workExperiences` → `work_experiences`
   - `skills` → `skills` + `user_skills`
   - `education` → `education`
   - etc.

### Phase 3: Update Application
1. Update Prisma schema
2. Update API routes to use new schema
3. Update frontend to work with new structure

### Phase 4: Cleanup
1. Remove old JSON fields from `users` table
2. Drop temporary migration tables

## Benefits of This Design

### 1. **Scalability**
- Can partition by `userId` for horizontal scaling
- Each table can be scaled independently
- Proper indexes support fast queries at scale

### 2. **Performance**
- Narrow tables = faster queries
- Indexes optimize common access patterns
- No JSON parsing overhead

### 3. **Data Integrity**
- Foreign keys ensure referential integrity
- Cascading deletes prevent orphaned data
- Unique constraints prevent duplicates

### 4. **Maintainability**
- Clear separation of concerns
- Easy to add new profile sections
- Type-safe with Prisma

### 5. **Flexibility**
- Easy to add new fields
- Can query specific sections independently
- Supports complex filtering and search

## Comparison: Single Table vs Normalized

| Aspect | Single Table | Normalized (This Design) |
|--------|-------------|-------------------------|
| **Storage** | ~50 KB/user | ~22 KB/user (56% reduction) |
| **Query Speed** | Slower (wide table) | Faster (narrow tables + indexes) |
| **Scalability** | Limited | Excellent (partitionable) |
| **Maintenance** | Harder (many columns) | Easier (focused tables) |
| **Data Integrity** | Weaker | Strong (FK constraints) |
| **Flexibility** | Limited | High (easy to extend) |

## Next Steps

1. **Run Migration**: `npx prisma migrate dev --name normalize_schema`
2. **Update API Routes**: Modify to use new normalized schema
3. **Update Frontend**: Adapt to new data structure
4. **Performance Testing**: Test with large datasets
5. **Monitor**: Track query performance and optimize indexes

