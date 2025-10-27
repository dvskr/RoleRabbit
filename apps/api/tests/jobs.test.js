/**
 * Tests for Jobs API utilities
 */

const { PrismaClient } = require('@prisma/client');
const { getJobsByUserId, createJob, updateJob, deleteJob } = require('../utils/jobs');

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
}));

describe('Jobs API', () => {
  let prisma;
  let mockPrismaClient;

  beforeEach(() => {
    mockPrismaClient = {
      job: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    
    prisma = new PrismaClient();
    prisma.job = mockPrismaClient.job;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getJobsByUserId', () => {
    it('should fetch jobs for a user', async () => {
      const mockJobs = [
        { id: '1', userId: 'user1', title: 'Test Job 1' },
        { id: '2', userId: 'user1', title: 'Test Job 2' },
      ];

      mockPrismaClient.job.findMany.mockResolvedValue(mockJobs);

      const result = await getJobsByUserId('user1');

      expect(result).toEqual(mockJobs);
      expect(mockPrismaClient.job.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        orderBy: { appliedDate: 'desc' },
      });
    });

    it('should return empty array if no jobs found', async () => {
      mockPrismaClient.job.findMany.mockResolvedValue([]);

      const result = await getJobsByUserId('user1');

      expect(result).toEqual([]);
    });
  });

  describe('createJob', () => {
    it('should create a new job', async () => {
      const jobData = {
        title: 'Software Engineer',
        company: 'Tech Corp',
        status: 'applied',
        position: 'Senior',
        location: 'Remote',
        salaryRange: '$100k-$150k',
        notes: 'Great opportunity',
        source: 'linkedin',
      };

      const mockJob = { id: '1', userId: 'user1', ...jobData };
      mockPrismaClient.job.create.mockResolvedValue(mockJob);

      const result = await createJob('user1', jobData);

      expect(result).toEqual(mockJob);
      expect(mockPrismaClient.job.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          title: jobData.title,
          company: jobData.company,
          status: jobData.status,
          position: jobData.position,
          location: jobData.location,
          salaryRange: jobData.salaryRange,
          notes: jobData.notes,
          source: jobData.source,
          appliedDate: expect.any(Date),
        },
      });
    });
  });

  describe('updateJob', () => {
    it('should update a job', async () => {
      const updates = { status: 'interview' };
      const mockJob = { id: '1', userId: 'user1', status: 'interview' };

      mockPrismaClient.job.update.mockResolvedValue(mockJob);

      const result = await updateJob('1', updates);

      expect(result).toEqual(mockJob);
      expect(mockPrismaClient.job.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'interview' },
      });
    });
  });

  describe('deleteJob', () => {
    it('should delete a job', async () => {
      mockPrismaClient.job.delete.mockResolvedValue({ id: '1' });

      await deleteJob('1');

      expect(mockPrismaClient.job.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});

