import { statisticsAPI } from '../api';

// Mock fetch
global.fetch = jest.fn();

describe('Statistics API', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getManagerStats', () => {
    it('should fetch manager statistics', async () => {
      const mockStats = {
        users: { total: 10, active: 8, pendingModeration: 2 },
        revenue: { total: 50000, formatted: '50 000 ₽' },
        products: { total: 15, pendingModeration: 2 },
        campaigns: { active: 3 },
        deals: { total: 20, completed: 18 },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStats,
      });

      const result = await statisticsAPI.getManagerStats();

      expect(global.fetch).toHaveBeenCalledWith('/api/statistics/manager', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      expect(result).toEqual(mockStats);
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      await expect(statisticsAPI.getManagerStats()).rejects.toThrow('API Error');
    });
  });

  describe('getUsersStats', () => {
    it('should fetch users statistics', async () => {
      const mockUsersStats = {
        byRole: [
          { role: 'BUYER', count: 5 },
          { role: 'SELLER', count: 3 },
        ],
        recent: [],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUsersStats,
      });

      const result = await statisticsAPI.getUsersStats();

      expect(global.fetch).toHaveBeenCalledWith('/api/statistics/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      expect(result).toEqual(mockUsersStats);
    });
  });

  describe('getRevenueStats', () => {
    it('should fetch revenue statistics', async () => {
      const mockRevenueStats = {
        monthly: [],
        total: 50000,
        formatted: '50 000 ₽',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockRevenueStats,
      });

      const result = await statisticsAPI.getRevenueStats();

      expect(global.fetch).toHaveBeenCalledWith('/api/statistics/revenue', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      expect(result).toEqual(mockRevenueStats);
    });
  });

  describe('getRecentActivities', () => {
    it('should fetch recent activities', async () => {
      const mockActivities = [
        {
          id: '1',
          type: 'user_registration',
          message: 'New user registered',
          time: '2 minutes ago',
          status: 'new',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockActivities,
      });

      const result = await statisticsAPI.getRecentActivities();

      expect(global.fetch).toHaveBeenCalledWith('/api/statistics/activities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      expect(result).toEqual(mockActivities);
    });
  });
});

