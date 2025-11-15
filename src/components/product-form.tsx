'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { apiFetch } from '@/lib/api-fetch';

interface ProductFormProps {
  onProductCreated: () => void;
}

export function ProductForm({ onProductCreated }: ProductFormProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    family: '',
    op: '',
    batch: '',
    quantity: '',
    image: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastAttempt, setLastAttempt] = useState<{
    name: string;
    family: string;
    op: string;
    batch: string;
    quantity: number;
    image?: string;
  } | null>(null);

  // Pré-visualização de baldes (18kg por balde)
  const capacity = 18;
  const qtyNumber = parseFloat(formData.quantity || '0');
  const fullBuckets = Number.isFinite(qtyNumber) && qtyNumber > 0 ? Math.floor(qtyNumber / capacity) : 0;
  const remainder = Number.isFinite(qtyNumber) && qtyNumber > 0 ? +(qtyNumber % capacity).toFixed(2) : 0;
  const previewBuckets = Array.from({ length: fullBuckets + (remainder > 0 ? 1 : 0) }, (_, i) => {
    const isLast = i === fullBuckets + (remainder > 0 ? 1 : 0) - 1;
    const weight = isLast && remainder > 0 ? remainder : capacity;
    return { index: i + 1, weight };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Validação básica
    if (!formData.name.trim() || !formData.family.trim() || !formData.op.trim() || !formData.batch.trim() || !formData.quantity.trim()) {
      showToast('Todos os campos são obrigatórios', 'error');
      return;
    }

    const quantity = parseFloat(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      showToast('Quantidade deve ser um número positivo', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📝 FORM: Enviando dados:', formData);

      const payload = {
        name: formData.name.trim(),
        family: formData.family.trim(),
        op: formData.op.trim(),
        batch: formData.batch.trim(),
        quantity: quantity,
        image: formData.image.trim() || undefined
      };
      setLastAttempt(payload);

      const result = await apiFetch<{ success: boolean; data?: unknown; error?: string; details?: string }>(
        '/api/products',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          timeoutMs: 25000,
          retries: 3,
          retryDelayMs: 800,
        }
      );

      console.log('📝 FORM: Resposta da API:', result);

      if (!result || !result.success) {
        const msg = (result && (result.error || result.details)) || 'Falha ao criar produto';
        throw new Error(msg);
      }

      console.log('📝 FORM: Produto criado com sucesso!');

      // Reset form
      setFormData({
        name: '',
        family: '',
        op: '',
        batch: '',
        quantity: '',
        image: ''
      });

      setLastError(null);
      setLastAttempt(null);

      // Notificar componente pai
      onProductCreated();
      showToast('Produto criado com sucesso!', 'success');

    } catch (error) {
      console.error('📝 FORM: Erro:', error);
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      setLastError(message);
      showToast(`Erro ao criar produto: ${message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = async () => {
    if (!lastAttempt || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await apiFetch<{ success: boolean; data?: unknown; error?: string; details?: string }>(
        '/api/products',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lastAttempt),
          timeoutMs: 25000,
          retries: 3,
          retryDelayMs: 800,
        }
      );
      if (!result || !result.success) {
        const msg = (result && (result.error || result.details)) || 'Falha ao criar produto';
        throw new Error(msg);
      }
      showToast('Produto criado com sucesso!', 'success');
      onProductCreated();
      setLastError(null);
      setLastAttempt(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      setLastError(message);
      showToast(`Erro ao criar produto: ${message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full bg-white border border-slate-200 shadow-sm">
      <CardHeader className="bg-white">
        <CardTitle className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Criar novo produto
          </span>
          <span className="text-xs text-slate-500">Os campos com * são obrigatórios</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-white">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input id="name" type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Ex.: Máscara Capilar Reconstrutora" required />
              </div>
              <div>
                <Label htmlFor="family">Família *</Label>
                <Input id="family" type="text" value={formData.family} onChange={(e) => setFormData(prev => ({ ...prev, family: e.target.value }))} placeholder="Ex.: Linha Pink, Linha SkinCare" required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="op">Ordem de Produção (OP) *</Label>
                <Input id="op" type="text" value={formData.op} onChange={(e) => setFormData(prev => ({ ...prev, op: e.target.value }))} placeholder="Ex.: OP001" required />
              </div>
              <div>
                <Label htmlFor="batch">Lote *</Label>
                <Input id="batch" type="text" value={formData.batch} onChange={(e) => setFormData(prev => ({ ...prev, batch: e.target.value }))} placeholder="Ex.: L001" required />
              </div>
              <div>
                <Label htmlFor="quantity">Quantidade (kg) *</Label>
                <Input id="quantity" type="number" step="0.01" value={formData.quantity} onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))} placeholder="Ex.: 180" required />
                <p className="text-[11px] text-slate-500 mt-1">A cada {capacity}kg é gerado 1 balde automaticamente.</p>
              </div>
            </div>
            <div>
              <Label htmlFor="image">URL da Imagem (opcional)</Label>
              <Input id="image" type="url" value={formData.image} onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))} placeholder="https://exemplo.com/imagem.jpg" />
              <p className="text-[11px] text-slate-500 mt-1">Utilize uma imagem ilustrativa do produto, se disponível.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Pré-visualização de baldes</h4>
              {qtyNumber > 0 ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Capacidade do balde</span>
                    <span className="font-semibold text-slate-800">{capacity} kg</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Balde(s) gerado(s)</span>
                    <span className="font-semibold text-slate-800">{previewBuckets.length}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {previewBuckets.map(b => (
                      <div key={b.index} className="px-2.5 py-1.5 rounded-full text-xs border bg-gradient-to-b from-slate-100 to-white text-slate-700 border-slate-200 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
                        <span className="font-semibold">#{b.index}</span> • {b.weight.toFixed(2)}kg
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500">Informe a quantidade para visualizar os baldes que serão gerados.</p>
              )}
            </div>
            <Button type="submit" className="w-full bg-blue-800 hover:bg-blue-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Produto
                </>
              )}
            </Button>
            {lastError && (
              <Button type="button" variant="outline" className="w-full" disabled={isSubmitting} onClick={handleRetry}>
                Tentar novamente
              </Button>
            )}
            <p className="text-[11px] text-slate-500 text-center">Os baldes serão gerados automaticamente após a criação.</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
