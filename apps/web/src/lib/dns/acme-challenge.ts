/**
 * ACME DNS-01 Challenge Handler (Section 4.3)
 *
 * Handles Let's Encrypt DNS-01 challenges for SSL certificate provisioning
 */

import { dnsService, DNSRecordResult } from './dns-service';

/**
 * ACME challenge result
 */
export interface ACMEChallengeResult {
  domain: string;
  recordName: string;
  recordValue: string;
  recordId: string;
}

/**
 * ACME challenge handler for DNS-01 validation
 */
export class ACMEChallengeHandler {
  /**
   * Create DNS-01 challenge record
   *
   * @param domain - Domain to verify (e.g., 'johndoe.rolerabbit.com')
   * @param token - Challenge token from ACME provider
   * @returns Challenge result with record details
   *
   * @example
   * const result = await acme.createChallenge('johndoe.rolerabbit.com', 'challenge-token');
   * // Wait for DNS propagation...
   * await acme.verifyChallenge(result);
   */
  async createChallenge(domain: string, token: string): Promise<ACMEChallengeResult> {
    // ACME DNS-01 challenge requires _acme-challenge subdomain
    const recordName = this.getChallengeDomain(domain);

    const record = await dnsService.createRecord({
      type: 'TXT',
      name: recordName,
      value: token,
      ttl: 60, // Short TTL for faster propagation
    });

    return {
      domain,
      recordName,
      recordValue: token,
      recordId: record.id,
    };
  }

  /**
   * Get ACME challenge domain name
   */
  private getChallengeDomain(domain: string): string {
    // Extract subdomain if it's a full domain
    const baseDomain = process.env.BASE_DOMAIN || 'rolerabbit.com';

    if (domain.endsWith(`.${baseDomain}`)) {
      // Extract subdomain (e.g., 'johndoe' from 'johndoe.rolerabbit.com')
      const subdomain = domain.replace(`.${baseDomain}`, '');
      return `_acme-challenge.${subdomain}`;
    }

    // If it's just the subdomain
    return `_acme-challenge.${domain}`;
  }

  /**
   * Verify DNS-01 challenge record exists
   *
   * @param challenge - Challenge result from createChallenge
   * @returns True if record exists and matches expected value
   */
  async verifyChallenge(challenge: ACMEChallengeResult): Promise<boolean> {
    const record = await dnsService.getRecord(challenge.recordName, 'TXT');
    return record !== null && record.value === challenge.recordValue;
  }

  /**
   * Wait for DNS propagation
   *
   * @param challenge - Challenge result from createChallenge
   * @param maxWaitTime - Maximum wait time in milliseconds (default: 5 minutes)
   * @param pollInterval - Polling interval in milliseconds (default: 10 seconds)
   * @returns True if DNS propagated successfully
   */
  async waitForPropagation(
    challenge: ACMEChallengeResult,
    maxWaitTime: number = 300000,
    pollInterval: number = 10000
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const verified = await this.verifyChallenge(challenge);

      if (verified) {
        // Additional check: query public DNS to ensure propagation
        const publicVerified = await this.verifyPublicDNS(
          challenge.recordName,
          challenge.recordValue
        );

        if (publicVerified) {
          return true;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    return false;
  }

  /**
   * Verify DNS record via public DNS resolver
   * This ensures the record has propagated beyond the authoritative nameserver
   */
  private async verifyPublicDNS(recordName: string, expectedValue: string): Promise<boolean> {
    try {
      const baseDomain = process.env.BASE_DOMAIN || 'rolerabbit.com';
      const fullDomain = recordName.includes(baseDomain)
        ? recordName
        : `${recordName}.${baseDomain}`;

      // Use Google's DNS-over-HTTPS API
      const response = await fetch(
        `https://dns.google/resolve?name=${fullDomain}&type=TXT`,
        {
          headers: {
            'Accept': 'application/dns-json',
          },
        }
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();

      // Check if TXT record exists with expected value
      if (data.Answer) {
        return data.Answer.some((answer: any) => {
          // TXT records are quoted in DNS responses
          const txtValue = answer.data.replace(/^"(.*)"$/, '$1');
          return txtValue === expectedValue;
        });
      }

      return false;
    } catch (error) {
      console.error('Public DNS verification error:', error);
      return false;
    }
  }

  /**
   * Remove DNS-01 challenge record
   *
   * @param challenge - Challenge result from createChallenge
   */
  async removeChallenge(challenge: ACMEChallengeResult): Promise<void> {
    await dnsService.deleteRecord(challenge.recordId);
  }

  /**
   * Complete ACME DNS-01 challenge workflow
   *
   * This method:
   * 1. Creates the DNS challenge record
   * 2. Waits for DNS propagation
   * 3. Returns the challenge for ACME validation
   * 4. Cleanup is caller's responsibility after ACME validation
   *
   * @param domain - Domain to verify
   * @param token - Challenge token from ACME provider
   * @returns Challenge result if successful, null if propagation failed
   */
  async setupChallenge(domain: string, token: string): Promise<ACMEChallengeResult | null> {
    // Create challenge record
    const challenge = await this.createChallenge(domain, token);

    // Wait for DNS propagation
    const propagated = await this.waitForPropagation(challenge);

    if (!propagated) {
      // Cleanup failed challenge
      try {
        await this.removeChallenge(challenge);
      } catch (error) {
        console.error('Failed to cleanup challenge record:', error);
      }
      return null;
    }

    return challenge;
  }

  /**
   * Batch create challenges for multiple domains
   * Useful for SAN certificates with multiple domains
   *
   * @param domains - Array of domain/token pairs
   * @returns Array of challenge results
   */
  async createBatchChallenges(
    domains: Array<{ domain: string; token: string }>
  ): Promise<ACMEChallengeResult[]> {
    const challenges: ACMEChallengeResult[] = [];

    for (const { domain, token } of domains) {
      const challenge = await this.createChallenge(domain, token);
      challenges.push(challenge);
    }

    return challenges;
  }

  /**
   * Wait for batch DNS propagation
   *
   * @param challenges - Array of challenges to verify
   * @param maxWaitTime - Maximum wait time in milliseconds
   * @returns True if all challenges propagated successfully
   */
  async waitForBatchPropagation(
    challenges: ACMEChallengeResult[],
    maxWaitTime: number = 300000
  ): Promise<boolean> {
    const startTime = Date.now();
    const pollInterval = 10000;

    while (Date.now() - startTime < maxWaitTime) {
      const verifications = await Promise.all(
        challenges.map((challenge) => this.verifyChallenge(challenge))
      );

      if (verifications.every((v) => v === true)) {
        // All challenges verified, do public DNS check
        const publicVerifications = await Promise.all(
          challenges.map((challenge) =>
            this.verifyPublicDNS(challenge.recordName, challenge.recordValue)
          )
        );

        if (publicVerifications.every((v) => v === true)) {
          return true;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    return false;
  }

  /**
   * Remove batch challenges
   *
   * @param challenges - Array of challenges to remove
   */
  async removeBatchChallenges(challenges: ACMEChallengeResult[]): Promise<void> {
    await Promise.all(challenges.map((challenge) => this.removeChallenge(challenge)));
  }
}

/**
 * Export singleton instance
 */
export const acmeChallenge = new ACMEChallengeHandler();
