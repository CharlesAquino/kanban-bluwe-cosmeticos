"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Pencil } from "lucide-react";
import type { Product } from "@/lib/types";
import { apiFetch } from "@/lib/api-fetch";
import { useToast } from "@/components/ui/toast";

interface Operator {
  id: string;
  name: string;
  role?: string | null;
  isActive?: boolean | null;
}

interface ProductEditDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function ProductEditDialog({ product, open, onOpenChange, onSaved }: ProductEditDialogProps) {
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [family, setFamily] = useState("");
  const [op, setOp] = useState("");
  const [batch, setBatch] = useState("");
  const [quantity, setQuantity] = useState("");
  const [createdById, setCreatedById] = useState("");
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !product) return;

    setName(product.name || "");
    setFamily((product as any).family || "");
    setOp(product.op || "");
    setBatch(product.batch || "");
    setQuantity(String(product.quantity ?? ""));
    setCreatedById(product.createdById || "");

    const loadOperators = async () => {
      try {
        const res = await fetch("/api/mod/operators");
        if (!res.ok) return;
        const json = await res.json();
        if (json?.success && Array.isArray(json.data)) {
          setOperators(json.data as Operator[]);
        }
      } catch {
        // falha silenciosa - edição continua funcionando sem lista de MOD
      }
    };

    loadOperators();
  }, [open, product]);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!name.trim() || !op.trim() || !batch.trim() || !quantity.trim()) {
      showToast("Preencha todos os campos obrigatórios", "error");
      return;
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      showToast("Quantidade deve ser um número positivo", "error");
      return;
    }

    setLoading(true);

    try {
      const body: any = {
        name: name.trim(),
        op: op.trim(),
        batch: batch.trim(),
        quantity: qty,
      };

      if (family.trim()) {
        body.family = family.trim();
      }
      if (createdById) {
        body.createdById = createdById;
      }

      const result = await apiFetch<{ success: boolean; data?: unknown; error?: string; details?: string }>(
        `/api/products/${(product as any).id ?? (product as any).productId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          timeoutMs: 25000,
          retries: 2,
          retryDelayMs: 800,
        }
      );

      if (!result || !result.success) {
        const msg = (result && (result.error || result.details)) || "Falha ao atualizar produto";
        throw new Error(msg);
      }

      showToast("Produto atualizado com sucesso", "success");
      onSaved();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      showToast(`Erro ao atualizar produto: ${message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Editar produto
          </DialogTitle>
        </DialogHeader>
        <Card className="border-0 shadow-none">
          <CardContent className="p-0 pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Nome do Produto *</Label>
                  <Input
                    id="edit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-family">Família</Label>
                  <Input
                    id="edit-family"
                    value={family}
                    onChange={(e) => setFamily(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-op">OP *</Label>
                  <Input
                    id="edit-op"
                    value={op}
                    onChange={(e) => setOp(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-batch">Lote *</Label>
                  <Input
                    id="edit-batch"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-quantity">Quantidade (kg) *</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    step="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>MOD Responsável</Label>
                <Select
                  value={createdById}
                  onValueChange={(value) => setCreatedById(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um colaborador MOD" />
                  </SelectTrigger>
                  <SelectContent>
                    {operators
                      .filter((op) => op.isActive !== false)
                      .map((op) => (
                        <SelectItem key={op.id} value={op.id}>
                          {op.name} {op.role ? `(${op.role})` : ""}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar alterações"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
