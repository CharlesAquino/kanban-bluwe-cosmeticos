import React from 'react';
import { render, screen } from '@testing-library/react';
import { Dashboard, StatsCard } from '@/components/dashboard';

describe('Dashboard', () => {
  const mockStats = {
    total: 25,
    inProgress: 10,
    paused: 3,
    completed: 8,
    blocked: 4,
  };

  it('should render all stats cards', () => {
    render(<Dashboard stats={mockStats} />);

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Em Andamento')).toBeInTheDocument();
    expect(screen.getByText('Pausados')).toBeInTheDocument();
    expect(screen.getByText('Bloqueados')).toBeInTheDocument();
    expect(screen.getByText('Concluídos')).toBeInTheDocument();
  });

  it('should display correct values', () => {
    render(<Dashboard stats={mockStats} />);

    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should apply correct grid layout', () => {
    const { container } = render(<Dashboard stats={mockStats} />);

    const gridContainer = container.firstChild;
    expect(gridContainer).toHaveClass('grid', 'gap-4', 'md:grid-cols-2', 'lg:grid-cols-5');
  });
});

describe('StatsCard', () => {
  it('should render with basic props', () => {
    render(
      <StatsCard
        title="Test Card"
        value={42}
        icon={<div data-testid="test-icon">📊</div>}
      />
    );

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('should apply correct color classes', () => {
    const { container } = render(
      <StatsCard
        title="Blue Card"
        value={100}
        icon={<div>🔵</div>}
        color="blue"
      />
    );

    const card = container.firstChild;
    expect(card).toHaveClass(
      'bg-gradient-to-br',
      'from-blue-50',
      'to-blue-100',
      'border-blue-200'
    );
  });

  it('should show trend indicator when provided', () => {
    render(
      <StatsCard
        title="Trending Up"
        value={50}
        icon={<div>📈</div>}
        trend="up"
      />
    );

    expect(screen.getByText('↗')).toBeInTheDocument();
    expect(screen.getByText('↗')).toHaveClass('text-green-600');
  });

  it('should show down trend indicator', () => {
    render(
      <StatsCard
        title="Trending Down"
        value={30}
        icon={<div>📉</div>}
        trend="down"
      />
    );

    expect(screen.getByText('↘')).toBeInTheDocument();
    expect(screen.getByText('↘')).toHaveClass('text-red-600');
  });

  it('should handle string values', () => {
    render(
      <StatsCard
        title="String Value"
        value="Active"
        icon={<div>✅</div>}
      />
    );

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should not show trend indicator when trend is none', () => {
    render(
      <StatsCard
        title="No Trend"
        value={0}
        icon={<div>📊</div>}
        trend="none"
      />
    );

    expect(screen.queryByText('↗')).not.toBeInTheDocument();
    expect(screen.queryByText('↘')).not.toBeInTheDocument();
  });
});
