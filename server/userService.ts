import { 
  userFavorites, 
  userSavedSearches, 
  userActivityLog, 
  userRecentlyViewed,
  type UserFavorite,
  type UserSavedSearch,
  type UserActivityLog,
  type UserRecentlyViewed,
  type InsertUserFavorite,
  type InsertUserSavedSearch,
  type InsertUserActivityLog,
  type InsertUserRecentlyViewed
} from '@shared/schema';
import { db } from './db';
import { eq, desc, and, sql } from 'drizzle-orm';

export class UserService {
  // Favorites Management
  static async addFavorite(userId: number, entityType: string, entityId: number, entityName: string): Promise<UserFavorite> {
    // Check if already favorited
    const existing = await db
      .select()
      .from(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.entityType, entityType),
          eq(userFavorites.entityId, entityId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const [favorite] = await db
      .insert(userFavorites)
      .values({
        userId,
        entityType,
        entityId,
        entityName,
      })
      .returning();

    return favorite;
  }

  static async removeFavorite(userId: number, entityType: string, entityId: number): Promise<boolean> {
    const result = await db
      .delete(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.entityType, entityType),
          eq(userFavorites.entityId, entityId)
        )
      );

    return (result.changes ?? 0) > 0;
  }

  static async getUserFavorites(userId: number, entityType?: string): Promise<UserFavorite[]> {
    let whereConditions = [eq(userFavorites.userId, userId)];
    
    if (entityType) {
      whereConditions.push(eq(userFavorites.entityType, entityType));
    }

    return await db
      .select()
      .from(userFavorites)
      .where(and(...whereConditions))
      .orderBy(desc(userFavorites.createdAt))
      .execute();
  }

  static async isFavorited(userId: number, entityType: string, entityId: number): Promise<boolean> {
    const result = await db
      .select({ id: userFavorites.id })
      .from(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.entityType, entityType),
          eq(userFavorites.entityId, entityId)
        )
      )
      .limit(1);

    return result.length > 0;
  }

  // Saved Searches Management
  static async saveSearch(userId: number, searchQuery: string, searchType: string, resultCount: number): Promise<UserSavedSearch> {
    // Check if search already saved
    const existing = await db
      .select()
      .from(userSavedSearches)
      .where(
        and(
          eq(userSavedSearches.userId, userId),
          eq(userSavedSearches.searchQuery, searchQuery),
          eq(userSavedSearches.searchType, searchType)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update result count and timestamp
      const [updated] = await db
        .update(userSavedSearches)
        .set({
          resultCount,
          createdAt: new Date(),
        })
        .where(eq(userSavedSearches.id, existing[0].id))
        .returning();
      
      return updated;
    }

    const [savedSearch] = await db
      .insert(userSavedSearches)
      .values({
        userId,
        searchQuery,
        searchType,
        resultCount,
      })
      .returning();

    return savedSearch;
  }

  static async getUserSavedSearches(userId: number): Promise<UserSavedSearch[]> {
    return await db
      .select()
      .from(userSavedSearches)
      .where(eq(userSavedSearches.userId, userId))
      .orderBy(desc(userSavedSearches.createdAt))
      .execute();
  }

  static async removeSavedSearch(userId: number, searchId: number): Promise<boolean> {
    const result = await db
      .delete(userSavedSearches)
      .where(
        and(
          eq(userSavedSearches.userId, userId),
          eq(userSavedSearches.id, searchId)
        )
      );

    return (result.changes ?? 0) > 0;
  }

  // Activity Logging
  static async logActivity(activityData: InsertUserActivityLog): Promise<UserActivityLog> {
    const [activity] = await db
      .insert(userActivityLog)
      .values(activityData)
      .returning();

    return activity;
  }

  static async getUserActivity(userId: number, limit = 50): Promise<UserActivityLog[]> {
    return await db
      .select()
      .from(userActivityLog)
      .where(eq(userActivityLog.userId, userId))
      .orderBy(desc(userActivityLog.createdAt))
      .limit(limit)
      .execute();
  }

  // Recently Viewed Management
  static async addRecentlyViewed(
    userId: number | null, 
    sessionId: string, 
    entityType: string, 
    entityId: number, 
    entityName: string
  ): Promise<UserRecentlyViewed> {
    // Remove existing entry for same entity to avoid duplicates
    if (userId) {
      await db
        .delete(userRecentlyViewed)
        .where(
          and(
            eq(userRecentlyViewed.userId, userId),
            eq(userRecentlyViewed.entityType, entityType),
            eq(userRecentlyViewed.entityId, entityId)
          )
        );
    } else {
      await db
        .delete(userRecentlyViewed)
        .where(
          and(
            eq(userRecentlyViewed.sessionId, sessionId),
            eq(userRecentlyViewed.entityType, entityType),
            eq(userRecentlyViewed.entityId, entityId)
          )
        );
    }

    const [recentItem] = await db
      .insert(userRecentlyViewed)
      .values({
        userId,
        sessionId,
        entityType,
        entityId,
        entityName,
      })
      .returning();

    // Keep only last 20 items per user/session
    if (userId) {
      await db.execute(sql`
        DELETE FROM user_recently_viewed 
        WHERE user_id = ${userId} 
        AND id NOT IN (
          SELECT id FROM user_recently_viewed 
          WHERE user_id = ${userId} 
          ORDER BY viewed_at DESC 
          LIMIT 20
        )
      `);
    } else {
      await db.execute(sql`
        DELETE FROM user_recently_viewed 
        WHERE session_id = ${sessionId} 
        AND id NOT IN (
          SELECT id FROM user_recently_viewed 
          WHERE session_id = ${sessionId} 
          ORDER BY viewed_at DESC 
          LIMIT 20
        )
      `);
    }

    return recentItem;
  }

  static async getRecentlyViewed(userId: number | null, sessionId: string, limit = 10): Promise<UserRecentlyViewed[]> {
    if (userId) {
      return await db
        .select()
        .from(userRecentlyViewed)
        .where(eq(userRecentlyViewed.userId, userId))
        .orderBy(desc(userRecentlyViewed.viewedAt))
        .limit(limit)
        .execute();
    } else {
      return await db
        .select()
        .from(userRecentlyViewed)
        .where(eq(userRecentlyViewed.sessionId, sessionId))
        .orderBy(desc(userRecentlyViewed.viewedAt))
        .limit(limit)
        .execute();
    }
  }

  // User Statistics
  static async getUserStats(userId: number) {
    const [favoritesCount] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(userFavorites)
      .where(eq(userFavorites.userId, userId));

    const [savedSearchesCount] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(userSavedSearches)
      .where(eq(userSavedSearches.userId, userId));

    const [activityCount] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(userActivityLog)
      .where(eq(userActivityLog.userId, userId));

    return {
      favoritesCount: favoritesCount.count,
      savedSearchesCount: savedSearchesCount.count,
      activityCount: activityCount.count,
    };
  }
}