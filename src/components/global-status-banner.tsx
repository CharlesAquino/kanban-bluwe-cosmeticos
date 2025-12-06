"use client";
import React, { useEffect, useState } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { useGlobalData, useGlobalActions } from "@/contexts/global-context";
import { Button } from "@/components/ui/button";

export default function GlobalStatusBanner() {
  const { loading, error } = useGlobalData();
  const { refreshData } = useGlobalActions();

  const [stalled, setStalled] = useState(false);

  useEffect(() => {
    if (!loading) {
      setStalled(false);
      return;
    }
    const t = setTimeout(() => setStalled(true), 30000);
    return () => clearTimeout(t);
  }, [loading]);

  if (!loading && !error) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      {loading && (
        <div className="flex items-center justify-between rounded-lg border p-3 bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-2 text-yellow-800">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Carregando dados globais...</span>
          </div>
          {stalled && (
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-4 w-4" />
              <span>Carregamento mais lento que o esperado.</span>
              <Button variant="outline" size="sm" onClick={refreshData}>
                Tentar novamente
              </Button>
            </div>
          )}
        </div>
      )}
      {error && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border p-3 bg-red-50 border-red-200 text-red-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Falha ao carregar dados: {error}</span>
          </div>
          <Button variant="destructive" size="sm" onClick={refreshData}>
            Recarregar
          </Button>
        </div>
      )}
    </div>
  );
}
