import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import ManagerPage from '../page';

// Mock the hooks and components
jest.mock('@/components/providers/telegram-data-provider', () => ({
  useTelegramData: () => ({
    userData: {
      id: '1',
      firstName: 'Test',
      lastName: 'User',
      role: 'MANAGER',
    },
    isLoading: false,
    isInTelegram: true,
  }),
}));

jest.mock('@/components/layouts/main-layout', () => {
  return function MockMainLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="main-layout">{children}</div>;
  };
});

// Mock fetch
global.fetch = jest.fn();

describe('ManagerPage', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders manager dashboard', () => {
    render(<ManagerPage />);
    
    expect(screen.getByText('Панель менеджера')).toBeInTheDocument();
    expect(screen.getByText('Управление платформой и пользователями')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<ManagerPage />);
    
    // Should show skeleton loaders
    expect(screen.getAllByTestId('skeleton-loader')).toHaveLength(3);
  });

  it('loads and displays statistics', async () => {
    const mockStats = {
      users: { total: 10, active: 8, pendingModeration: 2 },
      revenue: { total: 50000, formatted: '50 000 ₽' },
      products: { total: 15, pendingModeration: 2 },
      campaigns: { active: 3 },
      deals: { total: 20, completed: 18 },
    };

    const mockActivities = [
      {
        id: '1',
        type: 'user_registration',
        message: 'New user registered',
        time: '2 minutes ago',
        status: 'new',
      },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockActivities,
      });

    render(<ManagerPage />);

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument(); // Total users
      expect(screen.getByText('50 000 ₽')).toBeInTheDocument(); // Revenue
    });
  });

  it('handles API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<ManagerPage />);

    // Should still render the page even if API fails
    expect(screen.getByText('Панель менеджера')).toBeInTheDocument();
  });

  it('displays quick actions', () => {
    render(<ManagerPage />);
    
    expect(screen.getByText('Быстрые действия')).toBeInTheDocument();
    expect(screen.getByText('Модерация')).toBeInTheDocument();
    expect(screen.getByText('Пользователи')).toBeInTheDocument();
    expect(screen.getByText('Аналитика')).toBeInTheDocument();
  });

  it('displays recent activities section', () => {
    render(<ManagerPage />);
    
    expect(screen.getByText('Последние активности')).toBeInTheDocument();
  });
});

