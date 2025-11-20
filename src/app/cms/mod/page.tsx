"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardEdit, BarChart3, Sparkles, ArrowRight, Users, Activity, Clock } from "lucide-react";
import type { ModOperator, ModActivity } from "@/lib/mod-types";

type TabId = "registro" | "analise" | "futuro";

export default function ModCMSPage() {
  const [activeTab, setActiveTab] = useState<TabId>("registro");
  const [operators, setOperators] = useState<ModOperator[]>([]);
  const [activities, setActivities] = useState<ModActivity[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setMetricsLoading(true);

        const [opsRes, actRes] = await Promise.all([
          fetch("/api/mod/operators", { cache: "no-store" }),
          fetch("/api/mod/activities", { cache: "no-store" }),
        ]);

        if (!cancelled) {
          if (opsRes.ok) {
            const json = await opsRes.json();
            if (json?.success && Array.isArray(json.data)) {
              setOperators(json.data as ModOperator[]);
            }
          }

          if (actRes.ok) {
            const json = await actRes.json();
            if (json?.success && Array.isArray(json.data)) {
              setActivities(json.data as ModActivity[]);
            }
          }
        }
      } catch {
        // falha silenciosa: painel MOD continua carregando normalmente
      } finally {
        if (!cancelled) setMetricsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => {
    const ativos = operators.filter((op) => op.isActive !== false).length;
    const emAndamento = activities.filter((a) => !a.endedAt).length;

    const hoje = new Date().toISOString().slice(0, 10);
    const atividadesHoje = activities.filter((a) => a.startedAt?.startsWith(hoje)).length;

    const ultimasAtividades = activities.slice(0, 4);

    return { ativos, emAndamento, atividadesHoje, ultimasAtividades };
  }, [operators, activities]);

  const handleRunModAssistant = async () => {
    try {
      setAiLoading(true);
      setAiResponse(null);

      const summary = `Operadores ativos: ${metrics.ativos}. Atividades em andamento: ${metrics.emAndamento}. Atividades hoje: ${metrics.atividadesHoje}.`;

      const res = await fetch("/api/ai/orchestrator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "Você é um assistente de otimização MOD da Bluwe Cosméticos. Analise dados de operadores e atividades MOD e sugira melhorias de eficiência, alocação e fluxo.",
            },
            {
              role: "user",
              content:
                "Com base nos dados a seguir, faça uma análise de gargalos, riscos e oportunidades de melhoria no módulo MOD, em linguagem objetiva e acionável. Dados: " +
                summary,
            },
          ],
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json) {
        setAiResponse("Não foi possível obter uma resposta do assistente MOD agora.");
        return;
      }

      // Tenta formatos comuns de resposta; se não achar, mostra o JSON bruto
      const result = json.result ?? json;
      let text: string | null = null;

      if (typeof result === "string") {
        text = result;
      } else if (result?.choices?.[0]?.message?.content) {
        text = result.choices[0].message.content as string;
      } else if (result?.output_text) {
        text = result.output_text as string;
      }

      setAiResponse(text ?? JSON.stringify(result, null, 2));
    } catch {
      setAiResponse("Erro ao contatar o assistente MOD.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Cabeçalho Central MOD */}
      <section className="space-y-1">
        <p className="text-[11px] uppercase tracking-[0.3em] text-sky-600/80">Módulo MOD</p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">Central MOD</h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Visão geral das operações MOD, com acesso rápido a registro de produção e análise de desempenho.
        </p>
      </section>

      {/* Métricas rápidas MOD */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Operadores ativos"
          value={metricsLoading ? "--" : metrics.ativos}
          icon={<Users className="h-4 w-4" />}
          accent="from-sky-500/30 to-sky-500/5"
        />
        <MetricCard
          label="Atividades em andamento"
          value={metricsLoading ? "--" : metrics.emAndamento}
          icon={<Activity className="h-4 w-4" />}
          accent="from-emerald-400/40 to-emerald-400/10"
        />
        <MetricCard
          label="Atividades hoje"
          value={metricsLoading ? "--" : metrics.atividadesHoje}
          icon={<Clock className="h-4 w-4" />}
          accent="from-indigo-400/40 to-indigo-400/10"
        />
      </section>

      {/* Timeline compacta das últimas atividades */}
      {metrics.ultimasAtividades.length > 0 && (
        <section className="rounded-2xl border border-sky-100 bg-white/70 backdrop-blur-sm p-4 space-y-3 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Atividades recentes</p>
              <p className="text-sm text-slate-700">Últimos registros de atuação MOD</p>
            </div>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {metrics.ultimasAtividades.map((a) => (
              <li
                key={a.id}
                className="flex items-start gap-2 border-b border-slate-100 pb-2 last:border-0 last:pb-0 hover:bg-slate-50/70 rounded-md px-1 -mx-1 transition-colors"
              >
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{a.description}</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {a.operatorName || "Operador"} • {a.type}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Assistente MOD (IA) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-sky-100 bg-white/80 backdrop-blur-sm p-4 space-y-3 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-sky-600/80">Assistente MOD</p>
              <p className="text-sm text-slate-700">
                Utilize a IA para analisar rapidamente o cenário atual de MOD e receber sugestões de eficiência.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRunModAssistant}
              disabled={aiLoading}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-600 text-white hover:bg-sky-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {aiLoading ? "Analisando..." : "Rodar análise"}
            </button>
          </div>
          {aiResponse && (
            <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3 max-h-64 overflow-auto text-xs text-slate-700 whitespace-pre-wrap">
              {aiResponse}
            </div>
          )}
        </div>
      </section>

      {/* Abas */}
      <div className="border-b border-sky-100 bg-white/70 backdrop-blur-sm rounded-xl px-3 pt-2 mt-2">
        <nav className="flex gap-2" aria-label="Abas de MOD">
          <button
            type="button"
            onClick={() => setActiveTab("registro")}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors
              ${
                activeTab === "registro"
                  ? "border-sky-500 text-sky-700 bg-sky-50"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }
            `}
          >
            <ClipboardEdit className="h-4 w-4" />
            <span>Registro</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analise")}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors
              ${
                activeTab === "analise"
                  ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }
            `}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Análise</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("futuro")}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors
              ${
                activeTab === "futuro"
                  ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }
            `}
          >
            <Sparkles className="h-4 w-4" />
            <span>Futuras funções</span>
          </button>
        </nav>
      </div>

      {/* Conteúdo das abas */}
      <section className="mt-3 grid gap-4 lg:grid-cols-3">
        {activeTab === "registro" && (
          <div className="lg:col-span-2 rounded-2xl border border-sky-100 bg-white/80 backdrop-blur-sm p-6 space-y-3 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
              <ClipboardEdit className="h-4 w-4 text-sky-600" />
              Registro de Produção Manual
            </h2>
            <p className="text-sm text-slate-600">
              Acesse o formulário completo de registro de produção manual para lançar ordens, operadores,
              quantidade produzida e observações em tempo real.
            </p>
            <div>
              <Link
                href="/mod-entry"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-sky-600 text-white hover:bg-sky-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                Ir para Registro MOD
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {activeTab === "analise" && (
          <div className="lg:col-span-2 rounded-2xl border border-sky-100 bg-white/80 backdrop-blur-sm p-6 space-y-3 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
              Análise de Performance MOD
            </h2>
            <p className="text-sm text-slate-600">
              Veja indicadores detalhados por operador, eficiência por categoria, taxa de aprovação e
              métricas de desenvolvimento.
            </p>
            <div>
              <Link
                href="/mod-analysis"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                Ir para Análise MOD
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {activeTab === "futuro" && (
          <div className="lg:col-span-3 rounded-2xl border border-dashed border-sky-200 bg-sky-50/80 p-6 text-sm text-slate-600 space-y-2 shadow-inner hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-emerald-100 p-1">
                <Sparkles className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <p>
                  Aqui você poderá adicionar, no futuro, novas ferramentas para o time MOD
                  (ex.: gestão de turnos, metas por célula, integrações com apontamentos, checklists, etc.).
                </p>
                <p className="text-xs text-slate-500">
                  Esta aba é apenas informativa por enquanto – nenhuma funcionalidade foi removida do sistema
                  atual.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white/80 shadow-lg p-4 flex items-center gap-3 transform transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
      <div className={`rounded-xl bg-gradient-to-br ${accent} text-slate-900 p-3 shadow-inner`}>{icon}</div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">{label}</p>
        <p className="text-xl font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

