import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductForm } from '@/components/product-form';

// Mock do módulo product-operations
jest.mock('@/lib/product-operations', () => ({
  createProduct: jest.fn(),
}));

import { createProduct } from '@/lib/product-operations';
const mockCreateProduct = createProduct as jest.MockedFunction<typeof createProduct>;

describe('ProductForm', () => {
  const mockOnProductCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form fields correctly', () => {
    render(<ProductForm onProductCreated={mockOnProductCreated} />);

    expect(screen.getByLabelText(/nome do produto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ordem de produção/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/lote/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantidade/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar produto/i })).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<ProductForm onProductCreated={mockOnProductCreated} />);

    const submitButton = screen.getByRole('button', { name: /criar produto/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('OP é obrigatória')).toBeInTheDocument();
      expect(screen.getByText('Lote é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Quantidade é obrigatória')).toBeInTheDocument();
    });
  });

  it('should validate field lengths', async () => {
    const user = userEvent.setup();
    render(<ProductForm onProductCreated={mockOnProductCreated} />);

    const nameInput = screen.getByLabelText(/nome do produto/i);
    const opInput = screen.getByLabelText(/ordem de produção/i);
    const batchInput = screen.getByLabelText(/lote/i);

    await user.type(nameInput, 'A');
    await user.type(opInput, 'A');
    await user.type(batchInput, 'A');

    const submitButton = screen.getByRole('button', { name: /criar produto/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Nome deve ter pelo menos 2 caracteres')).toBeInTheDocument();
      expect(screen.getByText('OP deve ter pelo menos 2 caracteres')).toBeInTheDocument();
      expect(screen.getByText('Lote deve ter pelo menos 2 caracteres')).toBeInTheDocument();
    });
  });

  it('should validate OP format (alphanumeric only)', async () => {
    const user = userEvent.setup();
    render(<ProductForm onProductCreated={mockOnProductCreated} />);

    const opInput = screen.getByLabelText(/ordem de produção/i);
    await user.type(opInput, 'OP-001!');

    const submitButton = screen.getByRole('button', { name: /criar produto/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('OP deve conter apenas letras e números')).toBeInTheDocument();
    });
  });

  it('should validate quantity as positive number', async () => {
    const user = userEvent.setup();
    render(<ProductForm onProductCreated={mockOnProductCreated} />);

    const quantityInput = screen.getByLabelText(/quantidade/i);
    await user.type(quantityInput, '-10');

    const submitButton = screen.getByRole('button', { name: /criar produto/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Quantidade deve ser um número positivo')).toBeInTheDocument();
    });
  });

  it('should validate quantity maximum value', async () => {
    const user = userEvent.setup();
    render(<ProductForm onProductCreated={mockOnProductCreated} />);

    const quantityInput = screen.getByLabelText(/quantidade/i);
    await user.type(quantityInput, '15000');

    const submitButton = screen.getByRole('button', { name: /criar produto/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Quantidade muito alta (máx: 10.000kg)')).toBeInTheDocument();
    });
  });

  it('should clear field errors when user starts typing', async () => {
    const user = userEvent.setup();
    render(<ProductForm onProductCreated={mockOnProductCreated} />);

    const nameInput = screen.getByLabelText(/nome do produto/i);

    // Trigger validation error
    const submitButton = screen.getByRole('button', { name: /criar produto/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
    });

    // Clear error by typing
    await user.type(nameInput, 'Test Product');

    await waitFor(() => {
      expect(screen.queryByText('Nome é obrigatório')).not.toBeInTheDocument();
    });
  });

  it('should submit form successfully', async () => {
    const user = userEvent.setup();
    mockCreateProduct.mockResolvedValue({
      success: true,
      data: {
        id: '1',
        name: 'Test Product',
        op: 'OP001',
        batch: 'L001',
        quantity: 100,
        currentStage: 'producao_1kg',
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stagesHistory: [],
        hourlyControls: [],
      },
    });

    render(<ProductForm onProductCreated={mockOnProductCreated} />);

    // Fill form
    await user.type(screen.getByLabelText(/nome do produto/i), 'Test Product');
    await user.type(screen.getByLabelText(/ordem de produção/i), 'OP001');
    await user.type(screen.getByLabelText(/lote/i), 'L001');
    await user.type(screen.getByLabelText(/quantidade/i), '100');

    const submitButton = screen.getByRole('button', { name: /criar produto/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateProduct).toHaveBeenCalledWith({
        name: 'Test Product',
        op: 'OP001',
        batch: 'L001',
        quantity: 100,
      });
    });

    await waitFor(() => {
      expect(mockOnProductCreated).toHaveBeenCalled();
    });
  });

  it('should handle duplicate product error', async () => {
    const user = userEvent.setup();
    mockCreateProduct.mockResolvedValue({
      success: false,
      error: 'Produto duplicado',
      details: 'Unique constraint failed',
    });

    render(<ProductForm onProductCreated={mockOnProductCreated} />);

    // Fill and submit form
    await user.type(screen.getByLabelText(/nome do produto/i), 'Test Product');
    await user.type(screen.getByLabelText(/ordem de produção/i), 'OP001');
    await user.type(screen.getByLabelText(/lote/i), 'L001');
    await user.type(screen.getByLabelText(/quantidade/i), '100');

    const submitButton = screen.getByRole('button', { name: /criar produto/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Já existe um produto com esta OP e Lote. Verifique os dados.')).toBeInTheDocument();
    });

    expect(mockOnProductCreated).not.toHaveBeenCalled();
  });

  it('should handle server error', async () => {
    const user = userEvent.setup();
    mockCreateProduct.mockRejectedValue(new Error('Server error'));

    render(<ProductForm onProductCreated={mockOnProductCreated} />);

    // Fill and submit form
    await user.type(screen.getByLabelText(/nome do produto/i), 'Test Product');
    await user.type(screen.getByLabelText(/ordem de produção/i), 'OP001');
    await user.type(screen.getByLabelText(/lote/i), 'L001');
    await user.type(screen.getByLabelText(/quantidade/i), '100');

    const submitButton = screen.getByRole('button', { name: /criar produto/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Erro interno do servidor. Tente novamente.')).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    // Mock a delayed response
    mockCreateProduct.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true, data: {
        id: '1',
        name: 'Test Product',
        op: 'OP001',
        batch: 'L001',
        quantity: 100,
        currentStage: 'producao_1kg',
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stagesHistory: [],
        hourlyControls: [],
      } }), 100))
    );

    render(<ProductForm onProductCreated={mockOnProductCreated} />);

    // Fill and submit form
    await user.type(screen.getByLabelText(/nome do produto/i), 'Test Product');
    await user.type(screen.getByLabelText(/ordem de produção/i), 'OP001');
    await user.type(screen.getByLabelText(/lote/i), 'L001');
    await user.type(screen.getByLabelText(/quantidade/i), '100');

    const submitButton = screen.getByRole('button', { name: /criar produto/i });
    await user.click(submitButton);

    // Check loading state
    expect(screen.getByText(/criando/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByText(/criando/i)).not.toBeInTheDocument();
    });
  });

  it('should clear form after successful submission', async () => {
    const user = userEvent.setup();
    mockCreateProduct.mockResolvedValue({
      success: true,
      data: {
        id: '1',
        name: 'Test Product',
        op: 'OP001',
        batch: 'L001',
        quantity: 100,
        currentStage: 'producao_1kg',
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stagesHistory: [],
        hourlyControls: [],
      },
    });

    render(<ProductForm onProductCreated={mockOnProductCreated} />);

    // Fill form
    const nameInput = screen.getByLabelText(/nome do produto/i);
    const opInput = screen.getByLabelText(/ordem de produção/i);
    const batchInput = screen.getByLabelText(/lote/i);
    const quantityInput = screen.getByLabelText(/quantidade/i);

    await user.type(nameInput, 'Test Product');
    await user.type(opInput, 'OP001');
    await user.type(batchInput, 'L001');
    await user.type(quantityInput, '100');

    const submitButton = screen.getByRole('button', { name: /criar produto/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(nameInput).toHaveValue('');
      expect(opInput).toHaveValue('');
      expect(batchInput).toHaveValue('');
      expect(quantityInput).toHaveValue('');
    });
  });
});
