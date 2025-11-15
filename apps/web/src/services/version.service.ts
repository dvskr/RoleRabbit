/**
 * Version Service
 * Section 2.11: Service Layer Implementation
 *
 * Requirements #21-23: VersionService class
 */

import { PortfolioNotFoundError, VersionNotFoundError } from '@/lib/errors';
import { Portfolio, PortfolioData, PortfolioService } from './portfolio.service';

/**
 * Portfolio version
 */
export interface PortfolioVersion {
  id: string;
  portfolioId: string;
  version: number;
  name: string | null;
  data: PortfolioData;
  metadata: {
    changeDescription?: string;
    tags?: string[];
    isAutoSave: boolean;
    dataSize: number;
  };
  createdBy: string;
  createdAt: string;
}

/**
 * Mock versions database
 */
const portfolioVersions: PortfolioVersion[] = [];

/**
 * Version Service
 * Requirement #21: Create VersionService class with 4 methods
 */
export class VersionService {
  private portfolioService: PortfolioService;

  constructor() {
    this.portfolioService = new PortfolioService();
  }

  /**
   * Requirement #22: Create version
   * - Snapshot current portfolio.data
   * - Auto-increment version number
   */
  async createVersion(
    portfolioId: string,
    userId: string,
    options?: {
      name?: string;
      description?: string;
      tags?: string[];
      isAutoSave?: boolean;
    }
  ): Promise<PortfolioVersion> {
    const portfolio = await this.portfolioService.findById(portfolioId);

    if (!portfolio) {
      throw new PortfolioNotFoundError(portfolioId);
    }

    // Requirement #22: Auto-increment version number
    const versionNumber = this.getNextVersionNumber(portfolioId);

    // Requirement #22: Snapshot current portfolio.data
    const dataSnapshot = JSON.parse(JSON.stringify(portfolio.data)); // Deep copy

    const version: PortfolioVersion = {
      id: `ver-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      portfolioId,
      version: versionNumber,
      name: options?.name || null,
      data: dataSnapshot,
      metadata: {
        changeDescription: options?.description,
        tags: options?.tags || [],
        isAutoSave: options?.isAutoSave || false,
        dataSize: this.calculateDataSize(dataSnapshot),
      },
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };

    // TODO: In production, save to database
    // await db.portfolioVersion.create({ data: version });

    portfolioVersions.push(version);

    return version;
  }

  /**
   * Requirement #23: Restore version
   * - Create backup version of current state
   * - Then overwrite with selected version
   */
  async restoreVersion(
    portfolioId: string,
    versionId: string,
    userId: string
  ): Promise<{ portfolio: Portfolio; backupVersion: PortfolioVersion }> {
    const portfolio = await this.portfolioService.findById(portfolioId);

    if (!portfolio) {
      throw new PortfolioNotFoundError(portfolioId);
    }

    // Find version to restore
    const versionToRestore = portfolioVersions.find((v) => v.id === versionId);

    if (!versionToRestore) {
      throw new VersionNotFoundError(versionId);
    }

    if (versionToRestore.portfolioId !== portfolioId) {
      throw new VersionNotFoundError(versionId);
    }

    // Requirement #23: Create backup version of current state before restore
    const backupVersion = await this.createVersion(portfolioId, userId, {
      name: `Before restore to v${versionToRestore.version}`,
      description: `Automatic backup before restoring to version ${versionToRestore.version}`,
      tags: ['auto-backup', 'pre-restore'],
      isAutoSave: true,
    });

    // Requirement #23: Overwrite portfolio data with selected version
    const restoredPortfolio = await this.portfolioService.update(
      portfolioId,
      userId,
      {
        data: versionToRestore.data,
      }
    );

    return {
      portfolio: restoredPortfolio,
      backupVersion,
    };
  }

  /**
   * List versions for portfolio
   */
  async listVersions(
    portfolioId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    versions: PortfolioVersion[];
    total: number;
  }> {
    // TODO: In production, query database with pagination
    // const [versions, total] = await Promise.all([
    //   db.portfolioVersion.findMany({
    //     where: { portfolioId },
    //     orderBy: { version: 'desc' },
    //     take: options?.limit || 20,
    //     skip: options?.offset || 0,
    //   }),
    //   db.portfolioVersion.count({ where: { portfolioId } }),
    // ]);

    const allVersions = portfolioVersions
      .filter((v) => v.portfolioId === portfolioId)
      .sort((a, b) => b.version - a.version);

    const limit = options?.limit || 20;
    const offset = options?.offset || 0;

    const versions = allVersions.slice(offset, offset + limit);

    return {
      versions,
      total: allVersions.length,
    };
  }

  /**
   * Get version by ID
   */
  async getVersion(versionId: string): Promise<PortfolioVersion | null> {
    // TODO: In production, query database
    // return await db.portfolioVersion.findUnique({
    //   where: { id: versionId },
    // });

    return portfolioVersions.find((v) => v.id === versionId) || null;
  }

  /**
   * Compare two versions
   */
  async compareVersions(
    versionId1: string,
    versionId2: string
  ): Promise<{
    version1: PortfolioVersion;
    version2: PortfolioVersion;
    diff: any;
  }> {
    const version1 = await this.getVersion(versionId1);
    const version2 = await this.getVersion(versionId2);

    if (!version1) {
      throw new VersionNotFoundError(versionId1);
    }

    if (!version2) {
      throw new VersionNotFoundError(versionId2);
    }

    // Calculate diff
    const diff = this.calculateDiff(version1.data, version2.data);

    return {
      version1,
      version2,
      diff,
    };
  }

  // ========================================================================
  // HELPER METHODS
  // ========================================================================

  /**
   * Get next version number
   * Requirement #22: Auto-increment version number
   */
  private getNextVersionNumber(portfolioId: string): number {
    const versions = portfolioVersions.filter(
      (v) => v.portfolioId === portfolioId
    );

    if (versions.length === 0) {
      return 1;
    }

    const maxVersion = Math.max(...versions.map((v) => v.version));
    return maxVersion + 1;
  }

  /**
   * Calculate data size
   */
  private calculateDataSize(data: PortfolioData): number {
    return Buffer.byteLength(JSON.stringify(data));
  }

  /**
   * Calculate diff between two data objects
   */
  private calculateDiff(data1: PortfolioData, data2: PortfolioData): any {
    // TODO: In production, use a proper diff library like jsondiffpatch
    // import { diff } from 'jsondiffpatch';
    // return diff(data1, data2);

    // Simple diff implementation
    const changes: any = {};

    for (const key of Object.keys(data1) as Array<keyof PortfolioData>) {
      if (JSON.stringify(data1[key]) !== JSON.stringify(data2[key])) {
        changes[key] = {
          old: data1[key],
          new: data2[key],
        };
      }
    }

    for (const key of Object.keys(data2) as Array<keyof PortfolioData>) {
      if (!(key in data1)) {
        changes[key] = {
          old: undefined,
          new: data2[key],
        };
      }
    }

    return changes;
  }
}
